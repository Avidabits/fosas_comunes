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
       var speech=new String(); 
       if (nombre) speech+=nombre;
       if (apellido1) speech+=" "+apellido1;
       if (apellido2) speech+=" "+apellido2;
       if (edad) speech+=" de "+edad+" años"; // TODO: ENTERARSE DE COMO PONER BIEN ACENTOS Y EÑES.
       if (profesion) speech+=", "+profesion;
       if (fechaFallecimiento) speech+=" fallece el "+fechaFallecimiento;
       if (fechaInhumacion) speech+=", se inhuma el "+fechaInhumacion;
       speech+=".\n";
       return speech;
    }; //victima.generaSpeech

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
    
    this.generaSpeech=function(){
      // TODO: el número de fosa lo recita como si fueran siglas americanas (CA->california) por eso lo omito hasta que sepa como solucionar el problema
      var speech="";
      if (tipoFosa) speech+="Fosa del tipo "+tipoFosa;
      if (estadoActual) speech+=" actualmente "+estadoActual;
      if (numeroPersonasFosa!=null)
      {
         if (numeroPersonasFosa==1) speech+=" contiene una persona";
         else if (numeroPersonasFosa>1) speech+="contiene "+numeroPersonasFosa+" personas";
      }
      if (numeroPersonasIdentificadas!=null)
      {
          if (numeroPersonasIdentificadas==0) speech+=" sin identificar";
          else if (numeroPersonasIdentificadas>0) speech+=", "+numeroPersonasIdentificadas+" identificadas";
      }
      if (numeroPersonasExhumadas!=null)
      {
          if (numeroPersonasExhumadas==1) speech+=", una exhumada";
          else if (numeroPersonasExhumadas>1) speech+=" "+numeroPersonasExhumadas+" exhumadas";
      }
      if (observaciones!=null) speech+=".\n"+observaciones+"\n";
      if (listaVictimas.length>0) speech+=" Victimas: "; //TODO: problema con accentos. 
      for (var i=0; i<listaVictimas.length; i++)
      {
           speech+=listaVictimas[i].generaSpeech();
      }
       
      return speech;
    }; //fosa.generaSpeech
    
 } // fosa
;
function localidad(nombre, latitud, longitud, listaFosas)
{
    this.nombre=nombre;
    this.latitud=latitud;
    this.longitud=longitud;
    this.listaFosas=listaFosas;
    this.puntoEnEntorno = function(latitudPunto, longitudPunto) {
            console.log("mirando si punto "+latitudPunto+","+longitudPunto+" esta cerca de "+latitud +","+longitud+" con delta "+ deltaLocalidad);
            if (Math.abs(latitud-latitudPunto) > deltaLocalidad) return false;
            if (Math.abs(longitud-longitudPunto) > deltaLocalidad) return false;
            return true;
        };//puntoEnEntorno

    this.generaSpeech=function(){
     var speech=nombre; 
       // TODO: ENTERARSE DE COMO PONER BIEN ACENTOS Y EÑES. 
      if (listaFosas.length==1) speech+=", tiene una fosa comun.\n"; 
      else if (listaFosas.length >1) speech+=", tiene "+listaFosas.length+" fosas comunes.\n";
      for (var i=0; i<listaFosas.length; i++)
      {   
          speech+=listaFosas[i].generaSpeech();
          speech+="\n";   
      }// para cada fosa
      return speech;
  
    };//generaSpeech 
    

} //objeto localidad

function zona(latitud, longitud, listaLocalidades)
{
    this.latitud=latitud;
    this.longitud=longitud;
    this.listaLocalidades=listaLocalidades;
    this.localidadActual=null; // la funcion cambiaPosicion deberá actualizarla
    console.log("zona nueva:", this);
    this.buscaLocalidadEnEntorno = function(latitudPunto, longitudPunto)    {
        console.log("buscando localidad en entorno: "+latitudPunto+","+longitudPunto);
        for (var i=0; i<listaLocalidades.length; i++){
         if (listaLocalidades[i].puntoEnEntorno(latitudPunto, longitudPunto)) return listaLocalidades[i];
        }
        return null;// esto es que no ha encontrado ninguna 
     };//buscaLocalidadEnEntorno
     
    this.puntoEnZona=function(latitudPunto, longitudPunto)
    {  // cambiar siempre de forma consistente con generazonas.jsx
        if (latitudPunto > (latitud +1)) return false;
        if (latitudPunto <= (latitud -1)) return false ;
        if (longitudPunto > (longitud +1)) return false;
        if (longitudPunto <=(longitud-1)) return false;
        return true;    
    } //zona.puntoEnZona
    
}//zona

