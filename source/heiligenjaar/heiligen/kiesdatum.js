           	// redirect-script
           // JavaScript bij pagina vandaag/vandaag.html - bevat 2 menu's om datum te kiezen
           // - gebruik volledige url: http://www.andreehollander.nl/vandaag/dag/xx/xxxx.html

           window.onload=function()
           {
            geef_actuele_datum_aan();
            // maak keuzeonderdelen zichtbaar (div met id 'keuzeonderdelen')
             if (document.getElementById('keuzeonderdelen') )
             {
               document.getElementById('keuzeonderdelen').style.visibility='visible';
             }
             if (document.getElementById('toonvandaag') )
             {
               document.getElementById('toonvandaag').onclick = function()
               {  // ga naar de ingestelde pagina
                 naar_ingestelde_dag();
               };
             }
           }


           function geef_actuele_datum_aan()
           {
             var huidigeDatum = new Date();			 // dit is inclusief de tijd
             var huidigJaar = huidigeDatum.getFullYear();   // jaartal van vandaag
             var huidgeMaand = huidigeDatum.getMonth();    // nummer van 0 - 11
             var huidigDagnr = huidigeDatum.getDate();    // nummer van 1 - 31
             //
             var maandnamen = ["januari", "februari", "maart", "april", "mei", "juni",
               "juli" ,"augustus", "september", "oktober", "november", "december"];
             var dagnamen = ["zon", "maan", "dins", "woens", "donder", "vrij", "zater"];
             //
             document.getElementById('actueledag').firstChild.nodeValue = 
               dagnamen[huidigeDatum.getDay()] + "dag " + huidigDagnr + " " + 
               maandnamen[huidgeMaand] + " " + huidigJaar;
           }



           function naar_ingestelde_dag()
             {
           var pagina = ""; /* vast beginstuk */
           // de maandnamen zijn de values van het select-object: jan feb mrt enz.
           var maandnamen = ["nul", "jan", "feb", "mrt", "apr", "mei", "jun",
               "jul" ,"aug", "sep", "okt", "nov", "dec"];
           var maandnr;
           /* bepaal maandnummer (twee cijfers) */
           var maandnaam = document.dagkeuze.maandafkorting.options[document.dagkeuze.maandafkorting.selectedIndex].value;
           // maak van de naam een getal
           for (var m = 1; m < maandnamen.length; m++)
           {
             if (maandnaam == maandnamen[m])
             {
               maandnr = m;
             }
           }
           //alert(maandnr); // debug
           if (maandnr < 10)
           {
             maandnr = "0" + maandnr;
           }


           /* bepaal dagnummer toe (twee cijfers) */
           dagnr = document.dagkeuze.daggetal.options[document.dagkeuze.daggetal.selectedIndex].value;
           // de value-waarden in de webpagina van 1 t/m 9 zijn genoteerd als 01 t/m 09
           // dus een voorloopnul toevoegen is niet nodig



	if (maandnr == "02" || maandnr == "04" || maandnr == "06" || maandnr == "09" || maandnr == "11") 
			{ if (dagnr == "31")  { dagnr = 30; }   }
	if (maandnr + dagnr == "0230") { dagnr = "29" }

           pagina = "heiligen"+ maandnr + dagnr + ".htm" ;                          /* HIER juiste bestandsnaam gevormd */

           window.location.replace(pagina);
           }
