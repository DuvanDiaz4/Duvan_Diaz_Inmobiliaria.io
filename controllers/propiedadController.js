import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Administra tus propiedades',
        barra: true
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
        barra: true,
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
            barra: true,
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



export {
    admin,
    crear, 
    guardar
}