function construyeListaVictimas(xmlFosa)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlVictima=xmlFosa.getElementsByTagName("victima");
   var listaVictimas= new Array();

  
    for (var i = 0; i <xmlVictima.length; i++) {  // para cada fosa                       
      var  nombre=null; 
      var  apellido1=null;
      var  apellido2=null;
      var  sexo=null;
      var  edad=null;
      var  profesion=null;
      var  fechaFallecimiento=null;
      var  fechaInhumacion=null; 
      var currentTagName=null;
       
      currentTagName=xmlVictima[i].getElementsByTagName("nombre")[0];
      if (currentTagName) nombre=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("apellido1")[0];
      if (currentTagName) apellido1=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("apellido2")[0];
      if (currentTagName) apellido2=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("sexo")[0];
      if (currentTagName) sexo=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("edad")[0];
      if (currentTagName) edad=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("profesion")[0];
      if (currentTagName) profesion=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("fechaFallecimiento")[0];
      if (currentTagName) fechaFallecimiento=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlVictima[i].getElementsByTagName("fechaInhumacion")[0];
      if (currentTagName) fechaInhumacion=currentTagName.childNodes[0].nodeValue;

      var tempVictima=new victima(nombre, apellido1, apellido2, sexo, edad, profesion, fechaFallecimiento, fechaInhumacion);
      // TODO: AQUI PODRÍA VERIFICAR SI LA VICTIMA ES DECONOCIDA Y GENERAR UN ENTRADA CON EL NÚMERO DE DESCONOCIDOS
      // PERO HAY QUE HACER ALGO CON TANTO DESCONOCIDO

      listaVictimas.push(tempVictima); 
     }

     return listaVictimas;

}//construyeListaVictimas


