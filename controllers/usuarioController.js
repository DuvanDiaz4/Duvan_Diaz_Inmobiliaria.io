import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarJWT, generarId } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';

//-------------1------------//

const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

//------------2------------//

const autenticar = async(req, res) => {

    //validacion de formularios
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('La Contraseña es obligatoria').run(req)


    let resultado = validationResult(req); //se ejecutan los await uno por uno antes de esta linea de codigo
    
    //Verificar que el resultado esté vacio o si no mostrar alerta
    if(!resultado.isEmpty()) {
        //Errores de validacion
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    
    const { email, password } = req.body;

    //Comprobar si el usuario existe 
    const usuario = await  Usuario.findOne({ where: { email }})
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }

    // comprobar si el usuario está confirmado 
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    } 

    //Verificar el password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
        })
    }

    //Autenticar al usuario JWT
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

    console.log(token);


    //Almacenar el token en cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        //secure: true //si tengo certificado SSH
    }).redirect('/mis-propiedades')

}


//-----------------3-----------------//
const cerrarSesion = (req, res) => {
    

    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


//-------------3-------------//

const formularioRegistro = (req, res) =>{

    console.log(req.csrfToken())
    
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}


//------------4-------------//

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

//------------5-------------//

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

//-------------6------------//

const formularioOlvidePassword = (req, res) =>{
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })
}


//-------------7------------//

const resetPassword = async (req, res) => {
    //validación
    await check('email').isEmail().withMessage('El email no es valido').run(req)

    let resultado = validationResult(req); //se ejecutan los await uno por uno antes de esta linea de codigo
    
    //Verificar que el resultado esté vacio o si no mostrar alerta
    if(!resultado.isEmpty()) {
        //Errores de validacion
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    
    //Buscar el usuario - si el usuario existe en la base de datos
    const { email } = req.body 

    const usuario = await Usuario.findOne({ where: { email }})

    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no pertenece a ningún usuario'}]
        })
    }

    //Generar un token
    usuario.token = generarId();
    await usuario.save();

    //Enviar un email 
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Contrasña',
        mensaje: 'Hemos enviado un email a tu correo electronico con las instrucciones',

    })

}


//-------------8------------//

const comprobarToken = async(req, res) => {
    
    const { token } = req.params;

    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Contraseña', 
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar contraseña
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu Contraseña',
        csrfToken: req.csrfToken()
    })

}

//-------------9------------//

const nuevoPassword = async(req, res) => {
    
    //validar password
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres').run(req)


    let resultado = validationResult(req); //se ejecutan los await uno por uno antes de esta linea de codigo
    
    //Verificar que el resultado esté vacio o si no mostrar alerta
    if(!resultado.isEmpty()) {
        //Errores de validacion
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }   
    
    const { token } = req.params
    const { password } = req.body    
    
    //identificar quien hace el cambio 
    const usuario = await Usuario.findOne ({where: {token}})


    //Hashear el nuevo password 
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña reestablecida',
        mensaje: 'Tu contraseña se ha reestablecido correctamente'
    })

}


//-------------------------//

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword, 
    resetPassword, 
    comprobarToken,
    nuevoPassword
}