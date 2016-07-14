//funciones y ayudas del de paseo de fosas

function victima(nombre, apellido1, apellido2, sexo, edad, profesion, fechaFallecimiento, fechaInhumacion)
{
    this.nombre=nombre;
    this.apellido1=apellido1;
    this.apellido2=apellido2;
    this.sexo=sexo;
    this.edad=edad;
    this.profesion=profesion;
    this.fechaFallecimiento=fechaFallecimiento;
    this.fechaInhumacion=fechaInhumacion;

}//victima

function fosa(registro, tipoFosa, estadoActual,numeroPersonasFosa, numeroPersonasExhumadas, numeroPersonasIdentificadas, observaciones, listaVictimas)
{
    this.registro=registro;
    this.tipoFosa=tipoFosa;
    this.estadoActual=estadoActual;
    this.numeroPersonasFosa=numeroPersonasFosa;
    this.numeroPersonasExhumadas=numeroPersonasExhumadas;
    this.numeroPersonasIdentificadas=numeroPersonasIdentificadas;
    this.observaciones=observaciones;
    this.listaVictimas=listaVictimas;
 } // fosa

function localidad(nombre, latitud, longitud, numFosas, listaFosas)
{
this.nombre=nombre;
this.latitud=latitud;
this.longitud=longitud;
this.numFosas=numFosas;
this.listaFosas=listaFosas;
} //localidad

function zona(latitud, longitud, listaLocalidades)
{
    this.latitud=latitud;
    this.longitud=longitud;
    this.listaLocalidades=listaLocalidadades;
}//zona

function construyeListaVictimas(xmlFosa)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlVictima=xmlFosa.getElementsByTagName("victima");
   console.log("\victimas: " + xmlVictima.length); 
   var listaVisctimas= new Array();
   var  nombre; 
   var  apellido1;
   var  apellido2;
   var  sexo;
   var  edad;
   var  profesion;
   var  fechaFallecimiento;
   var  fechaInhumacion;
  
    for (i = 0; i <xmlVictima.length; i++) {  // para cada fosa                       
      nombre=xmlVictima[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
      apellido1=xmlVictima[i].getElementsByTagName("apellido1")[0].childNodes[0].nodeValue;
      apellido2=xmlVictima[i].getElementsByTagName("apellido2")[0].childNodes[0].nodeValue;
      sexo=xmlVictima[i].getElementsByTagName("sexo")[0].childNodes[0].nodeValue;
      edad=xmlVictima[i].getElementsByTagName("edad")[0].childNodes[0].nodeValue;
      profesion=xmlVictima[i].getElementsByTagName("profesion")[0].childNodes[0].nodeValue;
      fechaFallecimiento=xmlVictima[i].getElementsByTagName("fechaFallecimiento")[0].childNodes[0].nodeValue;
      fechaInhumacion=xmlVictima[i].getElementsByTagName("fechaInhumacion")[0].childNodes[0].nodeValue;

      var tempVictima=new victima(nombre, apellido1, apellido2, sexo, edad, profesion, fechaFallecimiento, fechaInhumacion);
      listaVictimas.push(tempVictima); 
     }

     return listaVictimas;

}//construyeListaVictimas


function construyeListaFosas(xmlLocalidad)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlFosa=xmlLocalidad.getElementsByTagName("fosa");
   console.log("\fosas: " + xmlFosa.length); 
   var listaFosas= new Array();

   var numRegistro;
   var tipoFosa;
   var estadoActual;
   var numeroPersonasFosa;
   var numeroPersonasExhumadas;
   var numeroPersonasIdentificadas
   var observaciones;
  
    for (i = 0; i <xmlFosa.length; i++) {  // para cada fosa                       
      numRegistro=xmlFosa[i].getElementsByTagName("numRegistro")[0].childNodes[0].nodeValue;
      tipoFosa=xmlFosa[i].getElementsByTagName("tipoFosa")[0].childNodes[0].nodeValue;
      estadoActual=xmlFosa[i].getElementsByTagName("estadoActual")[0].childNodes[0].nodeValue;
      numeroPersonasFosa=xmlFosa[i].getElementsByTagName("numeroPersonasFosa")[0].childNodes[0].nodeValue;
      numeroPersonasExhumadas=xmlFosa[i].getElementsByTagName("numeroPersonasExhumadas")[0].childNodes[0].nodeValue;
      numeroPersonasIdentificadas=xmlFosa[i].getElementsByTagName("numeroPersonasIdentificadas")[0].childNodes[0].nodeValue;
      observaciones=xmlFosa[i].getElementsByTagName("observaciones")[0].childNodes[0].nodeValue;

      //// ahora hay que leer todas las victimas de esta fosa
      var listaVictimas=construyeListaVictimas(xmlFosa);
      var tempFosa=new fosa(numRegistro, tipoFosa, estadoActual, numeroPersonasFosa, numeroPersonasExhumadas, numeroPersonasIdentificadas, observaciones, listaVictimas);
      listaFosas.push(tempFosa); 
     }

     return listaFosas;

} //construyeListaFosas(xmlLoc)

