export interface Gebed {
  id: string;
  titel: string;
  wanneer: string;
  rubriek?: string;
  bron?: string;
  tekst: string;
  categorie: 'ochtend' | 'avond' | 'dagelijks' | 'liturgisch' | 'vasten' | 'pascha' | 'akathisten';
}

const BRON = 'Aangeleverde PDF';
const BRON_WORD = 'Aangeleverd Word-document';

export const GEBEDEN: Gebed[] = [
  {
    id: 'inleidende-gebeden-pdf',
    titel: 'Inleidende gebeden',
    wanneer: 'Aan het begin van de morgen- en avondgebeden',
    bron: BRON,
    categorie: 'dagelijks',
    tekst: `Heer Jezus Christus, Zoon van God, omwille der gebeden van Uw alreine Moeder en alle heiligen, ontferm U over ons. Amen.

Ere zij U, onze God, ere zij U.

Hemelse Koning, Trooster, Geest der waarheid,
Die alom tegenwoordig zijt, en alles vervult,
Schatkamer van het goede, en Schenker van het leven,
kom en verblijf in ons, reinig ons van alle smet,
en red onze zielen, o Goede.

Heilige God, heilige Sterke, heilige Onsterflijke,
ontferm U over ons. (3x met buigingen)

Eer aan de Vader, de Zoon, en de Heilige Geest,
nu en altijd, en in de eeuwen der eeuwen. Amen.

Alheilige Drie-eenheid, ontferm U over ons.
Heer, wis onze zonden uit.
Meester, vergeef ons onze ongerechtigheden.
Heilige, bezoek ons en genees onze zwakheden omwille van Uw Naam.
Heer, ontferm U. (3x)

Onze Vader, Die in de hemelen zijt,
Uw Naam worde geheiligd,
Uw Koninkrijk kome,
Uw wil geschiede, zoals in de hemel, zo ook op aarde.
Geef ons heden ons dagelijks brood,
en vergeef ons onze schulden, zoals ook wij onze schuldenaren vergeven.
En leid ons niet in verzoeking, maar verlos ons van den boze.`,
  },
  {
    id: 'morgengebeden-pdf',
    titel: 'Morgengebeden',
    wanneer: 'Bij het ontwaken, vóór de iconen',
    rubriek: 'Met de drie-eenheidstroparen, Psalm 50, de geloofsbelijdenis en de gebeden van de heilige Makarios de Grote.',
    bron: BRON,
    categorie: 'ochtend',
    tekst: `In de Naam van de Vader, de Zoon, en de Heilige Geest. Amen.

GEBED VAN DE TOLLENAAR
O God, wees mij, zondaar, genadig. (3x met buigingen)

DRIE-EENHEIDSTROPAREN
Ontwaakt uit de slaap, vallen wij voor U neer, gezegende God, en zingen voor U, Almachtige, het lied der Engelen: heilig, heilig, heilig zijt Gij, o God, door de gebeden van de Moeder Gods, ontferm U over ons.

Uit de slaap hebt Gij mij doen opstaan, Heer. Verlicht nu mijn geest en hart, open mijn lippen, opdat ik U zal toezingen, o alheilige Drie-eenheid.

Onverwachts zal de Rechter komen en de daden van allen zullen openbaar worden. In vreze roepen wij U aan op dit uur: heilig, heilig, heilig zijt Gij, o God, door de gebeden van de Moeder Gods, ontferm U over ons.

Heer, ontferm U. (12x)

GEBED TOT DE ALHEILIGE DRIE-EENHEID
Ontwaakt uit de slaap, dank ik U, alheilige Drie-eenheid, dat Gij in Uw grote goedheid en lankmoedigheid niet vertoornd zijt geweest op mij, trage zondaar, en mij niet verloren hebt laten gaan met al mijn overtredingen, maar als steeds Uw liefde hebt betoond en mij uit de slaap hebt opgewekt om mijn morgengebed tot U op te zenden en Uw macht te loven.

Verlicht ook nu de ogen van mijn verstand, open mijn mond om door Uw woorden te worden onderricht, Uw geboden te verstaan, Uw wil te volbrengen, U vol geloof toe te zingen, en te loven Uw alheilige Naam: van de Vader, de Zoon, en de Heilige Geest, nu en altijd, en in de eeuwen der eeuwen. Amen.

Komt, laten wij aanbidden onze Koning en God.
Komt, laten wij aanbidden, en nedervallen voor Christus, onze Koning en God.
Komt, laten wij aanbidden, en nedervallen voor Christus Zelf, onze Koning en God.

EERSTE GEBED VAN DE HEILIGE MAKARIOS DE GROTE
O God, reinig mij, zondaar, want nog nimmer heb ik voor Uw Aangezicht iets goeds verricht. Maar verlos mij van den boze, laat Uw wil in mij geschieden, en laat ik zonder veroordeling mijn onwaardige mond mogen openen om Uw heilige Naam te loven: van de Vader, de Zoon, en de Heilige Geest, nu en altijd, en in de eeuwen der eeuwen. Amen.

TWEEDE GEBED VAN DEZELFDE HEILIGE
Opgestaan uit de slaap breng ik U mijn morgengebed, o Heiland. Laat mij niet inslapen in de dood der zonde, maar heb erbarmen. Laat na de slaap van deze nacht een dag zonder zonde over mij oplichten, o Christus God, en red mij. Amen.

DERDE GEBED VAN DEZELFDE HEILIGE
Ontwaakt uit de slaap, kom ik tot U, o menslievende Koning, en maak mij gereed om Uw werken te doen door Uw barmhartigheid. Help mij te allen tijde, bewaar mij voor iedere boosheid en leid mij in Uw eeuwig Koninkrijk. Want Gij zijt mijn Schepper en de Schenker van al het goede. Amen.`,
  },
  {
    id: 'psalm-50-pdf',
    titel: 'Psalm 50',
    wanneer: 'Boetepsalm in de gebedsregel',
    bron: BRON,
    categorie: 'dagelijks',
    tekst: `Ontferm U over mij, o God, in Uw grote goedheid,
en delg mijn ongerechtigheden uit door de overvloed van Uw barmhartigheid.
Was mij geheel van mijn ongerechtigheid en reinig mij van mijn zonde.
Want ik erken mijn ongerechtigheid, mijn zonde staat bestendig voor mij.
Tegen U, U alleen, heb ik gezondigd en gedaan wat kwaad is in Uw ogen,
zodat Gij rechtvaardig blijkt in Uw uitspraak, en zult winnen als men U oordeelt.
Want zie, in ongerechtigheid ben ik geboren, in zonde heeft mijn moeder mij ontvangen.
Zie, Gij wilt waarheid in het verborgene, in het geheim maakt Gij mij wijsheid bekend.
Besprenkel mij met hysop, dan word ik rein, was mij, dan word ik witter dan sneeuw.
Doe mij vreugde en blijdschap horen, en het gebeente dat verbrijzeld was zal weer jubelen.
Keer Uw aangezicht af van mijn zonden en delg al mijn ongerechtigheden uit.
Schep mij een rein hart, o God, en vernieuw in mijn binnenste de rechte geest.
Verwerp mij niet van voor Uw aangezicht, en neem Uw Heilige Geest niet van mij.
Hergeef mij de blijdschap over Uw heil, en laat Uw besturende Geest mij schragen.
Dan zal ik overtreders Uw wegen leren, en de goddelozen zullen zich tot U bekeren.
Red mij van bloedschuld, o God, God van mijn heil, laat mijn tong over Uw gerechtigheid jubelen.
Heer, open mijn lippen, en mijn mond zal Uw lof verkondigen.
Want Gij hebt geen behagen in slachtoffers, dat ik die zou brengen, aan brandoffers hebt Gij geen welgevallen.
Een offer voor God is een verbroken geest; een verbroken en nederig hart veracht Gij niet, o God.
Doe wel, Heer, aan Sion naar Uw welbehagen, herbouw de muren van Jeruzalem.
Dan zult Gij behagen hebben in offers van gerechtigheid, gaven en brandoffers,
dan zal men kalveren op Uw altaar offeren.`,
  },
  {
    id: 'geloofsbelijdenis-pdf',
    titel: 'Geloofsbelijdenis',
    wanneer: 'In de gebedsregel en in de Liturgie',
    bron: BRON,
    categorie: 'liturgisch',
    tekst: `Ik geloof in één God: de almachtige Vader, Schepper van hemel en aarde, van al het zichtbare en onzichtbare.

En in één Heer, Jezus Christus, de eniggeboren Zoon van God, geboren uit de Vader, vóór alle eeuwen.

Licht uit Licht, ware God uit de ware God. Geboren, niet geschapen, één in wezen met de Vader en door Wie alles geworden is;
Die om ons mensen en om onze verlossing uit de hemel is nedergedaald en vlees heeft aangenomen door de Heilige Geest uit de Maagd Maria en mens geworden is;
Die voor ons onder Pontius Pilatus gekruisigd is, geleden heeft en begraven is; Die opgestaan is op de derde dag volgens de Schriften;
Die opgevaren is ten hemel en zetelt aan de rechterhand van de Vader;
Die zal wederkomen in heerlijkheid om levenden en doden te oordelen en aan Wiens Rijk geen einde zal zijn.

En in de Heilige Geest, Heer en Levendmaker, Die uitgaat van de Vader, Die aanbeden en verheerlijkt wordt tezamen met de Vader en de Zoon; Die door de profeten gesproken heeft.

In één heilige, katholieke en apostolische Kerk.
Ik belijd één doop tot vergeving van zonden.
Ik verwacht de opstanding van de doden, en het leven van de komende eeuwigheid. Amen!`,
  },
  {
    id: 'avondgebeden-pdf',
    titel: 'Avondgebeden',
    wanneer: 'Voor het slapengaan',
    rubriek: 'Met de gebeden van de heilige Makarios, Antiochus en Johannes Chrysostomos.',
    bron: BRON,
    categorie: 'avond',
    tekst: `TROPARION, TOON 6
Ontferm U over ons, Heer, ontferm U over ons, want wij zondaars bieden U dit smeekgebed aan: ontferm U over ons.

Heer, ontferm U over ons, want op U hebben wij ons vertrouwen gesteld. Laat Uw toorn niet al te zeer op ons neerkomen, maar zie barmhartig naar ons om en verlos ons van onze vijanden.

Open voor ons de deuren der barmhartigheid, gezegende Moeder van God. Laat ons niet verloren gaan, maar behoed ons voor alle onheil.

Heer, ontferm U. (12x)

EERSTE GEBED VAN DE HEILIGE MAKARIOS DE GROTE
Eeuwige God en Koning van alle schepsel, vergeef mij de zonden die ik deze dag heb begaan in daad, woord en gedachte, en reinig mijn nederige ziel van alle smet naar lichaam en geest. Geef dat ik de slaap van deze nacht in vrede mag doorbrengen en als ik weer ben ontwaakt Uw heilige Naam waardig mag dienen. Amen.

TWEEDE GEBED VAN DE HEILIGE ANTIOCHUS
Almachtige Heer, Woord van de Vader, Jezus Christus, verlaat mij, Uw dienaar, nimmer, maar wees steeds in mij omwille van Uw grote barmhartigheid. Bewaar mij in mijn slaap door Uw eeuwig Licht en schenk mij deze nacht Uw heil. Amen.

DERDE GEBED TOT DE HEILIGE GEEST
O Heer, hemelse Koning, Trooster, Geest der waarheid, heb erbarmen en ontferm U over mij, Uw zondige dienaar. Vergeef mij alles wat ik vandaag heb gedaan tegen Uw wil. Ontferm U over mij, mijn Heer en Schepper, vergeef mij en laat mij in vrede gaan slapen. Amen.

VIERDE GEBED VAN DE HEILIGE MAKARIOS DE GROTE
Wat kan ik U aanbieden, o onsterfelijke Koning? Vergeef mij alle zonden die ik vandaag bewust en onbewust heb begaan. Bewaar mij tegen alle aanvallen van de tegenstander. Laat mij zonder veroordeling inslapen en zend mij een Engel van vrede, een getrouwe gids en behoeder van mijn ziel en lichaam. Amen.

24 GEBEDEN VOOR IEDER UUR VAN DAG EN NACHT
Heer, vergeef mij de zonden die ik in geest en hart, in woord en daad heb begaan.
Heer, verlos mij van alle verzoeking.
Heer, verlicht mijn hart dat door boze overleggingen is verduisterd.
Heer Jezus Christus, schrijf mij, Uw dienaar, op in het Boek des Levens.
Heer, neem mij aan in berouw.
Heer, schenk mij nederigheid, reinheid en gehoorzaamheid aan Uw wil.
Heer, plant in mijn hart ontzag voor U, de Wortel van al het goede.
Heer, maak mij waardig U lief te hebben met geheel mijn ziel en verstand. Amen.`,
  },
  {
    id: 'gebeden-voor-het-slapengaan-pdf',
    titel: 'Gebeden voor het slapengaan',
    wanneer: 'Vlak voordat je gaat slapen',
    bron: BRON,
    categorie: 'avond',
    tekst: `GEBED VAN DE HEILIGE JOHANNES VAN DAMASKUS
O menslievende Meester, zal dit bed mijn graf worden, of zult Ge mijn onzalige ziel nog door de nieuwe dag verlichten? Ziedaar mijn graf, de dood wacht op mij. Ik vrees Uw gericht, Heer, en toch houd ik niet op kwaad te bedrijven. Openbaar door mij, zondaar, Uw genade en Uw liefde voor de mensen, en sta niet toe dat mijn boosheid Uw onuitsprekelijke goedheid en barmhartigheid overweldigt: doe met mij naar Uw wil.

VLAK VOORDAT JE GAAT SLAPEN
Verlicht mijn ogen, o Christus God, laat mij niet inslapen ten dode; laat mijn vijand niet zeggen: Ik heb hem overweldigd. (Ps. 12:4b-5a)

Wees de Beschermer van mijn ziel, o God, want ik wandel temidden van vele netten; verlos mij daaruit en red mij, o Algoede, want Gij hebt de mensen lief.

GEBED TOT HET HEILIG KRUIS
Dat God verrijze en Zijn vijanden worden verstrooid. Dat de boze geesten ten ondergaan voor het aangezicht van hen die God liefhebben en zich tekenen met het teken van het Kruis. O, kostbaar en levendmakend Kruis van onze Heer, help mij samen met de Moeder Gods en alle heiligen te allen tijde. Amen.

Of kort:
Bescherm mij, o Heer, door de kracht van Uw heilig en levendmakend Kruis, en behoed mij voor alle onheil.

DAGELIJKSE SCHULDBELIJDENIS
Heer mijn God en Schepper, ik belijd voor U al mijn zonden die ik alle dagen van mijn leven en op ieder uur heb begaan: in daad, woord en gedachte. Ik heb spijt over dit alles en verlang naar berouw: vergeef mij mijn overtredingen omwille van Uw barmhartigheid en bevrijd mij van alles wat ik voor U heb uitgesproken, als de Algoede en Menslievende.

Wanneer je in slaap valt, bid dan:
In Uw handen, Heer Jezus Christus, mijn God, beveel ik mijn geest: zegen mij, ontferm U over mij en schenk mij het eeuwige leven. Amen.`,
  },
  {
    id: 'gebed-voor-het-gezin',
    titel: 'Gebed voor het gezin',
    wanneer: 'Voor ouders en kinderen',
    bron: 'Archimandriet Nicodim (Mandita) · aangeleverde PDF',
    categorie: 'dagelijks',
    tekst: `O Heer, God van hemel en aarde, die door Uw wijsheid de mens uit de aarde hebt geschapen en hem de levensadem hebt ingeblazen, waardoor hij een levende mens werd wiens leven zowel tijdelijk als eeuwig is; en die hem hebt gezegend en gezegd: "Wees talrijk en vermenigvuldig, vul de aarde en heers erover," en die in Kana in Galilea door Uw Enige Zoon, Jezus Christus, het huwelijk hebt gezegend en daardoor het krijgen van zonen en dochters - in diepe nederigheid bidden wij tot U: help ons door Uw genade altijd onze plichten als ouders te vervullen en onze kinderen goed op te voeden.

O Heer, God van barmhartigheid, heb medelijden met ons en met ons gezin, en stort in Uw grote goedheid Uw overvloedige genade uit over al onze kinderen. Heb medelijden, o Heer, met ons en met onze kinderen die U ons hebt gegeven.

O Barmhartige Heer, die voedsel geeft aan de vogels in de lucht en aan alle levende wezens op aarde: voed, voed op en bescherm ook onze kinderen. Help ons om in hun ziel te planten wat goed en nuttig is voor de Heilige Kerk en het volk, en wat U welgevallig is. Vervul hen met verlichte wijsheid en heilig inzicht. Bescherm hen tegen alle listen van zichtbare en onzichtbare vijanden.

Wij bidden U, Heer, hun geest te openen, opdat zij U zo goed mogelijk mogen kennen. Amen.`,
  },
  {
    id: 'gebed-in-nood',
    titel: 'Gebed in onrust en lijden',
    wanneer: 'In tijden van nood, leegte en lijden',
    bron: BRON,
    categorie: 'dagelijks',
    tekst: `O Jezus onze Koning, wees ons genadig terwijl we worstelen, en ontvang onze liederen als een geurige aanbieding en een zoetgeurend offer. In al onze onrust, leegte en lijden wenden we ons tot U, U prijzend voor Uw grote glorie.

Til ons op zoals een vader zijn kleine kind optilt, en breng ons door dit seizoen van duisternis en pijn in Uw wonderbaarlijke licht. Los onze nood op zoals U wilt, overeenkomstig Uw grote wijsheid en liefde.

Wij aanvaarden alles wat uit Uw barmhartige hand komt, en vragen dat U ons toestaat Uw wil te doen. Aldus gesterkt om te wandelen op een manier die U behaagt, houden we tot onze laatste ademtocht nooit op Uw allerheiligste Naam te prijzen, samen met die van Uw Vader die geen begin heeft en Uw alheilige, goede en levenscheppende Geest, nu en altijd en in de eeuwen der eeuwen. Amen.`,
  },
  {
    id: 'kanon-beschermengel',
    titel: 'Kanon tot de beschermengel',
    wanneer: 'Gebed tot de beschermengel',
    bron: BRON,
    categorie: 'dagelijks',
    tekst: `TROPAAR, TOON 6
Engel van God, mijn heilige beschermer, bewaar mijn leven in de vreze voor Christus God, sterk mijn geest op de weg van de waarheid en wek in mijn ziel de liefde voor het geestelijk leven, opdat ik, door u geleid, van Christus God grote barmhartigheid mag ontvangen.

Theotokion
Heilige Vrouwe, Moeder van Christus, onze God, bid met mijn beschermengel steeds tot Zijn goedheid om mijn, door begeerten gebonden, ziel te redden en mij de vergeving van mijn zonden te schenken.

KEERVERS
Heilige engel van God, mijn beschermer, bid voor mij.

Van harte roep ik tot u, heilige engel, behoeder van mijn ziel: bescherm mij en bewaar mij voor de strikken van den boze, en leid mij naar het hemelse leven; onderricht mij, verlicht en sterk mij.

Bevrijd mij van alle aanvechtingen en verlos mij van iedere droefheid, heilige engel, goede beschermer, mij door God gegeven. Verlicht mijn geest en leer mij gedachten tot heil te overwegen.

Verleen mij uw erbarmen, heilige engel des Heren, mijn beschermer. Ga niet van mij, onreine, weg, maar verlicht mij door het onzienlijke licht en maak mij het hemels Koninkrijk waardig.

GEBED TOT DE BESCHERMENGEL
Heilige engel van Christus, met gebogen knieën bid ik u, mijn heilige beschermer, mij van de heilige Doop af gegeven tot bijstand van mijn zondige ziel en lichaam. Heb erbarmen met mij, zondige en onwaardige dienaar. Wees mij door uw gebeden tot hulp en bijstand tegen mijn boze tegenstander. Maak mij deelgenoot van Gods Koninkrijk met alle heiligen, immer, nu en altijd en in de eeuwen der eeuwen. Amen.`,
  },
  {
    id: 'jezusgebed',
    titel: 'Het Jezusgebed',
    wanneer: 'Door de dag heen, met het gebedssnoer (komboskini, tsjotki)',
    bron: BRON,
    categorie: 'dagelijks',
    tekst: `Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar.

(korter:) Heer Jezus Christus, ontferm U over mij.
(kortst:) Heer, ontferm U.`,
  },
  {
    id: 'akathist-moeder-gods',
    titel: 'Akathist tot de Moeder Gods',
    wanneer: 'Akathisten',
    bron: BRON,
    categorie: 'akathisten',
    tekst: `Kondak 1
Tot u, de Aanvoerster die voor ons strijdt, en die ons van rampspoed hebt bevrijd, zingen wij, uw dienaren, dank- en zegehymnen, Godbarende. Gij die onoverwinnelijke macht bezit, bevrijd ons uit alle gevaren, opdat wij tot u roepen: verheug u, ongehuwde Bruid.

Ikos 1
De aanvoerder der engelen werd uit de hemel gezonden om aan de Moeder Gods het 'verheug u' te verkondigen. Verheug u, door wie de vreugde zal stralen; verheug u, door wie de vloek wordt gedoofd; verheug u, die terugroept de gevallen Adam; verheug u, die van haar tranen Eva verlost. Verheug u, want gij zijt de troon van de Koning; verheug u, want gij draagt de Drager van het heelal. Verheug u, ongehuwde Bruid.

Kondak 2-12 en Ikos 2-12
De volledige akathist bezingt de Menswording van Christus en de voorspraak van de Moeder Gods. De refreinen luiden: Alleluja, alleluja, alleluja en Verheug u, ongehuwde Bruid.

Kondak 13 (3x)
O alombezongen Moeder, die gebaard hebt het Woord, Dat heiliger is dan alle heiligen, aanvaard nu deze hulde, bevrijd allen van elke rampspoed, en verlos van de eeuwige veroordeling allen die tot u roepen: Alleluja.

Herhaling van Ikos 1 en Kondak 1.`,
  },
  {
    id: 'akathist-isidora-tabennA',
    titel: 'Akathist tot Isidora van Tabenna',
    wanneer: 'Akathisten',
    bron: BRON,
    categorie: 'akathisten',
    tekst: `Kondak 1
Wanneer de woorden van de apostel tot de heidenen in de oren van uw hart weerklinken: "Als iemand onder u denkt dat hij wijs is in deze tijd, laat hij dan dwaas worden, opdat hij wijs zal worden", dan bent u verlicht met de straal van de Geest en begonnen de wierook van het gebed aan de Meester aan te bieden: Halleluja!

Ikos 1
Uit liefde voor uw Bruidegom Christus bent u afgedaald in de diepten van de nederigheid en hebt u het juk van de waanzin voor Christus op u genomen. Verheug u, woonplaats van Christus' nederigheid; verheug u, schatkamer van goddelijke gedachten; verheug u, ijverige werkster in het land van het heil; verheug u, versiering van de ziel met ascese; verheug u, die de geest boven aardse zaken verheft. Verheug u, heilige Isidora, mysterieuze draagster van het kruis des waanzin voor Christus!

Kondak 2-12 en Ikos 2-12
De volledige akathist bezingt de nederigheid, gehoorzaamheid, geduld en vergeving van de heilige Isidora. Ieder Ikos eindigt met: Verheug u, heilige Isidora, mysterieuze draagster van het kruis des waanzin voor Christus!

Kondak 13 (3x)
Heilige Isidora, aangezien u op waardige wijze het juk van de waanzin voor Christus hebt gedragen en een snelle bevrijding van de hartstochten hebt bereikt, bid dat ook wij het pad van nederige dienst aan de Heer mogen vinden: Halleluja!

Herhaling van Ikos 1 en Kondak 1.`,
  },
  {
    id: 'akathist-nektarios-egina',
    titel: 'Akathist tot Nektarios van Egina',
    wanneer: 'Akathisten',
    bron: BRON,
    categorie: 'akathisten',
    tekst: `Kondak 1
Laten wij met vreugde in ons hart de onlangs onthulde ster van de Orthodoxie, het nieuw opgerichte bolwerk van de Kerk, bezingen met liederen. Want verheerlijkt door de werking van de Geest, stort hij de overvloedige genade van genezingen uit over hen die roepen: Verheug u, o Vader Nektarios, voorbeeld van geduld en liefhebber van de deugdzaamheid!

Ikos 1
In de wereld werd u getoond als een man met een hemelse geest, o Nektarios, hiërarch van Christus. Verheug u, door wie de gelovigen zijn opgebouwd; verheug u, goddelijke leraar van de orthodoxen; verheug u, stevig bolwerk van de Orthodoxie; verheug u, goede gids van mensen. Verheug u, o Vader Nektarios, toonbeeld van geduld en minnaar van de deugdzaamheid!

Kondak 2-12 en Ikos 2-12
De volledige akathist bezingt zijn onderwijs, nederigheid, geduld, barmhartigheid, wonderen en voorspraak. Het vaste refrein luidt: Verheug u, o Vader Nektarios, toonbeeld van geduld en minnaar van de deugdzaamheid!

Kondak 13 (3x)
Als deelgenoot aan het leven van de hemel, o Vader Nektarios, aanvaard ons offer en bid voor uw kudde en voor alle orthodoxen die u eren, opdat wij genezen mogen worden van ziekten van lichaam en ziel: Halleluja!

Gebed
Heilige Nektarios, wij eren u als onze geestelijke vader die voor ons blijft bidden in het Koninkrijk der Hemelen. Leer ons de geboden van God lief te hebben en te volgen en help ons anderen te vergeven. Amen.`,
  },
  {
    id: 'akathist-ontslapenen',
    titel: 'Akathist voor de rust van degenen die ontslapen zijn',
    wanneer: 'Akathisten',
    bron: BRON,
    categorie: 'akathisten',
    tekst: `Kondak 1
O Gij, Die door Uw ondoorgrondelijke Voorzienigheid de wereld hebt voorbereid voor de eeuwige zaligheid: Vergeef, O Heer, hen die in vroegere tijden zijn heengegaan al hun zonden, ontvang hen in het rijk van licht en vreugde, en hoor ons die hun nagedachtenis vieren en zingen: O Heer van onuitsprekelijke Liefde, gedenk Uw dienaren die zijn ontslapen.

Ikos 1
O Gij, Die Adam en het hele menselijke ras redt van eeuwige verdoemenis, schenk het onsterfelijke Koninkrijk van Uw Glorie aan hen die zijn ontslapen. Verheug, o Heer, zielen die vermoeid zijn door de stormen van het leven; ontvang hen in Uw kalme en gezegende haven; schenk hun Uw goddelijke glorie. O Heer van onuitsprekelijke Liefde, gedenk Uw dienaren die zijn ontslapen.

Kondak 2-12 en Ikos 2-12
De volledige akathist bidt om rust, vergeving en licht voor alle ontslapenen: voor gelovigen en ongelovigen, voor hen die plotseling stierven, voor hen die niemand hebben om voor hen te bidden en voor allen die in nood zijn heengegaan.

Kondak 13 (3x)
O allerbarmhartigste en eeuwige Vader, wees genadig voor onze verwanten en degenen die ons dierbaar zijn en die zijn ontslapen, en voor allen die door de eeuwen heen zijn heengegaan; vergeef en red hen: Halleluja!

Gebed
O God van geesten en alle vlees, Die de dood vertrapt hebt: geef rust, o Heer, aan de zielen van Uw dienaren die zijn ontslapen. Vergeef elke zonde die door hen is begaan, want Gij zijt de goede God en Liefhebber van mensen. Amen.`,
  },
  {
    id: 'akathist-jezus-licht-duisternis',
    titel: 'Onze Redder Jezus Christus, Licht voor hen die in duisternis zijn',
    wanneer: 'Akathisten',
    bron: BRON,
    categorie: 'akathisten',
    tekst: `Kondak 1
Uit de diepten van duisternis en wanhoop roep ik tot U, Heer, U Die in duisternis aan het Kruis hing. Vanuit de put van pijn en verwarring hef ik dit gebed op: Jezus, Licht voor hen die in duisternis zijn, glorie aan U.

Ikos 1
Op de dag van mijn nood zoek ik U, Heer. Toch hef ik dit lied op tot U: Jezus, redder van de verlatenen; Jezus, hoop voor hen die in wanhoop zijn; Jezus, leidende ster voor de verlorenen; Jezus, veeg mijn tranen weg; Jezus, kalmeer de paniek van mijn hart; Jezus, vreugde van hen die door verdriet zijn verpletterd; Jezus, licht voor hen die in duisternis zijn, glorie aan U.

Kondak 2-12 en Ikos 2-12
De volledige akathist brengt gebed voor mensen in wanhoop, rouw, ziekte, angst, eenzaamheid en geestelijke strijd. Elk Ikos eindigt met: Jezus, licht voor hen die in duisternis zijn, glorie aan U.

Kondak 13 (3x)
O Jezus onze Heer, God en Redder, alleen op Uw woord vertrouwen wij. Wees onze vreugde en vrede als wij door deze verschrikkelijke vallei gaan, en draag ons erdoorheen als onze kracht het begeeft: Halleluja, Halleluja, Halleluja!

Herhaling van Ikos 1 en Kondak 1.`,
  },
  {
    id: 'gebed-voor-het-werk',
    titel: 'Gebed voor het werk',
    wanneer: 'Voor en na het werk',
    bron: BRON_WORD,
    categorie: 'dagelijks',
    tekst: `Zegen, Heer.

of

Heer Jezus Christus, eniggeboren Zoon van Uw beginloze Vader, Gij hebt gezegd: 'Zonder Mij kunt gij niets doen.' Mijn Heer en mijn God, ik geloof met hart en ziel in deze woorden en buig mij voor Uw goedheid. Help mij, zondaar, het werk dat ik nu ga beginnen in verbondenheid met U te volbrengen, in de Naam van de Vader, de Zoon en de Heilige Geest. Amen.

GEBED NA HET WERK

Ere zij U, o Heer!

of

De vervulling van alle goede dingen zijt Gij, o mijn Christus. Vervul mijn ziel met vreugde en blijmoedigheid en red mij, want Gij alleen zijt goed en menslievend. Amen.`,
  },
  {
    id: 'gebed-voor-het-eten',
    titel: 'Gebed voor het eten',
    wanneer: 'Voor en na de maaltijd',
    bron: BRON_WORD,
    categorie: 'dagelijks',
    tekst: `Onze Vader, Die in de hemelen zijt, Uw Naam worde geheiligd. Uw Koninkrijk kome, Uw wil geschiede, zoals in de hemel, zo ook op aarde. Geef ons heden ons dagelijks brood, en vergeef ons onze schulden, zoals ook wij onze schuldenaren vergeven. En leid ons niet in verzoeking, maar verlos ons van den boze.

of

Aller ogen zijn gericht op U, o Heer, Gij geeft hun spijs te rechter tijd, Gij opent Uw milde hand en vervult alles wat leeft met Uw gaven.

Eer aan de Vader, de Zoon en de Heilige Geest, nu en altijd, en in de eeuwen der eeuwen. Amen.

Heer, ontferm U. (3x)

Door de gebeden van onze heilige vaders, Heer Jezus Christus, onze God, ontferm U over ons. Amen.

GEBEDEN NA HET ETEN

Wij danken U, o Christus, onze God, dat Gij ons hebt verzadigd met Uw aardse goederen: onthoud ons ook niet Uw hemels Koninkrijk, maar zoals Gij tot Uw leerlingen kwam, o Heiland, en hun vrede schonk, kom zo ook tot ons en red ons.

Eer aan de Vader, de Zoon en de Heilige Geest, nu en altijd, en in de eeuwen der eeuwen. Amen.

Heer, ontferm U. (3x)

Door de gebeden van onze heilige vaders, Heer Jezus Christus, onze God, ontferm U over ons. Amen.`,
  },
  {
    id: 'gebed-voor-het-slapen',
    titel: 'Gebed voor het slapen',
    wanneer: 'Bij het slapengaan',
    bron: BRON_WORD,
    categorie: 'dagelijks',
    tekst: `GEBED VAN DE HEILIGE JOHANNES VAN DAMASKUS († ca. 780)

Dit gebed zeg je terwijl je naar je bed wijst

O menslievende Meester, zal dit bed mijn graf worden, of zult Ge mijn onzalige ziel nog door de nieuwe dag verlichten? Ziedaar mijn graf, de dood wacht op mij. Ik vrees Uw gericht, Heer, ik vrees de altijddurende kwellingen, en toch houd ik niet op kwaad te bedrijven: steeds vertoorn ik U, mijn Heer en God, en Uw alreine Moeder en alle hemelse machten en mijn beschermengel.

Ik weet het, Heer, ik ben Uw liefde niet waard, ik ben waard om veroordeeld en gestraft te worden. Gij echter, Heer, red mij, of ik het wil of niet. Als Gij een rechtvaardige redden wilt, dan is dat niet iets groots, en als Gij U over een onschuldige ontfermt, dan is dat geen wonder: zij verdienen Uw barmhartigheid. Maar openbaar door mij, zondaar, Uw genade en Uw liefde voor de mensen, en sta niet toe dat mijn boosheid Uw onuitsprekelijke goedheid en barmhartigheid overweldigt: doe met mij naar Uw wil.

Vlak voordat je gaat slapen

Verlicht mijn ogen, o Christus God, laat mij niet inslapen ten dode; laat mijn vijand niet zeggen: 'Ik heb hem overweldigd.'

Eer aan de Vader, de Zoon en de Heilige Geest.

Wees de Beschermer van mijn ziel, o God, want ik wandel temidden van vele netten; verlos mij daaruit en red mij, o Algoede, want Gij hebt de mensen lief.

Nu en altijd, en in de eeuwen der eeuwen. Amen.

Bezingen wij zonder ophouden met hart en mond de algezegende Moeder van God, die heiliger is dan de heilige engelen. Belijden wij haar als de Moeder van God, want zij heeft waarlijk de Godmens gebaard en houdt niet op voor onze zielen te bidden.`,
  },
];
