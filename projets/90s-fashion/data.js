// Données éditoriales : les mannequins phares de 1990 à 1999.
// Les photos et biographies sont complétées dynamiquement via l'API Wikipedia,
// les vidéos via l'API YouTube (voir app.js).
const MANNEQUINS = [
  {
    id: "naomi",
    nom: "Naomi Campbell",
    wiki: "Naomi_Campbell",
    pays: "Royaume-Uni",
    naissance: 1970,
    groupe: "Big Six",
    surnom: "La panthère",
    resume:
      "Découverte à 15 ans à Londres, Naomi Campbell devient l'une des figures centrales de l'ère des supermodèles et un visage incontournable de Gianni Versace.",
    moments: [
      "Couverture du Vogue britannique de janvier 1990 par Peter Lindbergh, aux côtés de Linda, Christy, Tatjana et Cindy",
      "Apparaît dans le clip « Freedom! '90 » de George Michael",
      "Chute légendaire en plateformes vertigineuses au défilé Vivienne Westwood automne-hiver 1993",
      "Égérie et habituée des podiums Versace, Chanel et Azzedine Alaïa",
    ],
    marques: ["Versace", "Chanel", "Azzedine Alaïa", "Vivienne Westwood"],
    recherches: [
      "Naomi Campbell Vivienne Westwood 1993 runway fall",
      "Naomi Campbell 90s runway compilation",
    ],
  },
  {
    id: "cindy",
    nom: "Cindy Crawford",
    wiki: "Cindy_Crawford",
    pays: "États-Unis",
    naissance: 1966,
    groupe: "Big Six",
    surnom: "La top américaine",
    resume:
      "Avec son grain de beauté iconique, Cindy Crawford fait le pont entre la mode et la culture populaire : télévision, publicité et podiums.",
    moments: [
      "Animatrice de l'émission « House of Style » sur MTV (1989–1995)",
      "Publicité Pepsi diffusée lors du Super Bowl 1992",
      "Clip « Freedom! '90 » de George Michael",
      "Finale du défilé Versace automne-hiver 1991 avec Linda, Naomi et Christy",
    ],
    marques: ["Versace", "Revlon", "Pepsi", "Chanel"],
    recherches: [
      "Cindy Crawford 90s runway compilation",
      "Versace fall 1991 finale Freedom supermodels",
    ],
  },
  {
    id: "linda",
    nom: "Linda Evangelista",
    wiki: "Linda_Evangelista",
    pays: "Canada",
    naissance: 1965,
    groupe: "Big Six",
    surnom: "La caméléon",
    resume:
      "Originaire de St. Catharines en Ontario, Linda Evangelista est réputée pour sa capacité à se réinventer à chaque saison — sa coupe courte de 1988 est devenue « la Linda ».",
    moments: [
      "Déclaration célèbre au Vogue en 1990 : « Nous ne nous levons pas pour moins de 10 000 $ par jour »",
      "Couverture du Vogue britannique de janvier 1990 par Peter Lindbergh",
      "Clip « Freedom! '90 » de George Michael",
      "Muse de Steven Meisel, multiplie les changements de couleur de cheveux",
    ],
    marques: ["Versace", "Chanel", "Prada", "Yves Saint Laurent"],
    recherches: [
      "Linda Evangelista 90s runway compilation",
      "Linda Evangelista Versace runway 1991",
    ],
  },
  {
    id: "christy",
    nom: "Christy Turlington",
    wiki: "Christy_Turlington",
    pays: "États-Unis",
    naissance: 1969,
    groupe: "Big Six",
    surnom: "Le visage parfait",
    resume:
      "Souvent décrite comme ayant le visage le plus parfait de sa génération, Christy Turlington a incarné l'élégance de Calvin Klein durant toute la décennie.",
    moments: [
      "Visage du parfum Eternity de Calvin Klein",
      "Couverture du Vogue britannique de janvier 1990 par Peter Lindbergh",
      "Clip « Freedom! '90 » de George Michael",
      "Contrat de longue durée avec Maybelline",
    ],
    marques: ["Calvin Klein", "Maybelline", "Versace", "Chanel"],
    recherches: [
      "Christy Turlington 90s runway compilation",
      "Christy Turlington Versace runway",
    ],
  },
  {
    id: "tatjana",
    nom: "Tatjana Patitz",
    wiki: "Tatjana_Patitz",
    pays: "Allemagne",
    naissance: 1966,
    groupe: "Big Six",
    surnom: "La mystérieuse",
    resume:
      "Muse de Peter Lindbergh, Tatjana Patitz (1966–2023) incarnait une beauté plus sombre et romantique au sein du groupe des supermodèles.",
    moments: [
      "Couverture du Vogue britannique de janvier 1990 par Peter Lindbergh",
      "Clip « Freedom! '90 » de George Michael",
      "Campagnes pour Chanel, Versace et Valentino",
    ],
    marques: ["Chanel", "Versace", "Valentino"],
    recherches: ["Tatjana Patitz runway 90s", "Tatjana Patitz Freedom 90"],
  },
  {
    id: "claudia",
    nom: "Claudia Schiffer",
    wiki: "Claudia_Schiffer",
    pays: "Allemagne",
    naissance: 1970,
    groupe: "Big Six",
    surnom: "La Bardot des 90s",
    resume:
      "Repérée dans une discothèque de Düsseldorf, Claudia Schiffer devient la muse de Karl Lagerfeld chez Chanel et l'une des modèles les plus photographiées de la décennie.",
    moments: [
      "Campagnes Guess qui la révèlent à la fin des années 80",
      "Muse de Karl Lagerfeld, ouvre et ferme de nombreux défilés Chanel",
      "Comparée à Brigitte Bardot pour sa blondeur et son allure",
      "Parmi les mannequins les mieux payées du monde au milieu des années 90",
    ],
    marques: ["Chanel", "Guess", "Revlon", "Valentino"],
    recherches: [
      "Claudia Schiffer Chanel runway 90s",
      "Claudia Schiffer 90s runway compilation",
    ],
  },
  {
    id: "kate",
    nom: "Kate Moss",
    wiki: "Kate_Moss",
    pays: "Royaume-Uni",
    naissance: 1974,
    groupe: "Nouvelle vague",
    surnom: "L'anti-supermodèle",
    resume:
      "Petite, naturelle et rebelle, Kate Moss rompt avec le glamour des supermodèles et incarne l'esthétique grunge et minimaliste du milieu de la décennie.",
    moments: [
      "Photos de Corinne Day pour le magazine The Face (1990)",
      "Campagne Calvin Klein Obsession (1993) et CK One",
      "Figure emblématique — et controversée — du « heroin chic »",
      "Défilés pour Calvin Klein, Gucci (ère Tom Ford) et John Galliano",
    ],
    marques: ["Calvin Klein", "Gucci", "Dior", "Chanel"],
    recherches: [
      "Kate Moss 90s runway compilation",
      "Kate Moss Calvin Klein 1990s",
    ],
  },
  {
    id: "helena",
    nom: "Helena Christensen",
    wiki: "Helena_Christensen",
    pays: "Danemark",
    naissance: 1969,
    groupe: "Supermodèles",
    surnom: "La Danoise",
    resume:
      "Ancienne Miss Danemark, Helena Christensen devient l'un des visages majeurs du début des années 90, également reconnue comme photographe.",
    moments: [
      "Couronnée Miss Danemark en 1986",
      "Clip « Wicked Game » de Chris Isaak (1991), réalisé par Herb Ritts",
      "Défilés pour Chanel, Versace et Karl Lagerfeld",
    ],
    marques: ["Chanel", "Versace", "Victoria's Secret"],
    recherches: [
      "Helena Christensen 90s runway",
      "Helena Christensen Chris Isaak Wicked Game",
    ],
  },
  {
    id: "yasmeen",
    nom: "Yasmeen Ghauri",
    wiki: "Yasmeen_Ghauri",
    // Aucune photo libre de droits sur Wikipedia / Commons : ajoutez la vôtre, ex. "images/yasmeen-ghauri.jpg"
    photo: "",
    photoCredit: "",
    pays: "Canada",
    naissance: 1971,
    groupe: "Supermodèles",
    surnom: "L'étoile de Montréal",
    resume:
      "Née à Montréal, Yasmeen Ghauri est découverte dans un McDonald's et devient l'une des marcheuses les plus admirées des podiums du début des années 90.",
    moments: [
      "Découverte à Montréal à la fin des années 80",
      "Favorite de Gianni Versace et de Karl Lagerfeld",
      "Célèbre pour sa démarche, l'une des plus reconnaissables de la décennie",
    ],
    marques: ["Versace", "Chanel", "Valentino", "Christian Dior"],
    recherches: [
      "Yasmeen Ghauri runway walk 90s",
      "Yasmeen Ghauri Versace runway",
    ],
  },
  {
    id: "carla",
    nom: "Carla Bruni",
    wiki: "Carla_Bruni",
    pays: "Italie / France",
    naissance: 1967,
    groupe: "Supermodèles",
    surnom: "L'intellectuelle",
    resume:
      "Née à Turin et élevée en France, Carla Bruni défile pour les plus grandes maisons avant de quitter le mannequinat en 1997 pour la chanson.",
    moments: [
      "Carrière de mannequin de 1987 à 1997",
      "Défilés pour Chanel, Dior, Versace et Yves Saint Laurent",
      "Se tourne ensuite vers la musique (album « Quelqu'un m'a dit », 2002)",
    ],
    marques: ["Chanel", "Christian Dior", "Versace", "Yves Saint Laurent"],
    recherches: ["Carla Bruni runway 90s", "Carla Bruni model catwalk"],
  },
  {
    id: "nadja",
    nom: "Nadja Auermann",
    wiki: "Nadja_Auermann",
    pays: "Allemagne",
    naissance: 1971,
    groupe: "Supermodèles",
    surnom: "Les jambes",
    resume:
      "Avec ses cheveux platine et ses jambes interminables, Nadja Auermann incarne le glamour sculptural de la seconde moitié des années 90.",
    moments: [
      "Nombreuses couvertures de Harper's Bazaar et Vogue au milieu des années 90",
      "Égérie de Versace et de Valentino",
      "Muse des photographes Helmut Newton et Peter Lindbergh",
    ],
    marques: ["Versace", "Valentino", "Chanel", "Karl Lagerfeld"],
    recherches: ["Nadja Auermann runway 90s", "Nadja Auermann Versace"],
  },
  {
    id: "stephanie",
    nom: "Stephanie Seymour",
    wiki: "Stephanie_Seymour",
    pays: "États-Unis",
    naissance: 1968,
    groupe: "Supermodèles",
    surnom: "La star du rock",
    resume:
      "Habituée des couvertures et des podiums, Stephanie Seymour marque aussi la culture rock du début des années 90.",
    moments: [
      "Héroïne des clips « Don't Cry » et « November Rain » de Guns N' Roses",
      "L'un des visages de Victoria's Secret",
      "Défilés pour Versace, Chanel et Valentino",
    ],
    marques: ["Victoria's Secret", "Versace", "Chanel"],
    recherches: ["Stephanie Seymour 90s runway", "Stephanie Seymour Versace runway"],
  },
  {
    id: "karen",
    nom: "Karen Mulder",
    wiki: "Karen_Mulder",
    // Aucune photo libre de droits sur Wikipedia / Commons : ajoutez la vôtre, ex. "images/karen-mulder.jpg"
    photo: "",
    photoCredit: "",
    pays: "Pays-Bas",
    naissance: 1970,
    groupe: "Supermodèles",
    surnom: "La Néerlandaise",
    resume:
      "Finaliste du concours Elite Look of the Year, Karen Mulder devient l'un des visages blonds les plus demandés des podiums européens.",
    moments: [
      "Révélée par le concours Elite Look of the Year (1985)",
      "Égérie de Valentino et de Guess",
      "Présente dans les défilés Chanel, Versace et Victoria's Secret",
    ],
    marques: ["Valentino", "Guess", "Chanel", "Versace"],
    recherches: ["Karen Mulder runway 90s", "Karen Mulder Valentino"],
  },
  {
    id: "shalom",
    nom: "Shalom Harlow",
    wiki: "Shalom_Harlow",
    pays: "Canada",
    naissance: 1973,
    groupe: "Nouvelle vague",
    surnom: "La danseuse",
    resume:
      "Originaire de l'Ontario, Shalom Harlow est connue pour sa présence théâtrale sur les podiums et a vécu l'un des moments les plus célèbres de l'histoire des défilés.",
    moments: [
      "Finale du défilé Alexander McQueen printemps-été 1999 (« No. 13 ») : sa robe est peinte en direct par deux robots",
      "Co-animatrice de « House of Style » sur MTV",
      "Défilés pour Versace, Chanel, Calvin Klein et Isaac Mizrahi",
    ],
    marques: ["Alexander McQueen", "Versace", "Calvin Klein"],
    recherches: [
      "Alexander McQueen No 13 1999 Shalom Harlow robots",
      "Shalom Harlow runway 90s",
    ],
  },
  {
    id: "amber",
    nom: "Amber Valletta",
    wiki: "Amber_Valletta",
    pays: "États-Unis",
    naissance: 1974,
    groupe: "Nouvelle vague",
    surnom: "La Vogue girl",
    resume:
      "Originaire de l'Oklahoma, Amber Valletta enchaîne les couvertures de Vogue dans la seconde moitié de la décennie et devient un pilier des campagnes Calvin Klein.",
    moments: [
      "Nombreuses couvertures de Vogue dans les années 90",
      "Campagnes Calvin Klein, Versace et Gucci",
      "Duo emblématique avec Shalom Harlow sur les podiums",
    ],
    marques: ["Calvin Klein", "Versace", "Gucci", "Chanel"],
    recherches: ["Amber Valletta runway 90s", "Amber Valletta Versace runway"],
  },
  {
    id: "eva",
    nom: "Eva Herzigová",
    wiki: "Eva_Herzigová",
    pays: "République tchèque",
    naissance: 1973,
    groupe: "Nouvelle vague",
    surnom: "Hello Boys",
    resume:
      "Venue de Litvínov, Eva Herzigová devient célèbre du jour au lendemain grâce à une campagne publicitaire devenue culte.",
    moments: [
      "Campagne Wonderbra « Hello Boys » (1994), l'une des publicités les plus célèbres de la décennie",
      "Campagnes Guess",
      "Défilés pour Versace et Dolce & Gabbana",
    ],
    marques: ["Wonderbra", "Guess", "Versace", "Dolce & Gabbana"],
    recherches: ["Eva Herzigova runway 90s", "Eva Herzigova Versace runway"],
  },
  {
    id: "tyra",
    nom: "Tyra Banks",
    wiki: "Tyra_Banks",
    pays: "États-Unis",
    naissance: 1973,
    groupe: "Nouvelle vague",
    surnom: "La pionnière",
    resume:
      "Après avoir débuté sur les podiums parisiens, Tyra Banks devient une icône commerciale et brise plusieurs barrières pour les mannequins noirs.",
    moments: [
      "Débute à Paris où elle décroche de nombreux défilés dès sa première saison",
      "Couverture de Sports Illustrated Swimsuit en 1996, puis en solo en 1997",
      "Ange de Victoria's Secret",
    ],
    marques: ["Victoria's Secret", "Chanel", "Yves Saint Laurent"],
    recherches: ["Tyra Banks runway 90s", "Tyra Banks Chanel runway 90s"],
  },
  {
    id: "gisele",
    nom: "Gisele Bündchen",
    wiki: "Gisele_Bündchen",
    pays: "Brésil",
    naissance: 1980,
    groupe: "Fin de décennie",
    surnom: "The Body",
    resume:
      "Arrivée à la toute fin de la décennie, Gisele Bündchen annonce le retour du mannequin glamour et pulpeux après l'ère du minimalisme.",
    moments: [
      "Défilé Alexander McQueen printemps-été 1998 sous une pluie artificielle",
      "Couverture du Vogue américain de juillet 1999 : « The Return of the Sexy Model »",
      "Prélude à sa domination des années 2000",
    ],
    marques: ["Alexander McQueen", "Dolce & Gabbana", "Versace"],
    recherches: [
      "Gisele Bundchen Alexander McQueen 1998 runway",
      "Gisele Bundchen runway 1999",
    ],
  },
];

