import express, { Router } from "express";
import { body } from 'express-validator';
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes } from "../controllers/propiedadController.js";
import  protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'


const router = express.Router();


//--------------RUTAS PROTEGIDAS----------------//

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ max: 200 }).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
    body('precio').isNumeric().withMessage('Selecciona una rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de Baños'),
    body('lng').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar 
    );

router.get('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    agregarImagen
);

router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
);

router.get('/propiedades/editar/:id', 
    protegerRuta,
    editar
);

router.post('/propiedades/editar/:id',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ max: 200 }).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
    body('precio').isNumeric().withMessage('Selecciona una rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de Baños'),
    body('lng').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios
    );

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
    );


router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)


//-----------------RUTAS PUBLICAS-----------------//
router.get('/propiedad/:id', 
    identificarUsuario,
    mostrarPropiedad
);


// Almacenar los mensajes en la base de datos
router.post('/propiedad/:id', 
    identificarUsuario,
    body('mensaje').isLength({min: 10 }).withMessage('El mensaje es obligatorio'),
    enviarMensaje
);

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)

export default router;