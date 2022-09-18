import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = async (req, res) => {

    const { id } = req.usuario

    const propiedades = await Propiedad.findAll({ 
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
        ]
    })


    res.render('propiedades/admin', {
        pagina: 'Administra tus propiedades',
        propiedades, 
    })
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



export {
    admin,
    crear, 
    guardar,
    agregarImagen,
    almacenarImagen
}