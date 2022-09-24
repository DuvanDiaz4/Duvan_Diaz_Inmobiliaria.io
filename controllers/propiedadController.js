import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = async (req, res) => {

    //Leer QueryString
    const { pagina: paginaActual } = req.query
    
    //Expresion regular para buscar
    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try{

        const { id } = req.usuario

        //Limites y Offset para la paginacion
        const limit = 5
        const offset = ((paginaActual * limit) - limit)


        const [propiedades, total] = await Promise.all([
            
            Propiedad.findAll({ 
                limit,
                offset,
                where: {
                    usuarioId: id
                },
                include: [
                    {
                        model: Categoria, 
                        as: 'categoria'
                    },
                    {
                        model: Precio,
                        as: 'precio'
                    }
                ],
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        

        res.render('propiedades/admin', {
            pagina: 'Administra tus propiedades',
            propiedades, 
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
    })

    }catch(error){
        console.log(error);
    }

    
}

//Formulario para crear una nueva propiedad 
const crear = async(req, res) => {

    //ConsultarModelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]) 


    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        categorias: categorias,
        csrfToken: req.csrfToken(),
        precios: precios,
        datos: {}
    })
}



//Guarda la propiedad en la base de datos
const guardar = async(req, res) => {

        //Validacion de los campos
        let resultado = validationResult(req);

        if(!resultado.isEmpty()){

        //ConsultarModelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
        ]) 

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias: categorias,
            precios: precios,
            errores: resultado.array(),
            datos: req.body
        })
    }



    //Crear un Registro en la BD
    const { titulo, descripcion, habitaciones, estacionamiento, 
            wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

    const { id: usuarioId } = req.usuario

    try{
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones, 
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const { id } = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)

    }catch(error){
        console.log(error);
    }

}


//Agregar Imagen a la propiedad 
const agregarImagen = async (req, res) => {

    const { id } = req.params 

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no esté publicada 
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad pertenece a quien visitaesta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

   res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen:  ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
   })

}


//----------------------------------------//

//Almacenar la imagen en la propiedad
const almacenarImagen = async ( req, res, next) => {

    const { id } = req.params 

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no esté publicada 
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad pertenece a quien visitaesta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try{
        console.log(req.file);

        //Almacenar la imagen en el servidor y publicar la propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    }catch (error){
        console.log(error)
    }

}

//----------------------------------------//

const editar = async(req, res) => {

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    
    //Consultar Modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]) 


    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios: precios,
        datos: propiedad 
    })
}


const guardarCambios = async(req, res) => {

    //Validacion de los campos
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){

    //ConsultarModelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
    ]) 

    return res.render('propiedades/editar', {
        pagina: 'Editar Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        errores: resultado.array(),
        datos: req.body
    })
}

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Reescribir el objeto y actualizarlo
    try{

        const { titulo, descripcion, habitaciones, estacionamiento, 
        wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento, 
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        
        await propiedad.save();

        res.redirect('/mis-propiedades')

    }catch(error){
        console.log(error)
    }

}


const eliminar = async (req, res) => {

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Eliminar la imagen del servidor
    await unlink(`public/uploads/${propiedad.imagen}`)

    console.log(`Se eliminó la imagen ${propiedad.imagen}`);

    //Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')

}


//Muestra una propiedad en específico
const mostrarPropiedad = async(req, res) => {

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        
        include: [
            {
                model: Precio,
                as: 'precio'
            },
            {
                model: Categoria,
                as: 'categoria'
            }
        ]
    })

    if(!propiedad) {
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar', {                        
        propiedad, 
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken()
    })
}


export {
    admin,
    crear, 
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar, 
    mostrarPropiedad
}