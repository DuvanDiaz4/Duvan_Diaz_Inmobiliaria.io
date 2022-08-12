import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarId } from '../helpers/tokens.js';
import { emailRegistro } from '../helpers/emails.js';

//-------------------------//

const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

//--------------------------//

const formularioRegistro = (req, res) =>{

    console.log(req.csrfToken())
    
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
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
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario ya está registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    //Almacenar un usuario 
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Enviar el email de confirmacion
    emailRegistro({
        nombre:  usuario.nombre, 
        email:   usuario.email,
        token:   usuario.token
    })


    //Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada correctamente',
        mensaje: 'Por favor verifique su correo para activar su cuenta',

    })

}

//Funcion que comprueba una cuenta de usuario
const confirmar = async(req, res) => {

    //Extraer el token
    const { token } = req.params;

    //Verificar que el token es valido
    const usuario = await Usuario.findOne({ where: { token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta', 
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada', 
        mensaje: 'La cuenta se confirmó correctamente'
    })



    console.log(usuario)

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
    confirmar,
    formularioOlvidePassword
}