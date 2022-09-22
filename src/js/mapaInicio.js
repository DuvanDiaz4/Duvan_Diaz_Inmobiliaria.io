(function(){

    const lat = 3.4258986;
    const lng = -76.5266211;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    const obtenerPropiedades = async() => {
        try{

            const url = '/api/propiedades';
            
        }catch (error){
            console.log(error)
        }
    }

    obtenerPropiedades();

})()