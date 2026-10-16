// Réalisations des années 90, classées par catégorie, pour chaque mannequin.
// Complété dans la fiche par l'article Wikipedia intégral (onglet « Carrière »).
const CATEGORIES_CARRIERE = {
  defiles: "Défilés et fashion weeks",
  campagnes: "Campagnes publicitaires",
  couvertures: "Couvertures de magazines",
  ecran: "Clips, cinéma et télévision",
  autres: "Autres projets",
};

const CARRIERES = {
  naomi: {
    defiles: [
      "Versace automne-hiver 1991 : finale « Freedom » avec Linda, Cindy et Christy",
      "Vivienne Westwood automne-hiver 1993 : la chute en plateformes, devenue culte",
      "Muse d'Azzedine Alaïa, présente à ses défilés tout au long de la décennie",
      "Chanel, Isaac Mizrahi, Dolce & Gabbana, Valentino",
    ],
    couvertures: [
      "Vogue Paris 1988 : première mannequin noire en couverture de l'édition française",
      "Vogue britannique, janvier 1990 : « Les supermodèles » de Peter Lindbergh",
      "Time, 1991 : première mannequin noire en couverture du magazine",
    ],
    ecran: [
      "« Freedom! '90 » de George Michael (1990)",
      "« In the Closet » de Michael Jackson (1992)",
      "Documentaire « Unzipped » sur Isaac Mizrahi (1995)",
      "Film « Girl 6 » de Spike Lee (1996)",
    ],
    autres: [
      "Album « Babywoman » (1994)",
      "Roman « Swan » (1994)",
      "Cofondatrice du Fashion Café à New York (1995) avec Claudia Schiffer et Elle Macpherson",
    ],
  },
  cindy: {
    defiles: [
      "Versace automne-hiver 1991 : finale « Freedom »",
      "Chanel, Versace, Isaac Mizrahi, Valentino",
    ],
    campagnes: [
      "Revlon : contrat de longue durée, l'un des plus célèbres de la décennie",
      "Pepsi : publicité du Super Bowl 1992",
      "Omega : ambassadrice à partir de 1995",
    ],
    couvertures: [
      "Vogue britannique, janvier 1990",
      "Vanity Fair, août 1993, avec k.d. lang",
    ],
    ecran: [
      "Animatrice de « House of Style » sur MTV (1989–1995)",
      "« Freedom! '90 » de George Michael (1990)",
      "Vidéos d'exercice « Shape Your Body Workout » (1992)",
      "Film « Fair Game » avec William Baldwin (1995)",
    ],
  },
  linda: {
    defiles: [
      "Versace automne-hiver 1991 : finale « Freedom »",
      "Chanel, Versace, Isaac Mizrahi, Yves Saint Laurent",
    ],
    campagnes: ["L'Oréal", "Versace", "Chanel"],
    couvertures: [
      "Vogue britannique, janvier 1990",
      "Nombreuses couvertures de Vogue Italia photographiées par Steven Meisel",
    ],
    ecran: [
      "« Freedom! '90 » (1990) et « Too Funky » (1992) de George Michael",
      "Documentaire « Unzipped » (1995)",
    ],
    autres: [
      "Coupe courte de 1988 signée Julien d'Ys, surnommée « la Linda »",
      "Phrase devenue culte, en 1990 : « Nous ne nous levons pas pour moins de 10 000 $ par jour »",
    ],
  },
  christy: {
    defiles: [
      "Versace automne-hiver 1991 : finale « Freedom »",
      "Chanel, Versace, Calvin Klein",
    ],
    campagnes: [
      "Calvin Klein Eternity : visage du parfum",
      "Maybelline : contrat de longue durée à partir de 1988",
    ],
    couvertures: ["Vogue britannique, janvier 1990"],
    ecran: ["« Freedom! '90 » de George Michael (1990)"],
    autres: [
      "S'éloigne des podiums au milieu de la décennie pour étudier à l'Université de New York (diplômée en 1999)",
    ],
  },
  tatjana: {
    defiles: ["Chanel, Versace, Valentino"],
    couvertures: ["Vogue britannique, janvier 1990, par Peter Lindbergh"],
    ecran: [
      "« Freedom! '90 » de George Michael (1990)",
      "Film « Rising Sun » (Soleil levant, 1993) avec Sean Connery",
    ],
    autres: ["Muse de Peter Lindbergh"],
  },
  claudia: {
    defiles: [
      "Muse de Karl Lagerfeld chez Chanel, elle ouvre et ferme de nombreux défilés",
      "Versace, Valentino",
    ],
    campagnes: ["Guess", "Chanel", "Revlon"],
    ecran: [
      "Film « Prêt-à-Porter » de Robert Altman (1994)",
      "Caméo dans « Richie Rich » (1994)",
    ],
    autres: ["Cofondatrice du Fashion Café à New York (1995)"],
  },
  kate: {
    defiles: ["Calvin Klein, Gucci (ère Tom Ford), John Galliano, Versace, Chanel"],
    campagnes: [
      "Calvin Klein Obsession (1993)",
      "CK One (1994)",
    ],
    couvertures: [
      "The Face, juillet 1990 : « The 3rd Summer of Love » par Corinne Day",
      "Première couverture du Vogue britannique en 1993",
    ],
    autres: ["Visage du minimalisme et du « heroin chic » du milieu de la décennie"],
  },
  helena: {
    defiles: ["Chanel, Versace, Karl Lagerfeld"],
    campagnes: ["Victoria's Secret"],
    ecran: ["« Wicked Game » de Chris Isaak, réalisé par Herb Ritts (1991)"],
    autres: [
      "Miss Danemark 1986",
      "Cofondatrice du magazine Nylon (1999)",
      "Photographe reconnue en parallèle de sa carrière de mannequin",
    ],
  },
  yasmeen: {
    defiles: [
      "Versace, Chanel, Valentino, Christian Dior",
      "Réputée pour l'une des démarches les plus reconnaissables de la décennie",
    ],
    campagnes: ["Victoria's Secret (catalogues)"],
    autres: ["Découverte à Montréal, sa ville natale"],
  },
  carla: {
    defiles: ["Chanel, Christian Dior, Versace, Yves Saint Laurent"],
    campagnes: ["Guess"],
    autres: [
      "Carrière de mannequin de 1987 à 1997",
      "Se tourne ensuite vers la chanson (album « Quelqu'un m'a dit », 2002)",
    ],
  },
  nadja: {
    defiles: ["Versace, Valentino, Chanel, Karl Lagerfeld"],
    campagnes: ["Valentino", "Versace"],
    couvertures: ["Harper's Bazaar et Vogue, à de nombreuses reprises au milieu des années 90"],
    autres: ["Muse des photographes Helmut Newton et Peter Lindbergh"],
  },
  stephanie: {
    defiles: ["Versace, Chanel, Valentino"],
    campagnes: ["Victoria's Secret"],
    ecran: ["« Don't Cry » et « November Rain » de Guns N' Roses (1991–1992)"],
  },
  karen: {
    defiles: ["Valentino, Chanel, Versace"],
    campagnes: ["Guess", "Valentino", "Victoria's Secret"],
    autres: ["Révélée par le concours Elite Look of the Year (1985)"],
  },
  shalom: {
    defiles: [
      "Alexander McQueen printemps-été 1999 (« No. 13 ») : robe peinte en direct par deux robots",
      "Versace, Chanel, Calvin Klein, Isaac Mizrahi",
    ],
    ecran: [
      "Coanimatrice de « House of Style » sur MTV avec Amber Valletta",
      "Film « In & Out » (1997)",
    ],
  },
  amber: {
    defiles: ["Versace, Chanel, Calvin Klein, Gucci"],
    campagnes: ["Calvin Klein", "Versace", "Gucci"],
    couvertures: ["Nombreuses couvertures de Vogue dans la seconde moitié de la décennie"],
    ecran: ["Coanimatrice de « House of Style » sur MTV avec Shalom Harlow"],
  },
  eva: {
    defiles: ["Versace, Dolce & Gabbana"],
    campagnes: [
      "Wonderbra « Hello Boys » (1994)",
      "Guess",
    ],
  },
  tyra: {
    defiles: [
      "Débuts à Paris en 1991, où elle enchaîne les défilés dès sa première saison",
      "Chanel, Yves Saint Laurent",
    ],
    campagnes: ["Victoria's Secret"],
    couvertures: [
      "Sports Illustrated Swimsuit 1996 (avec Valeria Mazza)",
      "Sports Illustrated Swimsuit 1997, en solo",
    ],
    ecran: [
      "Rôle récurrent dans « Le Prince de Bel-Air »",
      "Film « Higher Learning » de John Singleton (1995)",
    ],
  },
  gisele: {
    defiles: [
      "Alexander McQueen printemps-été 1998, sous une pluie artificielle",
      "Dolce & Gabbana, Versace",
    ],
    couvertures: ["Vogue américain, juillet 1999 : « The Return of the Sexy Model »"],
  },
};
