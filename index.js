//const express = require('express') //CommonJS
import express from 'express' //EMAC modules
import usuarioRoutes from './routes/usuarioRoutes.js'



//Crear la app
const app = express()

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