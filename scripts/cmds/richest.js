const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "richest",
    aliases: ["topmoney", "moneytop"],
    version: "4.0",
    author: "B.michel",
    role: 0,
    shortDescription: "Richest leaderboard",
    longDescription: "Show richest players leaderboard",
    category: "economy",
    guide: {
      en: "{p}richest [number]"
    }
  },

  onStart: async function ({
    api,
    event,
    usersData,
    args
  }) {

    const { threadID } = event;

    // =========================
    // NUMBER OF USERS
    // =========================

    let limit = parseInt(args[0]) || 10;

    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    // =========================
    // GET USERS
    // =========================

    let allUsers = await usersData.getAll();

    allUsers = allUsers
      .filter(user => user.money && user.money > 0)
      .sort((a, b) => b.money - a.money)
      .slice(0, limit);

    if (allUsers.length === 0) {
      return api.sendMessage(
        "❌ No users found.",
        threadID
      );
    }

    // =========================
    // CANVAS HEIGHT
    // =========================

    const canvasHeight =
      280 + (allUsers.length * 95);

    const canvas = Canvas.createCanvas(
      1400,
      canvasHeight
    );

    const ctx = canvas.getContext("2d");

    // =========================
    // BACKGROUND
    // =========================

    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#121212";

    roundRect(
      ctx,
      50,
      40,
      1300,
      canvasHeight - 80,
      30,
      true
    );

    // =========================
    // TOP BAR
    // =========================

    ctx.fillStyle = "#00aaff";

    roundRect(
      ctx,
      430,
      20,
      540,
      70,
      35,
      true
    );

    ctx.font = "bold 38px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    ctx.fillText(
      "GLOBAL MONEY LEADERBOARD",
      700,
      65
    );

    ctx.font = "bold 70px Sans";

    ctx.fillText(
      `TOP ${limit} RICHEST`,
      700,
      170
    );

    // =========================
    // USERS
    // =========================

    let startY = 250;

    for (let i = 0; i < allUsers.length; i++) {

      const user = allUsers[i];

      const uid =
        user.userID ||
        user.id;

      // Avatar
      const avatarUrl =
        `https://graph.facebook.com/${uid}/picture?width=720&height=720`;

      const response = await axios({
        url: avatarUrl,
        method: "GET",
        responseType: "arraybuffer"
      });

      const avatar =
        await Canvas.loadImage(
          Buffer.from(response.data)
        );

      // Row Background
      ctx.fillStyle = "#1b1b1b";

      roundRect(
        ctx,
        120,
        startY - 25,
        1160,
        80,
        20,
        true
      );

      // Rank Color
      ctx.font = "bold 40px Sans";

      if (i === 0)
        ctx.fillStyle = "#FFD700";
      else if (i === 1)
        ctx.fillStyle = "#C0C0C0";
      else if (i === 2)
        ctx.fillStyle = "#CD7F32";
      else
        ctx.fillStyle = "#ffffff";

      ctx.fillText(
        `#${i + 1}`,
        150,
        startY + 25
      );

      // Avatar
      drawCircleImage(
        ctx,
        avatar,
        250,
        startY - 10,
        35
      );

      // Avatar Border
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 5;

      ctx.beginPath();

      ctx.arc(
        285,
        startY + 25,
        38,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      // Name
      ctx.font = "bold 32px Sans";
      ctx.fillStyle = "#ffffff";

      let name =
        user.name ||
        "Unknown User";

      if (name.length > 18) {
        name =
          name.slice(0, 18) + "...";
      }

      ctx.fillText(
        name,
        360,
        startY + 18
      );

      // Money with suffix
      ctx.font = "bold 34px Sans";
      ctx.fillStyle = "#00ff66";

      ctx.fillText(
        formatMoney(user.money),
        980,
        startY + 20
      );

      startY += 90;
    }

    // =========================
    // FOOTER
    // =========================

    ctx.font = "28px Sans";
    ctx.fillStyle = "#888888";

    ctx.fillText(
      "Powered by B.michel Economy System",
      700,
      canvasHeight - 30
    );

    // =========================
    // SAVE IMAGE
    // =========================

    const cachePath = path.join(
      __dirname,
      "cache"
    );

    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, {
        recursive: true
      });
    }

    const imagePath = path.join(
      cachePath,
      "richest.png"
    );

    fs.writeFileSync(
      imagePath,
      canvas.toBuffer()
    );

    // =========================
    // SEND
    // =========================

    api.sendMessage(
      {
        body:
`🏆 TOP ${limit} RICHEST PLAYERS

💰 Economy ranking updated live.`,
        attachment:
          fs.createReadStream(imagePath)
      },
      threadID,
      () => fs.unlinkSync(imagePath)
    );

    // =========================
    // FUNCTIONS
    // =========================

    function formatMoney(num) {

      if (num >= 1e15)
        return (num / 1e15).toFixed(2) + "Q";

      if (num >= 1e12)
        return (num / 1e12).toFixed(2) + "T";

      if (num >= 1e9)
        return (num / 1e9).toFixed(2) + "B";

      if (num >= 1e6)
        return (num / 1e6).toFixed(2) + "M";

      if (num >= 1e3)
        return (num / 1e3).toFixed(2) + "K";

      return num.toString();
    }

    function roundRect(
      ctx,
      x,
      y,
      width,
      height,
      radius,
      fill
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x + radius,
        y
      );

      ctx.lineTo(
        x + width - radius,
        y
      );

      ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
      );

      ctx.lineTo(
        x + width,
        y + height - radius
      );

      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );

      ctx.lineTo(
        x + radius,
        y + height
      );

      ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
      );

      ctx.lineTo(
        x,
        y + radius
      );

      ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
      );

      if (fill)
        ctx.fill();
    }

    function drawCircleImage(
      ctx,
      image,
      x,
      y,
      size
    ) {

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
