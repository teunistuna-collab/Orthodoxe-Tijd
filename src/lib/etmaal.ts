// Diensten van het etmaal met hun psalmen: de enige bron voor Etmaal, Vandaag en Psalmen.
// Verplaatst uit UrenCyclus.tsx, inhoud ongewijzigd.

export type PsalmMapping = {
  title: string;
  pdf: string;
};

export type ServiceMapping = {
  title: string;
  time: string;
  ring: number;
  dot: string;
  pdf: string;
  psalms: PsalmMapping[];
  kernvers: {
    reference: string;
    verses: string[];
  };
  // Hoofdgedachtenis per dienst, bron: "De orthodoxe etmaalcyclus.docx".
  hoofdgedachtenis: string;
};

export const serviceConfig: ServiceMapping[] = [
  {
    title: 'Vespers',
    time: '18:00',
    ring: 18,
    dot: '#d9a645',
    pdf: '/data/pdfs/Vespers.pdf',
    kernvers: { reference: 'Psalm Kernvers: 103(104):24', verses: ['Hoe groots zijn uw werken,', 'Heer, met wijsheid hebt U alles gemaakt.'] },
    psalms: [
      { title: 'Psalm 103', pdf: '/data/pdfs/Psalm 103.pdf' },
      { title: 'Psalm 140', pdf: '/data/pdfs/Psalm 140.pdf' },
    ],
    hoofdgedachtenis: 'Begin kerkelijke dag; avond en licht',
  },
  {
    title: 'Completen',
    time: '21:00',
    ring: 21,
    dot: '#b76b39',
    pdf: '/data/pdfs/Completen.pdf',
    kernvers: { reference: 'Psalm Kernvers: 50:12', verses: ['Schep een rein hart in mij, God,', 'en vernieuw in mijn binnenste een oprechte geest.'] },
    psalms: [{ title: 'Psalm 50', pdf: '/data/pdfs/Psalm 50.pdf' }],
    hoofdgedachtenis: 'Gebed vóór de nachtrust',
  },
  {
    title: 'Middernachtdienst',
    time: '00:00',
    ring: 0,
    dot: '#8c4a35',
    pdf: '/data/pdfs/Middernachtdienst.pdf',
    kernvers: { reference: 'Psalm Kernvers: 118:12', verses: ['Gezegend bent U, Heer,', 'leer mij uw voorschriften.'] },
    psalms: [{ title: 'Psalm 118', pdf: '/data/pdfs/Psalm 118.pdf' }],
    hoofdgedachtenis: 'Waakzaamheid en verwachting',
  },
  {
    title: 'Metten',
    time: '03:00',
    ring: 3,
    dot: '#d9c07a',
    pdf: '/data/pdfs/Metten.pdf',
    kernvers: { reference: 'Psalm Kernvers: 62(63):9', verses: ['Ik ben aan U gehecht, met heel mijn ziel,', 'uw rechterhand houdt mij vast.'] },
    psalms: [
      { title: 'Psalm 62', pdf: '/data/pdfs/Psalm 62.pdf' },
      { title: 'Psalm 102', pdf: '/data/pdfs/Psalm 102.pdf' },
    ],
    hoofdgedachtenis: 'Morgenlof en het komende licht',
  },
  {
    title: 'Eerste Uur',
    time: '06:00',
    ring: 6,
    dot: '#f0d589',
    pdf: '/data/pdfs/Eerste uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 89(90):17', verses: ['Laat de glans van de Heer, onze God, op ons rusten.', 'Bevestig het werk van onze handen,', 'ja, het werk van onze handen, bevestig dat.'] },
    psalms: [{ title: 'Psalm 89', pdf: '/data/pdfs/Psalm 89.pdf' }],
    hoofdgedachtenis: 'Begin van de dag',
  },
  {
    title: 'Derde Uur',
    time: '09:00',
    ring: 9,
    dot: '#5d8f62',
    pdf: '/data/pdfs/Derde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 24(25):4', verses: ['Heer, maak mij uw wegen bekend', 'en leer mij uw paden'] },
    psalms: [{ title: 'Psalm 24', pdf: '/data/pdfs/Psalm 24.pdf' }],
    hoofdgedachtenis: 'Neerdaling van de Heilige Geest',
  },
  {
    title: 'Zesde Uur',
    time: '12:00',
    ring: 12,
    dot: '#d3bb52',
    pdf: '/data/pdfs/Zesde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 90(91):9-10', verses: ['Als je de Allerhoogste tot je schuilplaats maakt,', 'zal het kwaad je niet bereiken,', 'geen plaag je tent ooit naderen.'] },
    psalms: [{ title: 'Psalm 90', pdf: '/data/pdfs/Psalm 90.pdf' }],
    hoofdgedachtenis: 'Christus aan het Kruis',
  },
  {
    title: 'Negende Uur',
    time: '15:00',
    ring: 15,
    dot: '#efe0c2',
    pdf: '/data/pdfs/Negende uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 84(85):11', verses: ['Barmhartigheid en waarheid omhelzen elkaar,', 'rechtvaardigheid en vrede begroeten elkaar met een kus.'] },
    psalms: [{ title: 'Psalm 84', pdf: '/data/pdfs/Psalm 84.pdf' }],
    hoofdgedachtenis: 'De dood van Christus aan het Kruis',
  },
];