function construyeListaFosas(xmlLocalidad)
{
   //ahora voy a recorrer las fosas de la localidad  
   var xmlFosa=xmlLocalidad.getElementsByTagName("fosa");
   var listaFosas= new Array();

    for (var i = 0; i <xmlFosa.length; i++) {  // para cada fosa   
      var numRegistro=null;
      var tipoFosa=null;
      var estadoActual=null;
      var numeroPersonasFosa=null;
      var numeroPersonasExhumadas=null;
      var numeroPersonasIdentificadas=null;
      var observaciones=null;
      var currentTagName=null
      
      currentTagName=xmlFosa[i].getElementsByTagName("numRegistro")[0];
      if (currentTagName) numRegistro=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlFosa[i].getElementsByTagName("tipoFosa")[0];
      if (currentTagName) tipoFosa=currentTagName.childNodes[0].nodeValue;
  
      currentTagName=xmlFosa[i].getElementsByTagName("estadoActual")[0];
      if (currentTagName) estadoActual=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlFosa[i].getElementsByTagName("numeroPersonasFosa")[0];
      if (currentTagName) numeroPersonasFosa=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlFosa[i].getElementsByTagName("numeroPersonasExhumadas")[0];
      if (currentTagName) numeroPersonasExhumadas=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlFosa[i].getElementsByTagName("numeroPersonasIdentificadas")[0];
      if (currentTagName) numeroPersonasIdentificadas=currentTagName.childNodes[0].nodeValue;

      currentTagName=xmlFosa[i].getElementsByTagName("observaciones")[0];
      if (currentTagName) observaciones=currentTagName.childNodes[0].nodeValue;

      //// ahora hay que leer todas las victimas de esta fosa
      var listaVictimas=construyeListaVictimas(xmlFosa[i]);
      var tempFosa=new fosa(numRegistro, tipoFosa, estadoActual, numeroPersonasFosa, numeroPersonasExhumadas, numeroPersonasIdentificadas, observaciones, listaVictimas);
      listaFosas.push(tempFosa); 
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
      locLatitud=xmlLoc[i].getElementsByTagName("latitud")[0].childNodes[0].nodeValue;
      locLongitud=xmlLoc[i].getElementsByTagName("longitud")[0].childNodes[0].nodeValue;
      locLatitud=locLatitud/1; // con esto fuerzo la conversion numerica
      locLongitud=locLongitud/1; // con esto fuerzo la conversion numerica
      //// ahora hay que leer todas las fosas de esta localidad
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
function nombreFicheroMarcadores()
{
  return "datos/localidades_con_fosa.xml";
}

var LATITUD_INICIAL=43;
var LATITUD_FINAL=27;
var DECREMENTO_LATITUD=-2;
var LONGITUD_INICIAL=-18;
var LONGITUD_FINAL=4;
var INCREMENTO_LONGITUD=2;

function nombreFicheroZona(latitud, longitud)
{
    // los ficheros de zona estan normalizados y se generan con la 
    // latitud y longitud de bucle principal del script generazonas.jsx
    
    // Las latitudes centrales de zonas son enteros impares.
    // para asignar los numeros frontera, en el caso de las latitudes, la latitud superior
    // pertenece a la zona de latitud un grado inferior. 
    // Ejemplos: latitud 44 sería de la zona 43, latitud 42, sería de la zona 41.
   
    var latitudEntera=Math.floor(latitud);
    var latitudZona=latitudEntera;
    var esLatitudPar=((latitudEntera%2)==0);
    var esLatitudEntera=(latitudEntera==latitud);
    if (esLatitudEntera && esLatitudPar) latitudZona=latitudEntera-1;
    else if (esLatitudPar) latitudZona=latitudEntera+1;
    else latitudZona=latitudEntera;
    
    // en el caso de las longitudes las zonas estan centradas en longitudes pares
    // la longitud  3 será de la zona 2 y la longitud  1 de la zona 0
    var longitudEntera=Math.floor(longitud);
    var longitudZona=longitudEntera; // valor por defecto
    var esLongitudPar=((longitudEntera%2)==0);
    var esLongitudEntera=(longitudEntera==longitud);

    if (esLongitudEntera && !esLongitudPar) longitudZona=longitudEntera-1;
    else if (!esLongitudPar) longitudZona=longitudEntera+1;
    else longitudZona=longitudEntera;
    
    var nombreFichero="datos/zona_"; 
    if (latitudZona>=0) nombreFichero+="N"+latitudZona;
    else nombreFichero+="S"+Math.abs(latitudZona);
    if (longitudZona>=0) nombreFichero+="E"+longitudZona;
    else nombreFichero+="W"+Math.abs (longitudZona);
    nombreFichero+=".xml";
    return nombreFichero;

 }

function cambiaPosicion(newLatitud, newLongitud)
{
   // se llama en tres casos
   // 1º: al recibir una nueva posicion de GPS.
   // 2º al pinchar el usuario en el mapa
   // 3º al pinchar en un marcador de fosa
   // por tanto en muchos casos no habra ni cambio de zona ni cambio de nada
    console.log("CambiaPosicion: "+ newLatitud+","+newLongitud);
    if (miZona==null) 
    {
        // es la primera vez que cargo una zona
         asyncCargaXMLZona(newLatitud, newLongitud);
         return;
    }
    if (miZona.localidadActual)
    {   // si ya hay una localidad actual, y seguimos en el entorno, no hacemos nada
        if (miZona.localidadActual.puntoEnEntorno(newLatitud, newLongitud)) 
               return;
    }
    
    // SI EL PUNTO ESTA EN LA ZONA, BUSCAMOS LOCALIDAD EN ENTORNO
    if (miZona.puntoEnZona(newLatitud, newLongitud))
    {
        var localidadActual=miZona.buscaLocalidadEnEntorno(newLatitud, newLongitud);
        if (localidadActual){ 
           //necesitamos cambiar la localidad actual.
           //if(miZona.localidadActual) miZona.localidadActual.desanimaMarcadores();
           miZona.localidadActual=localidadActual;
           //miZona.localidadActual.animaMarcadores();
           habla(miZona.localidadActual.generaSpeech());
        }
     } else {
          // el punto ni siquiera está en la zona. hay que cargar zona nueva de forma asincrona.
          // y esperar a que la nueva geolocalizacion vuelva a llamar a esta funcion
          asyncCargaXMLZona(newLatitud, newLongitud);
          // TODO: queda pendiente actulizar la localidad actual 
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

    window.speechSynthesis.cancel(); //hacer que pare la anterior locución si es que había
    // Create a new instance of SpeechSynthesisUtterance.
	var msg = new SpeechSynthesisUtterance();
    msg.text = text;
   	msg.volume = 1.0;
	msg.rate = 1.0;
	msg.pitch = 1.0;
  
    // uso la voz que mejor funciona sin conexión -native- para optimizar el consumo de datos
	//msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == "native"; })[0];
    // TODO: NINGUNA DE ESTAS FORMAS DE ASIGNAR LA VOZ FUNCIONA REALMENTE, VER QUE PASA msg.voice sigue siendo null
    // podría ser un problema de inicializacion, que se resolviera cargando mas tarde el mensaje
    var listaVoces= speechSynthesis.getVoices();
    console.log("extrayendo lista voces");
    console.log(listaVoces);
    console.log(listaVoces.length);
    console.log(listaVoces[0]);

    for (var i=0; i<listaVoces.length; i++)
    {
       if (listaVoces[i].localService) {
          msg.voice=listaVoces[i];
          console.log(listaVoces[i]);
          break;   
       }
    }
   
    console.log(msg); 
    	window.speechSynthesis.speak(msg);
}