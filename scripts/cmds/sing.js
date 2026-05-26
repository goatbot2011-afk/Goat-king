 const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music", "lyrics"],
    version: "1.4",
    author: "B.michel",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Fast YouTube audio + lyrics download" },
    category: "media",
    guide: { en: "{pn} <song name>" }
  },

  onStart: async function ({ message, args, event, api }) {
    const query = args.join(" ");
    if (!query) return message.reply("Donne un nom de chanson.");

    api.setMessageReaction("⏳", event.messageID);

    try {
      const { data } = await axios.get(
        `https://neokex-dlapis.vercel.app/api/search?q=${encodeURIComponent(query)}`,
        { timeout: 8000 }
      );
      if (!data.results?.length) return message.reply("Aucun résultat trouvé.");
      
      const selected = data.results[0];
      const [artist, title] = selected.title.includes(" - ") 
        ? selected.title.split(" - ", 2) 
        : [query, selected.title];

      const dlRes = await axios.get(
        `https://neokex-dlapis.vercel.app/api/alldl?url=${encodeURIComponent(selected.url)}`,
        { timeout: 8000 }
      );
      const pollUrl = dlRes.data.audio.downloadUrl;
      if (!pollUrl) throw new Error("L'API n'a pas renvoyé de lien.");

      let streamUrl = null;
      for (let i = 0; i < 40; i++) {
        const statusRes = await axios.get(pollUrl, { timeout: 5000 });
        if (statusRes.data.status === "completed") {
          streamUrl = statusRes.data.viewUrl;
          break;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (!streamUrl) throw new Error("Timeout audio.");

      let lyricsText = null;
      try {
        const lyricsRes = await axios.get(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
          { timeout: 5000 }
        );
        lyricsText = lyricsRes.data.lyrics;
      } catch {
        lyricsText = null;
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `${Date.now()}.mp3`);

      const fileRes = await axios.get(streamUrl, { 
        responseType: "arraybuffer",
        timeout: 30000 
      });
      await fs.writeFile(filePath, fileRes.data);

      await message.reply({
        body: `🎵 ${selected.title}\n⏱️ ${selected.duration}`,
        attachment: fs.createReadStream(filePath)
      });

      if (lyricsText) {
        const shortLyrics = lyricsText.length > 4000 
          ? lyricsText.slice(0, 4000) + "\n\n...Paroles coupées" 
          : lyricsText;
        await message.reply(`📜 **Paroles:**\n\n${shortLyrics}`);
      } else {
        await message.reply("📜 Pas de paroles trouvées pour ce titre.");
      }

      api.setMessageReaction("✅", event.messageID);
      fs.remove(filePath).catch(() => {});

    } catch (e) {
      api.setMessageReaction("❌", event.messageID);
      message.reply("Erreur: " + (e.message || "Serveur lent ou down"));
    }
  }
};