function construyeListaLocalidades(xmlZona)
{
   //ahora voy a recorrer las localidades de la zona  
   var xmlLoc=xmlZona.getElementsByTagName("localidad");
   console.log("\nlocalidades: " + xmlLoc.length); 
   var listaLocalidades= new Array();

    var locNombre;
    var locLatitud;
    var locLongitud;
    var numFosas;
  
    for (i = 0; i <xmlLoc.length; i++) {  // para cada localidad                       
      locNombre=xmlLoc[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
      lat_long=xmlLoc[i].getElementsByTagName("point")[0].childNodes[0].nodeValue;
      var arr = lat_long.split(" ");
      locLatitud=arr[0]/1; // con esto fuerzo la conversion numerica
      locLongitud=arr[1]/1; // con esto fuerzo la conversion numerica
      console.log("\nzona latitud:"+locLatitud+"longitud:"+locLongitud);  
      numFosas=xmlLoc[i].getElementsByTagName("numFosas")[0].childNodes[0].nodeValue;
      //// ahora hay que leer todas las fosas de esta localidad
      var listaFosas=construyeListaFosas(xmlLoc);
      var tempLocalidad=new localidad(locNombre, locLatitud, locLongitud, listaFosas);
      listaLocalidades.push(tempLocalidad); 
     }
     return listaLocalidades;

} //construyeListaLocalidades(xmlZona)


function construyeZona(xml) 
{
    var xmlDoc = xml.responseXML;
    var lat_long;
    var cLatitud;
    var cLongitud; 
    var xmlZona = xmlDoc.getElementsByTagName("zona");
    for (i = 0; i <xmlZona.length; i++) {  
      lat_long=xmlZona[i].getElementsByTagName("centro")[0].childNodes[0].nodeValue;
      var arr = lat_long.split(" ");
      cLatitud=arr[0]/1; // con esto fuerzo la conversion numerica
      cLongitud=arr[1]/1; // con esto fuerzo la conversion numerica
      console.log("\nzona latitud:"+cLatitud+"longitud:"+cLongitud);                          
    }//for  -- en realidad solo deberíamos tener un channel

    var listaLocalidades=construyeListaLocalidades(xmlZona);
    return new zona(cLatitud, cLongitud, listaLocalidades);
     
}//construyeZona 


//////////////////////////////////////
function nombreFicheroZona(latitud, longitud)
{
    // TODO: lo primero necesitarmos saber que fichero pedir,
    // si hacemos una cuadricula de 20Km de lado, podemos nombrar los ficheros a patir de
    // la latitud y longitud en la que estamos centrados.
    return "datos/propuesta_formato.xml"
}

function centroZona(latitud, longitud)
{
   //TODO: debe devolver un tipo Posicion indicando el centro de la zona que corresponde 
   return latitud==longitud;
}

function cambioZona(newLatitud, newLongitud, oldLatitud, oldLongitud)
{
    return (centroZona(newLatitud, newLongitud)==centroZona(oldLatitud, oldLongitud));
}

function cambioFosa()
{
    // TODO determinar si hay que activar una nueva fosa 
    // ¿CUAL ES LA MAS PRÓXIMA?
    // SI DISTANCIA ES MENOR QUE distancia_fosa_minima
     
    return false;
}

function cambiaFosa(newLatitud, newLongitud)
{
  // recorrer la lista de fosas cargada y buscar la más proxima
  // fosa.habla();
   
}

function cambiaPosicion(newLatitud, newLongitud)
{
    
   if (cambioZona(newLatitud, newLongitud/*, latitud, longitud*/))
    {
        // hay que cambiar las bolas indicativas de fosas.
        //actualizamos el nuevo centro
        /* TODO: esto aqui raro....
        pCentro=centro(newLatitud, newLongitud);
        map.setCenter(pCentro);
        ActualizaBolas(latitud, longitud);  
        */   
    } 
    else if (cambioFosa())
    {

        cambiaFosa(newLatitud, newLongitud);       
    }  
    

}//function cambiaPosicion


////////////////////////////////////////////////////////////////////
// ayudas matematicas 
  
function distanciaHarvesine(lat1, lon1, lat2, lon2)
{
    var R = 6378137; // metros
    var dLat = (lat2-lat1)*Math.PI/180;
    var dLon = (lon2-lon1)*Math.PI/180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var d = R * c;
    return d;
}
  
function distanciaAngular(lat1, lat2)
{
    var d = 6378137 * (lat2-lat1)*Math.PI/180;
    return d;//metros
}

function puntoEnCirculo(puntoLat, puntoLong, circuloLat, circuloLong, circuloRadio)
{
  //están dentro del circulo todos aquellos puntos cuya distancia al centro es menor que el radio.
  // eso lo calculamos con la funcion de Harvesine
  // Pero como en la mayoría de las consultas van a estar fuera, aceleramos los calculos los que esten fuera del
  // cuadros excrito
  if (distanciaAngular(puntoLat, circuloLat)>=circuloRadio) return false;
  if (distanciaAngular(puntoLong, circuloLong)>=circuloRadio) return false;

  if (distanciaHarvesine(puntoLat, puntoLong, circuloLat, circuloLong)>=circuloRadio) return false;
  else return true; 
  // si hay problemas de rendimiento, se pude simplificar y usar las dos distacias angulares
  // como si fueran cartesianas -->distancia=raiz(distanciaLat*distanciaLat + distanciaLon*distanciaLon);
  // porque los circulos van a ser siempre muy pequeños en esta aplicación.
}  

/////////////////////////////////////////////////////////////////
///// SONIDO SINTETICO
function habla(text) {
    // Create a new instance of SpeechSynthesisUtterance.
	var msg = new SpeechSynthesisUtterance();
  
    // Set the text.
	msg.text = text;
  
    // Set the attributes.
	msg.volume = 1.0;
	msg.rate = 1.0;
	msg.pitch = 1.0;
  
    // If a voice has been selected, find the voice and set the
    // utterance instance's voice attribute.
	msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == "native"; })[0];
	console.log(msg); 
    // Queue this utterance.
	window.speechSynthesis.speak(msg);
}