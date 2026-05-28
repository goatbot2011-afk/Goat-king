const axios = require("axios");

module.exports = {
  config: {
    name: "aotvideo",
    aliases: ["aotvid", "attackontitanvid", "attackontitanvideo"],
    version: "1.0",
    author: "Christus",
    role: 0,
    countDown: 5,
    description: "Envoie une vidéo aléatoire d'Attack on Titan.",
    category: "anime",
  },

  onStart: async function ({ api, event }) {
    try {
      // Message temporaire pendant le chargement
      const processingMessage = await api.sendMessage(
        "⏳ Patientez quelques secondes...",
        event.threadID,
        event.messageID
      );

      // Récupération de l'API depuis GitHub
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      // Récupération d'une vidéo AOT aléatoire
      const res = await axios.get(`${apiBase}/api/aotvideo`);

      if (!res.data || !res.data.url) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage(
          "❌ Oups ! Une erreur est survenue, réessayez plus tard.",
          event.threadID,
          event.messageID
        );
      }

      const videoUrl = res.data.url;

      // Envoi de la vidéo
      const msg = {
        body: "🎬 Voici une vidéo aléatoire d'Attack on Titan pour toi ! 😊💖",
        attachment: await global.utils.getStreamFromURL(videoUrl),
      };
      await api.sendMessage(msg, event.threadID, event.messageID);

      // Suppression du message temporaire
      await api.unsendMessage(processingMessage.messageID);

    } catch (error) {
      console.error(error);
      await api.sendMessage(
        "❌ Oups ! Une erreur est survenue, réessayez plus tard.",
        event.threadID,
        event.messageID
      );
    }
  },
};
