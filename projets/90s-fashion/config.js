// Configuration des API
// ---------------------------------------------------------------
// YouTube Data API v3 : clé gratuite à créer sur
// https://console.cloud.google.com/apis/library/youtube.googleapis.com
// Sans clé, le site affiche des liens de recherche YouTube à la place
// des lecteurs vidéo intégrés.
const CONFIG = {
  YOUTUBE_API_KEY: "",
  VIDEOS_PAR_RECHERCHE: 3,
  // Durée du cache local des résultats YouTube (économise le quota de l'API)
  CACHE_HEURES: 24,
  WIKI_LANGUE_TEXTE: "fr",
  WIKI_LANGUE_IMAGES: "en",
};
