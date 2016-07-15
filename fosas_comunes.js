// variables globales de zona de fosas
var miZona=null; //es una variable de tipo zona que se construye con function construyeZona(xml) 

// Al no estar geolocalizadas las fosas, colocamos los marcadores en la posicion de la muy cerca unos de otros
// la distancia entre marcadores que en realidad se consideran en el mismo puento es esta variable deltaFosas
// deltaGrados=180*deltaKm/((RT=6371km)*PI  )
// Delta_Kilometros=((RT=6371km)*PI  )* Delta_grados/180
var deltaFosas=0.001125; //unos 125 metros

// para decidir que nos ponemos a contar la fosas de una localidad, puesto que no tenemos los polígonos
// hemos de tomar una decisión respecto a la distancia a la posicion puntual de esa localidad
// decidimos tomar unos 2Km, que segun la formula anterior corresponde aproximadamente a 0.018 grados
var deltaLocalidad=0.018;


//objetos que construyen la informacion de una zona: zona, localidad, fosas, victimas

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
    this.generaSpeech=function(){
       var speech=nombre+" "+apellido1+" "+apellido2+" de "+edad+" años ,"+ profesion + "fallece el "+fechaFallecimiento;
       if (fechaInhumacion) speech+="se inhuma el "+fechaInhumacion;
       speech+=".\n";
       return speech;
    }; //generaSpeech

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
    this.marcador=null;

    this.generaSpeech=function(){
      var speech="Fosa "/*+registro*/+" del tipo "+tipoFosa+", actualmente "+estadoActual+ ". Contiene ";
      if (numeroPersonasFosa==1){
        speech+="una persona ";
        if (numeroPersonasIdentificadas==1) speech+="identificada";
        else speech+="no identificada";
        if (numeroPersonasExhumadas==1) speech+=" y exhumada";
      }
      else {
        speech+=numeroPersonasFosa + " personas";
        if (numeroPersonasExhumadas>0) speech+=", de las cuales exhumadas: "+ numeroPersonasExhumadas;
        if (numeroPersonasIdentificadas>0) ", e identificadas: "+ numeroPersonasIdentificadas;      
      }
      speech+=".\n"+observaciones+"\n";
      for (var i=0; i<listaVictimas.length; i++)
      {
           speech+=listaVictimas[i].generaSpeech();
      }
       
      return speech;
    }; //generaSpeech
    
 } // fosa
;
function localidad(nombre, latitud, longitud, listaFosas)
{
    this.nombre=nombre;
    this.latitud=latitud;
    this.longitud=longitud;
    this.listaFosas=listaFosas;
    this.puntoEnEntorno = function(latitudPunto, longitudPunto) {
            if (Math.abs(latitud-latitudPunto) > deltaLocalidad) return false;
            if (Math.abs(longitud-longitudPunto) > deltaLocalidad) return false;
            return true;
        };//puntoEnEntorno

    this.generaSpeech=function(){
     var speech=nombre; 
      if (listaFosas.length==1) speech+=", tiene una fosa común.\n"; 
      else speech+=", tiene "+listaFosas.length+" fosas comunes.\n";
      for (var i=0; i<listaFosas.length; i++)
      {   
          speech+=listaFosas[i].generaSpeech();
          speech+="\n";   
      }// para cada fosa
      return speech;
  
    };//generaSpeech 
    this.animaMarcadores=function(){
       for (var i=0; i<listaFosas.lenght; i++){
          listaFosas[i].marcador.setAnimation(google.maps.Animation.BOUNCE);
       }
    };//animaMarcadores
    this.desanimaMarcadores=function(){
       for (var i=0; i<listaFosas.lenght; i++){
          listaFosas[i].marcador.setAnimation(null);
       }
    };//desanimaMarcadores

} //objeto localidad

function zona(latitud, longitud, listaLocalidades)
{
    this.latitud=latitud;
    this.longitud=longitud;
    this.listaLocalidades=listaLocalidades;
    this.localidadActual=null; // la funcion cambiaPosicion deberá actualizarla
    console.log("zona nueva:", this);
    this.buscaLocalidadEnEntorno = function(latitudPunto, longitudPunto)    {
        for (var i=0; i<listaLocalidades.length; i++){
         if (listaLocalidades[i].puntoEnEntorno(latitudPunto, longitudPunto)) return listaLocalidades[i];
        }
        return null;// esto es que no ha encontrado ninguna 
     };//buscaLocalidadEnEntorno
    
}//zona

function construyeListaVictimas(xmlFosa)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlVictima=xmlFosa.getElementsByTagName("victima");
   console.log("victimas: " + xmlVictima.length); 
   var listaVictimas= new Array();
   var  nombre; 
   var  apellido1;
   var  apellido2;
   var  sexo;
   var  edad;
   var  profesion;
   var  fechaFallecimiento;
   var  fechaInhumacion;
  
    for (var i = 0; i <xmlVictima.length; i++) {  // para cada fosa                       
      nombre=xmlVictima[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
      apellido1=xmlVictima[i].getElementsByTagName("apellido1")[0].childNodes[0].nodeValue;
      apellido2=xmlVictima[i].getElementsByTagName("apellido2")[0].childNodes[0].nodeValue;
      sexo=xmlVictima[i].getElementsByTagName("sexo")[0].childNodes[0].nodeValue;
      edad=xmlVictima[i].getElementsByTagName("edad")[0].childNodes[0].nodeValue;
      profesion=xmlVictima[i].getElementsByTagName("profesion")[0].childNodes[0].nodeValue;
      fechaFallecimiento=xmlVictima[i].getElementsByTagName("fechaFallecimiento")[0].childNodes[0].nodeValue;
      fechaInhumacion=xmlVictima[i].getElementsByTagName("fechaInhumacion")[0].childNodes[0].nodeValue;
      console.log("victima", nombre);
      var tempVictima=new victima(nombre, apellido1, apellido2, sexo, edad, profesion, fechaFallecimiento, fechaInhumacion);
      listaVictimas.push(tempVictima); 
     }

     return listaVictimas;

}//construyeListaVictimas


