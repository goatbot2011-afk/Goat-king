const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$"],
    version: "2.0",
    author: "B.michel",
    shortDescription: "Show user balance",
    category: "economy"
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, mentions, threadID } = event;

    let targetID = senderID;
    if (Object.keys(mentions).length > 0)
      targetID = Object.keys(mentions)[0];

    const userData = await usersData.get(targetID);

    const balance = userData.money || 0;
    const userName = userData.name || "Utilisateur";

    try {
      // Avatar Facebook
      const avatarURL = await usersData.getAvatarUrl(targetID);

      const canvas = Canvas.createCanvas(1000, 600);
      const ctx = canvas.getContext("2d");

      // Background
      const bg = ctx.createLinearGradient(0, 0, 1000, 600);
      bg.addColorStop(0, "#111827");
      bg.addColorStop(1, "#1f2937");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Carte principale
      ctx.beginPath();
      ctx.roundRect(40, 40, 920, 520, 30);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      // Bordure
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#00ff99";
      ctx.stroke();

      // Titre
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 55px Sans";
      ctx.textAlign = "center";
      ctx.fillText("💳 BALANCE", 500, 100);

      // Avatar
      const avatar = await Canvas.loadImage(avatarURL);

      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 250, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 90, 160, 180, 180);
      ctx.restore();

      // Contour avatar
      ctx.beginPath();
      ctx.arc(180, 250, 92, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#00ff99";
      ctx.stroke();

      // Nom
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 45px Sans";
      ctx.textAlign = "left";
      ctx.fillText(userName, 330, 220);

      // Texte balance
      ctx.fillStyle = "#94a3b8";
      ctx.font = "30px Sans";
      ctx.fillText("Current Balance", 330, 280);

      // Balance
      ctx.shadowColor = "#00ff99";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#00ff99";
      ctx.font = "bold 70px Sans";
      ctx.fillText(`$${balance.toLocaleString()}`, 330, 380);

      ctx.shadowBlur = 0;

      // Barre décorative
      ctx.fillStyle = "#00ff99";
      ctx.fillRect(330, 430, 500, 8);

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "24px Sans";
      ctx.fillText("Economy System", 330, 500);

      // Sauvegarde
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const imgPath = path.join(cacheDir, `balance_${targetID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      api.sendMessage(
        {
          body: `💳 Balance de ${userName}`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => {
          if (fs.existsSync(imgPath))
            fs.unlinkSync(imgPath);
        }
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Une erreur est survenue lors de la création de la carte balance.",
        threadID
      );
    }
  }
};
