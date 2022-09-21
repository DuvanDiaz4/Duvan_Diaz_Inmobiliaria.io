//const express = require('express') //CommonJS
import express from 'express' //EMAC modules
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import db from './config/db.js'


//Crear la app
const app = express()

//Habllitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))


//Habilitar cookie-parser
app.use(cookieParser() )


//Habilidar CSRF
app.use(csurf({cookie: true}))



//Conexión a la base de datos
try{
    await db.authenticate();
    db.sync() //crea la tabla en caso de que no esté creada 
    console.log('Conexion exitosa a la base de datos')
}catch(error) {
    console.log(error)
}



//Habilitar pug 
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta Pública
app.use( express.static('public'))


//Routing de la app - endpoints que soporta la app
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)


//Definir un puerto y arrancar el proyecto 
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.groupCollapsed(`El servidor esta funcionando en el puerto ${port}`)
});