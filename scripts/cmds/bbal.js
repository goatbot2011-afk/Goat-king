const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$"],
    version: "1.0",
    author: "B.michel",
    shortDescription: "Show user balance",
    category: "economy"
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, mentions, threadID } = event;
    let targetID = senderID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

    const userData = await usersData.get(targetID);
    const balance = userData.money || 0;
    const userName = userData.name || "Utilisateur";

    // =====================
    // Canvas
    // =====================
    const canvas = Canvas.createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 50px Sans";
    ctx.textAlign = "center";
    ctx.fillText("BALANCE", canvas.width / 2, 70);

    // User name
    ctx.font = "bold 40px Sans";
    ctx.fillText(userName, canvas.width / 2, 150);

    // Load avatar (ici image uploadée)
    const avatarImg = await Canvas.loadImage("/mnt/data/received_1012144208030421.webp");
    const avatarSize = 150;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarSize + 50, 300, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 25, 225, avatarSize, avatarSize);
    ctx.restore();

    // Balance
    ctx.font = "bold 60px Sans";
    ctx.fillStyle = "#00ff66";
    ctx.fillText(`$${balance.toLocaleString()}`, canvas.width / 2, 400);

    // Save image
    const imgPath = path.join(__dirname, "cache", `balance_${targetID}.png`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

    // Send message
    api.sendMessage(
      { 
        body: `💳 Balance de ${userName}`, 
        attachment: fs.createReadStream(imgPath) 
      },
      threadID,
      () => fs.unlinkSync(imgPath)
    );
  }
};
