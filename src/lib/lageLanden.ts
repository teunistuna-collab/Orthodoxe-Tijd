// Heiligen van de Lage Landen: eigen, aanvullende dataset (overgenomen uit de vroegere lib/heiligen.ts, ongewijzigd).
// Teksten: lib/lageLandenTeksten.ts; iconen: lib/heiligenIconen.ts. md = kerkelijke datum M-D.
// heiligenjaar = dezelfde persoon op dezelfde dag in het Heiligenjaar (met de hand nagekeken op naam, datum en plaats/ambt
// in de tekst; geen automatische koppeling). Die vermelding wordt dan niet apart getoond, haar tekst wel bij deze heilige.
export interface LageLandenHeilige { md: string; naam: string; titel: string; kort: string; nl: true; heiligenjaar?: string }

export const LAGE_LANDEN: LageLandenHeilige[] = [
  {md:"2-6",naam:"Amandus",titel:"Missionaris en bisschop (7e eeuw)",kort:"",nl:true,heiligenjaar:"hj-0206-4"},
  {md:"2-25",naam:"Walburgis",titel:"Abdis en missionaris (8e eeuw)",kort:"",nl:true},
  {md:"3-17",naam:"Gertrudis van Nijvel",titel:"Abdis (7e eeuw)",kort:"",nl:true},
  {md:"5-13",naam:"Servatius van Maastricht",titel:"Bisschop (†384)",kort:"Bisschop van Tongeren en Maastricht, tijdgenoot van Athanasius; oudste heilige van Nederland.",nl:true,heiligenjaar:"hj-0513-10"},
  {md:"5-15",naam:"Dymphna van Geel",titel:"H. Dymphna",kort:"",nl:true,heiligenjaar:"hj-0515-8"},
  {md:"6-5",naam:"Bonifatius",titel:"Aartsbisschop, martelaar te Dokkum (†754)",kort:"Apostel van de Friezen en Germanen; met 52 gezellen bij Dokkum gedood.",nl:true},
  {md:"6-12",naam:"Odulfus van Utrecht",titel:"Priester en missionaris (†ca. 855)",kort:"Kanunnik van Utrecht, verkondiger onder de Friezen bij Stavoren.",nl:true},
  {md:"6-12",naam:"Cunera van Rhenen",titel:"H. Cunera",kort:"",nl:true,heiligenjaar:"hj-0612-7"},
  {md:"6-25",naam:"Adelbert van Egmond",titel:"Diaken, missionaris (†740)",kort:"Metgezel van Willibrord in Kennemerland; bij zijn graf ontstond de abdij van Egmond.",nl:true},
  {md:"8-14",naam:"Werenfried (Werenfridus) van Elst",titel:"Missionaris (†760)",kort:"",nl:true,heiligenjaar:"hj-0814-4"},
  {md:"8-17",naam:"Jeroen van Noordwijk",titel:"Priester, martelaar (†856)",kort:"Door de Noormannen gedood; zijn relieken rusten in Egmond en Noordwijk.",nl:true,heiligenjaar:"hj-0817-8"},
  {md:"9-17",naam:"Lambertus van Maastricht",titel:"Bisschop en martelaar (7e eeuw)",kort:"",nl:true,heiligenjaar:"hj-0917-7"},
  {md:"10-1",naam:"Bavo van Gent",titel:"Monnik (7e eeuw)",kort:"",nl:true,heiligenjaar:"hj-1001-12"},
  {md:"10-23",naam:"Eerbiedwaardige Oda van Amay",titel:"Eerbiedwaardige Oda van Amay",kort:"",nl:true},
  {md:"11-7",naam:"Willibrord van Utrecht",titel:"Aartsbisschop van Utrecht, apostel der Friezen (†739)",kort:"Uit Northumbrië gezonden verlichter van de Lage Landen; begraven in Echternach.",nl:true,heiligenjaar:"hj-1107-3"},
  {md:"11-12",naam:"Lebuinus van Deventer",titel:"Priester, missionaris (†ca. 775)",kort:"Predikte onder de Saksen aan de IJssel; stichter van de kerk van Deventer.",nl:true},
  {md:"11-27",naam:"Oda van Sint-Oedenrode",titel:"Maagd en kluizenares",kort:"",nl:true},
  {md:"11-29",naam:"Radboud van Utrecht",titel:"Bisschop (†917)",kort:"Bisschop van Utrecht in ballingschap te Deventer; geleerde en dichter.",nl:true,heiligenjaar:"hj-1129-8"},
];
