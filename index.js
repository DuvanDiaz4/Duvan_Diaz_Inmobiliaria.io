//const express = require('express') //CommonJS
import express from 'express' //EMAC modules
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'


//Crear la app
const app = express()

//Habllitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))



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
app.use('/auth', usuarioRoutes)


//Definir un puerto y arrancar el proyecto 
const port = 3000;

app.listen(port, () => {
    console.groupCollapsed(`El servidor esta funcionando en el puerto ${port}`)
});