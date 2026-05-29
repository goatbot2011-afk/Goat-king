const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "give",
    version: "3.0",
    author: "B.michel",
    role: 0,
    shortDescription: "Send money",
    longDescription: "Transfer money to another player",
    category: "economy",
    guide: {
      en: "{p}give @mention amount"
    }
  },

  onStart: async function ({
    api,
    event,
    usersData,
    args
  }) {

    const { senderID, mentions, threadID } = event;

    // =========================
    // CHECK MENTION
    // =========================

    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length === 0) {
      return api.sendMessage(
        "⚠️ Mention someone.\n\nExample:\ngive @Michel 5000",
        threadID
      );
    }

    const targetID = mentionIDs[0];

    // =========================
    // CHECK SELF
    // =========================

    if (targetID == senderID) {
      return api.sendMessage(
        "⚠️ You can't send money to yourself.",
        threadID
      );
    }

    // =========================
    // CHECK AMOUNT
    // =========================

    const amount = parseInt(args[args.length - 1]);

    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage(
        "⚠️ Invalid amount.",
        threadID
      );
    }

    // =========================
    // GET USERS DATA
    // =========================

    const senderData = await usersData.get(senderID);
    const targetData = await usersData.get(targetID);

    const senderMoney = senderData.money || 0;

    // =========================
    // CHECK MONEY
    // =========================

    if (senderMoney < amount) {
      return api.sendMessage(
        "💸 You don't have enough money.",
        threadID
      );
    }

    // =========================
    // UPDATE MONEY
    // =========================

    await usersData.set(senderID, {
      money: senderMoney - amount
    });

    await usersData.set(targetID, {
      money: (targetData.money || 0) + amount
    });

    // =========================
    // PATH
    // =========================

    const cachePath = path.join(__dirname, "cache");

    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }

    const senderPath = path.join(cachePath, "sender.jpg");
    const targetPath = path.join(cachePath, "target.jpg");
    const outputPath = path.join(cachePath, "give.png");

    // =========================
    // DOWNLOAD AVATARS
    // =========================

    const senderAvatar =
      `https://graph.facebook.com/${senderID}/picture?width=720&height=720`;

    const targetAvatar =
      `https://graph.facebook.com/${targetID}/picture?width=720&height=720`;

    const senderRes = await axios({
      url: senderAvatar,
      method: "GET",
      responseType: "arraybuffer"
    });

    const targetRes = await axios({
      url: targetAvatar,
      method: "GET",
      responseType: "arraybuffer"
    });

    fs.writeFileSync(senderPath, Buffer.from(senderRes.data));
    fs.writeFileSync(targetPath, Buffer.from(targetRes.data));

    // =========================
    // CREATE IMAGE
    // =========================

    const canvas = Canvas.createCanvas(1366, 768);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Main card
    ctx.fillStyle = "#121212";
    roundRect(ctx, 60, 60, 1240, 640, 30, true);

    // Top bar
    ctx.fillStyle = "#009dff";
    roundRect(ctx, 420, 25, 520, 70, 35, true);

    ctx.font = "bold 36px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("SECURE TRANSFER", 680, 72);

    // Title
    ctx.font = "bold 70px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Payment Receipt", 680, 170);

    // Lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(120, 210);
    ctx.lineTo(1240, 210);
    ctx.stroke();

    // From / To
    ctx.font = "bold 40px Sans";
    ctx.fillStyle = "#9d9d9d";

    ctx.fillText("FROM", 300, 260);
    ctx.fillText("TO", 1060, 260);

    // Load avatars
    const senderImg = await Canvas.loadImage(senderPath);
    const targetImg = await Canvas.loadImage(targetPath);

    // Sender avatar
    drawCircleImage(ctx, senderImg, 180, 300, 110);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#00cfff";
    ctx.beginPath();
    ctx.arc(290, 410, 115, 0, Math.PI * 2);
    ctx.stroke();

    // Target avatar
    drawCircleImage(ctx, targetImg, 900, 300, 110);
    ctx.strokeStyle = "#ffd000";
    ctx.beginPath();
    ctx.arc(1010, 410, 115, 0, Math.PI * 2);
    ctx.stroke();

    // Arrow
    ctx.font = "bold 100px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("→", 680, 430);

    // Amount box
    ctx.fillStyle = "#0d0d0d";
    roundRect(ctx, 100, 520, 500, 140, 20, true);

    ctx.font = "bold 34px Sans";
    ctx.fillStyle = "#888";
    ctx.textAlign = "left";
    ctx.fillText("AMOUNT TRANSFERRED", 130, 575);

    ctx.font = "bold 75px Sans";
    ctx.fillStyle = "#00ff66";

    let displayAmount;

    if (amount >= 1000000) {
      displayAmount = "$" + (amount / 1000000).toFixed(2) + "M";
    } else {
      displayAmount = "$" + amount.toLocaleString("en-US");
    }

    ctx.fillText(displayAmount, 130, 645);

    // Transaction info
    ctx.fillStyle = "#0d0d0d";
    roundRect(ctx, 650, 520, 560, 140, 20, true);

    ctx.font = "bold 32px Sans";
    ctx.fillStyle = "#888";

    ctx.fillText("TRANSACTION ID", 690, 575);

    const txid =
      Math.random().toString(36)
      .substring(2, 10)
      .toUpperCase();

    ctx.font = "bold 50px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(txid, 690, 630);

    // Date
    const now = new Date();

    ctx.font = "28px Sans";
    ctx.fillStyle = "#cfcfcf";

    ctx.fillText(
      now.toLocaleString(),
      690,
      675
    );

    // Save image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // =========================
    // SEND MESSAGE
    // =========================

    api.sendMessage(
      {
        body:
`💸 MONEY TRANSFER SUCCESSFUL

👤 Sender: ${senderData.name}
🎁 Receiver: ${targetData.name}

💵 Amount:
${amount.toLocaleString("en-US")} $

🏦 Remaining Balance:
${(senderMoney - amount).toLocaleString("en-US")} $`,

        attachment: fs.createReadStream(outputPath),

        mentions: [
          {
            tag: senderData.name,
            id: senderID
          },
          {
            tag: targetData.name,
            id: targetID
          }
        ]
      },
      threadID,
      () => {

        fs.unlinkSync(senderPath);
        fs.unlinkSync(targetPath);
        fs.unlinkSync(outputPath);

      }
    );

    // =========================
    // FUNCTIONS
    // =========================

    function roundRect(ctx, x, y, width, height, radius, fill) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);

      if (fill) ctx.fill();
    }

    function drawCircleImage(ctx, image, x, y, size) {
      ctx.save();

      ctx.beginPath();
      ctx.arc(
        x + size,
        y + size,
        size,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        image,
        x,
        y,
        size * 2,
        size * 2
      );

      ctx.restore();
    }

  }
};
