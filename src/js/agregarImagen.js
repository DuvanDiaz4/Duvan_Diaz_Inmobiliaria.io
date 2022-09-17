import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


Dropzone.options.imagen = {
    dictDefaultMessage: 'Arrastra tus archivos o haz click aquí',
    acceptedFiles: '.jpg, .jpeg, .png',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Eliminar Archivo',
    dictMaxFilesExceeded: 'Solo puedes subir un archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this // dropzone es el objeto que contiene todo lo que se puede hacer con dropzone
        const btnPublicar = document.querySelector('#publicar')

        //Metodo para procesar los archivos, guardarlos en el servidor y publicar la propiedad cuando presione el boton publicar
        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue()
        })
        
        //Re direccion al usuario a la pagina de mis propiedades cuando ya se ha subido la imagen
        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length == 0) {
                window.location.href = '/mis-propiedades'
            }
        })
    
    }
}