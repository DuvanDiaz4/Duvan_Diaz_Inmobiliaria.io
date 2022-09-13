import express from "express";
import { body } from 'express-validator';
import { admin, crear, guardar } from "../controllers/propiedadController.js";
import  protegerRuta from '../middleware/protegerRuta.js'


const router = express.Router();


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

export default router;