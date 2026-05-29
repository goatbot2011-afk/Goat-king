const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// --- Helpers ---
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// --- Variable globale pour le wallpaper ---
let wallpaper = null;

module.exports = {
  config: {
    name: "activity",
    version: "5.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: "Generate flashy activity dashboard with custom background and themes",
    category: "info",
    guide: "{pn} [@tag or userID] / setwall / themes / createtheme"
  },

  onStart: async function ({ event, message, usersData, threadsData, args, globalData }) {
    try {
      const senderID = event.senderID;
      const messageReply = event.messageReply;

      // --------------------------
      // Handle setwall command
      // --------------------------
      if (args[0] && args[0].toLowerCase() === 'setwall') {
        if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
          return message.reply("❌ Vous devez répondre à une image pour définir le wallpaper.");
        }

        const imageUrl = messageReply.attachments[0].url;
        try {
          const cacheDir = path.join(__dirname, "cache");
          if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

          const wallPath = path.join(cacheDir, `wallpaper_${senderID}.jpg`);
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(wallPath, response.data);

          wallpaper = wallPath;
          return message.reply("✅ Arrière-plan personnalisé défini avec succès !");
        } catch (error) {
          console.error("Erreur lors du téléchargement du wallpaper :", error);
          return message.reply("❌ Impossible de définir l'arrière-plan.");
        }
      }

      // --------------------------
      // Handle themes command
      // --------------------------
      if (args[0] && args[0].toLowerCase() === 'themes') {
        const customThemes = await getCustomThemes(globalData);
        const allThemes = { ...themes, ...customThemes };

        let themeList = "";
        let count = 0;

        const popularThemes = ['classic', 'love', 'tie_dye', 'space', 'forest', 'sunset'];
        const gradientThemes = ['ocean', 'berry', 'sunflower', 'lavender', 'rose', 'peach'];
        const colorThemes = ['mint', 'grape', 'lemon', 'sky', 'cotton_candy', 'neon'];
        const specialThemes = ['rainbow', 'gold', 'silver', 'coffee', 'midnight', 'aurora'];
        const gemThemes = ['emerald', 'sapphire', 'amethyst', 'ruby', 'tropical', 'galaxy'];

        themeList += "🌟 POPULAR THEMES:\n";
        popularThemes.forEach(t => { if (allThemes[t]) { themeList += `• ${t}\n`; count++; } });
        themeList += "\n🎨 GRADIENT THEMES:\n";
        gradientThemes.forEach(t => { if (allThemes[t]) { themeList += `• ${t}\n`; count++; } });
        themeList += "\n🌈 COLOR THEMES:\n";
        colorThemes.forEach(t => { if (allThemes[t]) { themeList += `• ${t}\n`; count++; } });
        themeList += "\n💎 SPECIAL THEMES:\n";
        specialThemes.forEach(t => { if (allThemes[t]) { themeList += `• ${t}\n`; count++; } });
        themeList += "\n✨ GEM THEMES:\n";
        gemThemes.forEach(t => { if (allThemes[t]) { themeList += `• ${t}\n`; count++; } });

        const customThemeNames = Object.keys(customThemes);
        if (customThemeNames.length > 0) {
          themeList += "\n🎯 CUSTOM THEMES:\n";
          customThemeNames.forEach(t => { themeList += `• ${t}\n`; count++; });
        }

        return message.reply(getLang("themeList", count, themeList) + "\n" + getLang("customThemeHelp"));
      }

      // --------------------------
      // Handle createtheme command
      // --------------------------
      if (args[0] && args[0].toLowerCase() === 'createtheme') {
        if (args.length < 6) return me...