function construyeListaFosas(xmlLocalidad)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlFosa=xmlLocalidad.getElementsByTagName("fosa");
   console.log("fosas: " + xmlFosa.length); 
   var listaFosas= new Array();

   var numRegistro;
   var tipoFosa;
   var estadoActual;
   var numeroPersonasFosa;
   var numeroPersonasExhumadas;
   var numeroPersonasIdentificadas
   var observaciones;
  
    for (var i = 0; i <xmlFosa.length; i++) {  // para cada fosa   
      console.log("creando fosa i=", i, "de ",  xmlFosa.length);                    
      numRegistro=xmlFosa[i].getElementsByTagName("numRegistro")[0].childNodes[0].nodeValue;
      tipoFosa=xmlFosa[i].getElementsByTagName("tipoFosa")[0].childNodes[0].nodeValue;
      estadoActual=xmlFosa[i].getElementsByTagName("estadoActual")[0].childNodes[0].nodeValue;
      numeroPersonasFosa=xmlFosa[i].getElementsByTagName("numeroPersonasFosa")[0].childNodes[0].nodeValue;
      numeroPersonasExhumadas=xmlFosa[i].getElementsByTagName("numeroPersonasExhumadas")[0].childNodes[0].nodeValue;
      numeroPersonasIdentificadas=xmlFosa[i].getElementsByTagName("numeroPersonasIdentificadas")[0].childNodes[0].nodeValue;
      observaciones=xmlFosa[i].getElementsByTagName("observaciones")[0].childNodes[0].nodeValue;
      console.log("fosa ", numRegistro);
      //// ahora hay que leer todas las victimas de esta fosa
      var listaVictimas=construyeListaVictimas(xmlFosa[i]);
      var tempFosa=new fosa(numRegistro, tipoFosa, estadoActual, numeroPersonasFosa, numeroPersonasExhumadas, numeroPersonasIdentificadas, observaciones, listaVictimas);
      listaFosas.push(tempFosa); 
      console.log("creada la fosa i=", i, "de ",  xmlFosa.length);
     }

     return listaFosas;

} //construyeListaFosas(xmlLoc)

function construyeListaLocalidades(xmlZona)
{
   //ahora voy a recorrer las localidades de la zona  
   var xmlLoc=xmlZona.getElementsByTagName("localidad");
   console.log("localidades: " + xmlLoc.length); 
   var listaLocalidades= new Array();

    var locNombre;
    var locLatitud;
    var locLongitud;
  
    for (var i = 0; i <xmlLoc.length; i++) {  // para cada localidad    
      locNombre=xmlLoc[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
      var lat_long=xmlLoc[i].getElementsByTagName("point")[0].childNodes[0].nodeValue;
      var arr = lat_long.split(" ");
      locLatitud=arr[0]/1; // con esto fuerzo la conversion numerica
      locLongitud=arr[1]/1; // con esto fuerzo la conversion numerica
      //// ahora hay que leer todas las fosas de esta localidad
      console.log("localidad", locNombre);
      var listaFosas=construyeListaFosas(xmlLoc[i]);
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
    var listaLocalidades=null;
    var xmlZona = xmlDoc.getElementsByTagName("zona");//lista de zonas
    for (var i = 0; i <xmlZona.length; i++) {  
      lat_long=xmlZona[i].getElementsByTagName("centro")[0].childNodes[0].nodeValue;
      var arr = lat_long.split(" ");
      cLatitud=arr[0]/1; // con esto fuerzo la conversion numerica
      cLongitud=arr[1]/1; // con esto fuerzo la conversion numerica
      console.log("zona latitud:"+cLatitud+"longitud:"+cLongitud); 
      listaLocalidades=construyeListaLocalidades(xmlZona[i]);                      
    }//for  -- en realidad solo deberíamos tener una zona
  
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


function cambiaPosicion(newLatitud, newLongitud)
{
   // se llama en tres casos
   // 1º: al recibir una nueva posicion de GPS.
   // 2º al pinchar el usuario en el mapa
   // 3º al pinchar en un marcador de fosa
   // por tanto en muchos casos no habra ni cambio de zona ni cambio de nada
    console.log("CambiaPosicion");
    if (miZona.localidadActual)
    {   // caso de que estemos dentro de la zona actual
        if (miZona.localidadActual.puntoEnEntorno(newLatitud, newLongitud)) return;
    }
    
    //solo cambiaremos la localidad actual si encontramos otra en el entorno del punto
    // para eso no queda mas remedio que recorrer todas las localidades
    var localidadActual=miZona.buscaLocalidadEnEntorno(newLatitud, newLongitud);
    if (localidadActual){ 
       //necesitamos cambiar la localidad actual.
       if(miZona.localidadActual) miZona.localidadActual.desanimaMarcadores();
       miZona.localidadActual=localidadActual;
       miZona.localidadActual.animaMarcadores();
       habla(miZona.localidadActual.generaSpeech());
    }
    //TODO: aun podría ser el caso un cambio de zona, que por el momento no vamos a tratar

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
     window.speechSynthesis.cancel(); //primero callar lo anterior
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