const DEFILES = [
  {
    annee: 1991,
    titre: "Versace automne-hiver 1991",
    texte:
      "Linda, Cindy, Naomi et Christy défilent main dans la main en chantant « Freedom! '90 » de George Michael : le symbole même de l'ère des supermodèles.",
    recherche: "Versace fall winter 1991 finale Freedom supermodels",
  },
  {
    annee: 1993,
    titre: "Vivienne Westwood automne-hiver 1993",
    texte:
      "Naomi Campbell trébuche sur des plateformes de près de 25 cm — et se relève en riant. Les chaussures sont aujourd'hui exposées au Victoria and Albert Museum.",
    recherche: "Naomi Campbell falls Vivienne Westwood 1993",
  },
  {
    annee: 1995,
    titre: "Gucci par Tom Ford automne-hiver 1995",
    texte:
      "Velours, satin et sensualité : la collection qui relance Gucci et définit le glamour minimaliste du milieu des années 90.",
    recherche: "Gucci fall 1995 Tom Ford runway",
  },
  {
    annee: 1998,
    titre: "Alexander McQueen printemps-été 1998",
    texte:
      "Une pluie dorée tombe sur le podium : une jeune Gisele Bündchen y marque les esprits.",
    recherche: "Alexander McQueen spring 1998 Golden Shower runway",
  },
  {
    annee: 1999,
    titre: "Alexander McQueen printemps-été 1999 — « No. 13 »",
    texte:
      "Shalom Harlow tourne sur une plateforme pendant que deux robots industriels aspergent sa robe blanche de peinture. Un moment d'anthologie.",
    recherche: "Alexander McQueen No 13 Shalom Harlow robot spray paint",
  },
];

const CHRONOLOGIE = [
  { annee: 1990, texte: "Couverture du Vogue britannique de janvier par Peter Lindbergh : naissance officielle des supermodèles." },
  { annee: 1990, texte: "Clip « Freedom! '90 » de George Michael réalisé par David Fincher." },
  { annee: 1991, texte: "Finale du défilé Versace : Linda, Cindy, Naomi et Christy chantent « Freedom »." },
  { annee: 1992, texte: "Publicité Pepsi de Cindy Crawford au Super Bowl." },
  { annee: 1993, texte: "Kate Moss et le minimalisme de Calvin Klein annoncent la fin du glamour excessif." },
  { annee: 1994, texte: "Campagne Wonderbra « Hello Boys » avec Eva Herzigová." },
  { annee: 1995, texte: "Tom Ford redéfinit Gucci ; le documentaire « Unzipped » suit Isaac Mizrahi." },
  { annee: 1997, texte: "Assassinat de Gianni Versace à Miami, choc pour l'industrie qu'il avait façonnée." },
  { annee: 1999, texte: "Vogue proclame « le retour du mannequin sexy » avec Gisele Bündchen." },
];
