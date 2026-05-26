const axios = require("axios");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "ffinfo",
    version: "1.0.0",
    author: "ArYAN",
    role: 0,
    countDown: 10,
    shortDescription: {
      en: "Get detailed Free Fire player info by UID",
    },
    longDescription: {
      en: "Fetch full Free Fire player stats using UID from Aryan's API",
    },
    category: "game",
    guide: {
      en: "{pn} <UID>",
    },
  },

  onStart: async function ({ api, event, args }) {
    let e;
    try {
      const apiConfig = await axios.get(nix);
      e = apiConfig.data && apiConfig.data.api;
      if (!e) {
        return api.sendMessage("❌ Configuration Error: GitHub apis.json is missing the 'api' field.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("API Config Fetch Error:", error);
      return api.sendMessage("❌ Failed to fetch API configuration from GitHub.", event.threadID, event.messageID);
    }

    try {
      if (!args[0]) {
        return api.sendMessage(
          "❗ Please provide a Free Fire UID",
          event.threadID,
          event.messageID
        );
      }

      const uid = args[0].trim();
      const url = `${e}/api/ffinfo?uid=${uid}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.basicInfo) {
        return api.sendMessage(
          `❌ No data found for UID: ${uid}`,
          event.threadID,
          event.messageID
        );
      }

      const b = data.basicInfo;
      const s = data.socialInfo || {};
      const p = data.petInfo || {};
      const d = data.diamondCostRes || {};
      const c = data.creditScoreInfo || {};
      const lastLogin = new Date(parseInt(b.lastLoginAt) * 1000).toLocaleString();
      const createAt = new Date(parseInt(b.createAt) * 1000).toLocaleString();

      let clothes = Array.isArray(data.profileInfo?.clothes) ? data.profileInfo.clothes.join(", ") : "N/A";
      let skills = Array.isArray(data.profileInfo?.equipedSkills) ? data.profileInfo.equipedSkills.join(", ") : "N/A";

      const message = 
`🎮 𝗙𝗿𝗲𝗲 𝗙𝗶𝗿𝗲 𝗣𝗹𝗮𝘆𝗲𝗿 𝗜𝗻𝗳𝗼 — UID: ${uid}

👤 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${b.nickname}
🌍 𝗥𝗲𝗴𝗶𝗼𝗻: ${b.region}
⭐ 𝗟𝗲𝘃𝗲𝗹: ${b.level} (Exp: ${b.exp.toLocaleString()})
🏆 𝗥𝗮𝗻𝗸: ${b.rank} (Points: ${b.rankingPoints})
❤️ 𝗟𝗶𝗸𝗲𝗱: ${b.liked}
⏰ 𝗟𝗮𝘀𝘁 𝗟𝗼𝗴𝗶𝗻: ${lastLogin}
📅 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗖𝗿𝗲𝗮𝘁𝗲𝗱: ${createAt}

👕 𝗖𝗹𝗼𝘁𝗵𝗲𝘀: ${clothes}
💥 𝗘𝗾𝘂𝗶𝗽𝗽𝗲𝗱 𝗦𝗸𝗶𝗹𝗹𝘀: ${skills}

🐾 𝗣𝗲𝘁: ${p.id ? `ID ${p.id}, Level ${p.level}, Skin ${p.skinId}` : "No pet info"}

💎 𝗗𝗶𝗮𝗺𝗼𝗻𝗱 𝗖𝗼𝘀𝘁: ${d.diamondCost || "N/A"}

📊 𝗖𝗿𝗲𝗱𝗶𝘁 𝗦𝗰𝗼𝗿𝗲: ${c.creditScore || "N/A"}

📝 𝗦𝗶𝗴𝗻𝗮𝘁𝘂𝗿𝗲: ${s.signature || "None"}
🗣️ 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲: ${s.language || "Unknown"}
`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (e) {
      return api.sendMessage(`⚠️ Error: ${e.message}`, event.threadID, event.messageID);
    }
  },
};
