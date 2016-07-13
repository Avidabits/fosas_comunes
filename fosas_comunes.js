    
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

function cambiaPosicion(latitud, longitud)
{
    
    if (cambioZona(latitud, longitud, latitud, longitud))
    {
      // hay que cambiar las bolas indicativas de fosas.
     
      
    } 
    //  TODO: HEMOS DE DETERMINAR CADA CUANTOS KM CENTRAMOS EL MAPA y ACTUALIZAMOS LA LISTA FOSAS.
    //  POR EJEMPLO CADA 20 KM.
    var distancia_maxima_longitud=0.0002;
    var distancia_maxima_latitud=0.0002;
    
    
    /*if (abs(pCentro.latitud-latitud)> distancia_maxima_latitud) || abs(pCentro.latitud-latitud)> distancia_maxima_latitud))
    {
    //actualizamos el nuevo centro
    pCentro=centro(latitud, longitud);
    map.setCenter(pCentro);
    ActualizaBolas(latitud, longitud);
    }*/
}//function cambiaPosicion


