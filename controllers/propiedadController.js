import Precio from '../models/Precio.js';
import Categoria from '../models/Categoria.js';

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
        precios: precios
    })
}

export {
    admin,
    crear
}