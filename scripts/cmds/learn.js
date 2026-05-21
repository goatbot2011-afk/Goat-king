const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "learn",
    aliases: ["cours", "tuto", "dev"],
    version: "5.0",
    author: "B.michel",
    editor: "Camille 2.0 🍎",
    countDown: 5,
    role: 0,
    category: "education",
    shortDescription: "Apprendre le code avec l'API Shizu (White Room Edition)"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    
    // Configuration de l'API extraite de ton code
    const API_ENDPOINT = "https://shizuai.vercel.app/chat";
    const imgUrl = "https://i.ibb.co/8LBPg4YX/682737295-994456263277856-2980690542480371984-n-jpg-nc-cat-111-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-F.jpg";
    const cachePath = path.join(__dirname, "cache", `learn_${Date.now()}.jpg`);

    if (!query) {
      return message.reply("🍎 Quel concept de génie veux-tu apprendre aujourd'hui ?\nExemple : `/learn comment créer une boucle en Python` 🏌🏽‍♂️");
    }

    message.reply("🍎 Camille 2.0 interroge les serveurs de la White Room... ⏳");

    try {
      // Appel à l'API Shizu avec ton UID
      const response = await axios.post(API_ENDPOINT, { 
        uid: senderID, 
        message: `Fais un cours court et structuré avec un exemple de code sur : ${query}. Réponds en français comme un mentor expert.` 
      });

      // On nettoie la réponse pour enlever les traces de Shizu et garder l'esprit Camille 2.0
      let courseContent = response.data.reply || "Aucune réponse reçue.";
      courseContent = courseContent
        .replace(/Shizu/gi, 'Camille 2.0')
        .replace(/Aryan Chauhan/gi, 'Camille');

      const formattedMsg = 
        `🍎 ━━━━━━━━━━━━━━━ 🍎\n` +
        `   𝐖𝐇𝐈𝐓𝐄 𝐑𝐎𝐎𝐌 𝐀𝐂𝐀𝐃𝐄𝐌𝐘\n` +
        `🍎 ━━━━━━━━━━━━━━━ 🍎\n\n` +
        `${courseContent}\n\n` +
        `🍎 ━━━━━━━━━━━━━━━ 🍎\n` +
        `   𝐄𝐝𝐢𝐭𝐞𝐝 𝐛𝐲 𝐂𝐚𝐦𝐢𝐥𝐥𝐞 𝟐.𝟎 🍎`;

      // Téléchargement et envoi du visuel Ayanokōji
      await fs.ensureDir(path.join(__dirname, "cache"));
      const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(cachePath, Buffer.from(imgRes.data, 'utf-8'));

      return api.sendMessage({
        body: formattedMsg,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (err) {
      console.error("❌ Learn API Error:", err.message);
      return api.sendMessage("⚠️ Erreur de connexion aux archives secrètes. Réessaye plus tard.", threadID, messageID);
    }
  }
};
