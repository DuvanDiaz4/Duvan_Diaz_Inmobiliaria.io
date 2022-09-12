(function() {


    const lat = 3.4258986;
    const lng = -76.5266211;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;

    //Utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //El pin del mapa
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa);

    //Detectar movimiento del pin
    marker.on('moveend', function(e){
        
        marker = e.target
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng)); //Donde se suelte el pin ahi se centrará el mapa

        //Obtener la direccion e info de las calles al soltar el pin 
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
            //console.log(resultado);

            //Globo encima del pin
            marker.bindPopup(resultado.address.LongLabel);
        })
    })


})()