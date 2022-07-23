import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarId } from '../helpers/tokens.js';


//-------------------------//

const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

//--------------------------//

const formularioRegistro = (req, res) =>{
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}


//-------------------------//

const registrar = async (req, res) => {
    //Validacion de formularios
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('El email no es valido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres').run(req)
    await check('repetir_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('El password no coincide');
        }
        return value;
    }
    ).run(req)

    let resultado = validationResult(req); //se ejecutan los await uno por uno antes de esta linea de codigo

    //return res.json(resultado.array());
    
    //Verificar que el resultado esté vacio o si no mostrar alerta
    if(!resultado.isEmpty()) {
        //Errores de validacion
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }
            
    
    //Extraer los datos 
    const { nombre, email, password } = req.body;


    //Verificar que el usuario no esté duplicado 
    const existeUsuario = await Usuario.findOne({ where: { email}})
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{ msg: 'El usuario ya está registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    //Almacenar un usuario 
    await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })


    //Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada correctamente',
        mensaje: 'Por favor verifique su correo para activar su cuenta',

    })

}


//-------------------------//

const formularioOlvidePassword = (req, res) =>{
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices'
    })
}


//-------------------------//

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword
}