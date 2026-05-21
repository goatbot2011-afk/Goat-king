const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gem",
    version: "2.4.0",
    author: "B.michel",
    role: 0,
    category: "image",
    shortDescription: "AI Image Generator",
    longDescription: "Generate AI images with different styles",
    guide: "{pn} gem anime samurai"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      if (!event.body) return;

      const body = event.body.trim();

      if (!body.toLowerCase().startsWith("gem")) return;

      const input = body.slice(3).trim();

      if (!input) {
        return message.reply("🧠 | Exemple: gem anime samurai");
      }

      let style = "ultra detailed, masterpiece, high quality";

      const lower = input.toLowerCase();

      if (lower.includes("anime"))
        style = "anime style, beautiful anime art";

      if (lower.includes("real"))
        style = "photorealistic, ultra realistic, 8k";

      if (lower.includes("3d"))
        style = "3D render, cinematic lighting";

      if (lower.includes("cartoon"))
        style = "cartoon style, colorful";

      if (lower.includes("neon"))
        style = "cyberpunk neon style";

      const cleanPrompt = input
        .replace(/anime|real|3d|cartoon|neon/gi, "")
        .trim();

      const finalPrompt = `${cleanPrompt}, ${style}`;

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;

      const wait = await message.reply("⏳ | Génération de l'image...");

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000
      });

      const tempDir = path.join(__dirname, "cache");

      await fs.ensureDir(tempDir);

      const imgPath = path.join(tempDir, `gem_${Date.now()}.png`);

      await fs.writeFile(imgPath, response.data);

      await message.unsend(wait.messageID);

      return message.reply({
        body: `✅ | Image générée\n👑 Author: B.michel`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ | Erreur lors de la génération.");
    }
  }
};
