import { exit } from 'node:process';
import categorias from "./categorias.js";
import Categoria from "../models/Categoria.js";
import precios from "./precios.js";
import Precio from "../models/Precio.js";
import db from "../config/db.js";


//Cargar los datos de la base de datos
const importarDatos = async () => {
    try{
        //Autenticar la base de datos
        await db.authenticate();

        //Generar las columnas 
        await db.sync();

        //Insertar los datos //En vez de hacer 2 await, se puede hacer un Promise.all para que se ejecuten al mismo tiempo
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])

        console.log('Datos importados correctamente')
        exit()


    } catch (error){
        console.log(error);
        exit(1)
    }
}



//Eliminar los datos de la base de datos
const eliminarDatos = async () => {
    try{
        await Promise.all([
            Categoria.destroy({where: {}, truncate: true}),
            Precio.destroy({where: {}, truncate: true})
        ])

        console.log('Datos eliminados correctamente')
        exit();

    }catch(error){
        console.log(error)
        exit(1);
    }
}



//------------------Ejecutar el script------------------//

//Ejecutar la funcion de cargar datos
if(process.argv[2] == "-i") {
    importarDatos();
}

//Ejecutar la funcion de eliminar datos
if(process.argv[2] == "-e") {
    eliminarDatos();
}

