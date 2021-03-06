﻿// variables globales de zona de fosas
var miZona=null; //es una variable de tipo zona que se construye con function construyeZona(xml) 

// deltaGrados=180*deltaKm/((RT=6371km)*PI  )
// Delta_Kilometros=((RT=6371km)*PI  )* Delta_grados/180
// para decidir que nos ponemos a declamar la fosas de una localidad, puesto que no tenemos los polígonos
// hemos de tomar una decisión respecto a la distancia a la posicion puntual de esa localidad
// decidimos tomar unos 4Km, que segun la formula anterior corresponde aproximadamente a 0.036 grados
var deltaLocalidad=0.036; // solo declamará las fosas cuya localidad este a 4km del punto geolocalizado


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
       if (edad) speech+=" de "+edad+" años"; 
       //Cuidar de que se guarde este fichero en UTF-8 o dejará de pronunciar las ñ's y acentos
       if (profesion) speech+=", "+profesion;
       if (fechaFallecimiento) speech+=" fallece el "+fechaFallecimiento;
       if (fechaInhumacion) speech+=", se inhuma el "+fechaInhumacion;
       speech+=".\n";
       return speech;
    }; //victima.generaSpeech

    this.esDesconocida=function(){
       var conNombre=nombre!=null && !nombre.toUpperCase().includes("DESCONOCIDO") && !nombre.toUpperCase().includes("DESCONOCIDA");
       var conApellido1=apellido1!=null && !apellido1.toUpperCase().includes("DESCONOCIDO") && !apellido1.toUpperCase().includes("DESCONOCIDA");
       var conApellido2=apellido2!=null && !apellido2.toUpperCase().includes("DESCONOCIDO")  && !apellido2.toUpperCase().includes("DESCONOCIDA");
       return !(conNombre||conApellido1||conApellido2);      
    }; //victima.esDesconocida

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
          if (numeroPersonasIdentificadas==0) speech+="víctimas sin identificar";
          else if (numeroPersonasIdentificadas>0) speech+=", "+numeroPersonasIdentificadas+" identificadas";
      }
      if (numeroPersonasExhumadas!=null)
      {
          if (numeroPersonasExhumadas==1) speech+=", una exhumada";
          else if (numeroPersonasExhumadas>1) speech+=" "+numeroPersonasExhumadas+" exhumadas";
      }
      if (observaciones!=null) speech+=".\n"+observaciones+"\n";
      if (listaVictimas.length>0)
      { 
          if (listaVictimas.length>1) speech+=" Víctimas: "; 
          else speech+=" Víctima: "; 
          
          //Cuidar de que se guarde este fichero en UTF-8 o dejará de pronunciar las ñ's y acentos
          for (var i=0; i<listaVictimas.length; i++)
          {
               speech+=listaVictimas[i].generaSpeech();
          }
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
            if (Math.abs(latitud-latitudPunto) > deltaLocalidad) return false;
            if (Math.abs(longitud-longitudPunto) > deltaLocalidad) return false;
            return true;
        };//puntoEnEntorno

    this.generaSpeech=function(){
     var speech=nombre; 
      //Cuidar de que se guarde este fichero en UTF-8 o dejará de pronunciar las ñ's y acentos
      if (listaFosas.length==1) speech+=", tiene una fosa común.\n"; 
      else if (listaFosas.length >1) speech+=", tiene "+listaFosas.length+" fosas comunes.\n";
      for (var i=0; i<listaFosas.length; i++)
      {   
          if (listaFosas.length>1) speech+="Fosa número "+(i+1)+": ";
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
        var localidadSeleccionada=null;//valor de retorno
        var distanciaSeleccionada=0;
        var distanciaEvaluada=0;
        var localidaEvaluada=null;
        console.log("buscando localidad en entorno: "+latitudPunto+","+longitudPunto+", entre "+listaLocalidades.length+" localidadades");
        for (var i=0; i<listaLocalidades.length; i++){
            // TODO:Ahora solo estamos buscando en la zona cargada y deberíamos valorar lo que se hace cuando el punto
            // esta en la proximidad de una frontera
            // Una posibilidad es que se puedan cargar un par de zonas (function AmpliaZona), tal como esta 
            // la reticula podríamos llegar a cargar hasta 4 zonas, para un vertice
            if (listaLocalidades[i].puntoEnEntorno(latitudPunto, longitudPunto)) {
                localidadEvaluada=listaLocalidades[i];
                distanciaEvaluada=distanciaHarvesine(latitud, longitud, localidadEvaluada.latitud, localidadEvaluada.longitud);
                console.log("distancia Harvesine evaluada="+distanciaEvaluada);
                // solo debemos seleccionar la localidad si está  una distancia menor que la previa
                if (localidadSeleccionada==null){
                   localidadSeleccionada=localidadEvaluada;
                   distanciaSeleccionada=distanciaEvaluada;
                } else if (distanciaEvaluada < distanciaSeleccionada){
                   localidadSeleccionada=localidadEvaluada;
                   distanciaSeleccionada=distanciaEvaluada;
                } // ya hay una seleccionada, pero esta puede ser mejor
            }// if puntoEnEntorno
        }// for
        console.log("localidadSeleccionada;", localidadSeleccionada);
        return localidadSeleccionada;// esto es que no ha encontrado ninguna 
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
      desconocidas=0;
       
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

      if (tempVictima.esDesconocida()) desconocidas++;
      else   listaVictimas.push(tempVictima); 
     }
     // meto un item de victimas desconocidas al final del todo a efectos de generar 
     // un storytelling más agradable
     if (desconocidas > 0)
     {
         var textoDesconocidas="";
         if (desconocidas==1 && xmlVictima.length==1 ) textoDesconocidas="desconocida"; 
         else if (desconocidas==1 ) textoDesconocidas="Y otra víctima desconocida más.";
         else textoDesconocida="Y " + desconocidas + " víctimas desconocidas más.";
         var tempVictima=new victima(textoDesconocidas, null, null, null, null, null, null, null);
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

function cambiaPosicion(newLatitud, newLongitud, desdeClick)
{
   // se llama en tres casos
   // 1º: al recibir una nueva posicion de GPS.
   // 2º al pinchar el usuario en el mapa
   // 3º al pinchar en un marcador de fosa
   // por tanto en muchos casos no habra ni cambio de zona ni cambio de nada
    console.log("CambiaPosicion: "+ newLatitud+","+newLongitud+","+desdeClick);
    if (miZona==null) 
    {
        // es la primera vez que cargo una zona
         asyncCargaXMLZona(newLatitud, newLongitud);
         return;
    }
    if (miZona.localidadActual)
    {   // si ya hay una localidad actual, y seguimos en el entorno, no hacemos nada
        // excepto si el usuario ha pulsado click, entonces conmutamos habla/calla
        if (miZona.localidadActual.puntoEnEntorno(newLatitud, newLongitud)) {
               if (desdeClick){
                  if (hablando()) calla();
                  else habla(miZona.localidadActual.generaSpeech());
               }
               return;
        }
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
          // esta funcion, almacena en global estas coordenadas y cuando el fichero se ha cargado
          // vuelve a llamar a cambiaPosición, que ahora sí, funcionará con la zona ya cargada
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
var msg = new SpeechSynthesisUtterance(); // Create a new instance of SpeechSynthesisUtterance.
function iniciaSpeechSynthesis()
{
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
    }//for

    msg.volume = 1.0;
	msg.rate = 1.0;
	msg.pitch = 1.0;
    msg.onerror = function(event) {console.error('An error has occurred with the speech synthesis: ' + event.error); };
    msg.onboundary = function(event) {console.log('Fired when the spoken utterance reaches a word or sentence boundary.: ' + event); };
    msg.onend= function(event) {console.log('Fired when the utterance has finished being spoken.' + event); }
    msg.onmark= function(event) {console.log('Fired when the spoken utterance reaches a named SSML "mark" tag.' + event); }
    msg.onpause= function(event) {console.log('Fired when the utterance is paused part way through.' + event); }
    msg.onresume= function(event) {console.log('Fired when a paused utterance is resumed.' + event); }
    msg.onstart= function(event) {console.log('Fired when the utterance has begun to be spoken.' + event); }
   

}//iniciaSpeechSynthesis

function calla()
{
     window.speechSynthesis.cancel(); //hacer que pare la anterior locución si es que había
}

function hablando()
{
    return window.speechSynthesis.speaking; 
}

function habla(text) {

    console.log("window.speechSynthesis.paused: " + window.speechSynthesis.paused);
    console.log("window.speechSynthesis.pending: " + window.speechSynthesis.pending);
    console.log("window.speechSynthesis.speaking: " + window.speechSynthesis.speaking);

    window.speechSynthesis.cancel(); //hacer que pare la anterior locución si es que había

    console.log("despues del cancel\nwindow.speechSynthesis.paused: " + window.speechSynthesis.paused);
    console.log("window.speechSynthesis.pending: " + window.speechSynthesis.pending);
    console.log("window.speechSynthesis.speaking: " + window.speechSynthesis.speaking);

    msg.text = text;

    console.log(msg); 
    window.speechSynthesis.speak(msg);

}//habla