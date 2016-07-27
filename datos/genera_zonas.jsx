// script  de Extended Script de Adobe , para generar ficheros de zonas a partir del fichero completo de zona
// todo esto es para poder tener mi aplicacion en un servidor pasivo gratuito y no necesitar ni contratar hosting ni instalar servidores web, ni bases de datos remotas , ni na ena.
// en resumen: para poder desplegar sin pagar un duro.

function nombreFicheroZonasCompleto()
{
    return "/d/1.github/fosas_comunes/intermedios/zona_completa.xml"; 
}

function nombreFicheroZona(latitud, longitud)
{
    
    /// si se cambia esta funcion hay que hacer el cambio consistente en fosas_comunes.js
    var nombreFichero="/d/1.github/fosas_comunes/datos/zona_";
    if (latitud>=0) nombreFichero+="N"+latitud;
    else nombreFichero+="S"+Math.abs(latitud);
    if (longitud>=0) nombreFichero+="E"+longitud;
    else nombreFichero+="W"+Math.abs (longitud);
    nombreFichero+=".xml";
    return nombreFichero;
}

function puntoEnZona(latitud, longitud, latitudZona, longitudZona)
{   // cambiar siempre de forma consistente con fosas_comunes.js
    if (latitud > (latitudZona +1)) return false;
    if (latitud <= (latitudZona -1)) return false ;
    if (longitud > (longitudZona +1)) return false;
    if (longitud <=(longitudZona-1)) return false;
    return true;    
}

function generaFicheroZona(latitud, longitud, xmlZonaCompleta)
{
     
    var nombreFichero=nombreFicheroZona(latitud, longitud);
    // Ahora hay que meter todos los datos en este fichero.
    // seleccionaremos todas las localidades que van desde (latitud+1 , longitud-1) a (latitud -1, longitud +1)
    var miZona=new XML ("<zona> <centro> </centro> </zona>"); 
    miZona.centro=latitud+" "+longitud; 
    // recorrer todo el fichero de zona completa y para cada localidad en la zona completa, copiarla a la zona  
    var localidadesEnZona=0; // si no hay localidades en la zona no generamos el fichero
    for (var  i=0 ; i<xmlZonaCompleta.localidad.length(); i++)
    {
        // ¿está la localidad  en mi zona? 
        if (puntoEnZona(xmlZonaCompleta.localidad[i].latitud,   xmlZonaCompleta.localidad[i].longitud, latitud, longitud))
        {
             localidadesEnZona++;
             miZona.insertChildBefore(null, xmlZonaCompleta.localidad[i]);
        }
    }
    
    if (localidadesEnZona==0) return; // si no hay localidades no generamos fichero
       
    var fichero=new File(nombreFichero);
    if (fichero!=null)
    {
        fichero.encoding="utf-8";
        fichero.open("w");
        fichero.writeln('<?xml version="1.0" encoding="utf-8"?>');
        // TODO: GUARDA LOS FICHEROS EN ansi, HAY QUE ARREGLARLO.
        //fichero.write(miZona.toXMLString());
        fichero.write(miZona.toString());
        fichero.close();
    }
}

function cargaFicheroZonaCompleta()
{
    var fichero =new File(nombreFicheroZonasCompleto());
    var xmlZona=null;
     if (fichero!=null)
    {   
        fichero.open("r");
        xmlZona=new XML(fichero.read());
        fichero.close();
    }
   
    return xmlZona;
}

//function generaFicherosTodasZonas()
//{   
    var xmlZonaCompleta=cargaFicheroZonaCompleta();
    // este bucle determina cuales son las zonas y por tanto sus nombres.
    // si se cambian los valores extremos de latitud y longitud hay que cambiar
    // de forma consistente la funcion nombreFicheroZona de fosas_comunes.js
    for (var latitud=43; latitud>=27; latitud-=2)
    {
        for (var longitud=-18; longitud<=4; longitud+=2)
        {
            generaFicheroZona(latitud, longitud, xmlZonaCompleta);
        }
     
     }// para nuestro rango de latitudes (centro del cuadro)
 //} // aqui mi script