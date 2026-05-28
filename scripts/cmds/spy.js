const axios = require("axios");

const baseApiUrl = "https://www.noobs-api.rf.gd/dipto";

module.exports = {
  config: {
    name: "spy",
    aliases: ["hackerspy"],
    version: "1.2",
    role: 0,
    author: "Christus",
    description: "Obtenir les informations et la photo de profil d'un utilisateur",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uid1 = event.senderID;
      const uid2 =
        event.mentions && Object.keys(event.mentions).length
          ? Object.keys(event.mentions)[0]
          : null;

      let uid;
      if (args && args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid =
          event.type === "message_reply"
            ? event.messageReply?.senderID
            : uid2 || uid1;
      }

      let babyTeach = 0;
      try {
        const response = await axios.get(`${baseApiUrl}/baby?list=all`);
        const dataa = response?.data || {};
        babyTeach =
          dataa?.teacher?.teacherList?.find((t) => t?.[uid])?.[uid] || 0;
      } catch (e) {
        babyTeach = 0;
      }

      const userInfo = (await api.getUserInfo(uid)) || {};
      const info = userInfo[uid] || {};

      let avatarUrl = null;
      try {
        avatarUrl = (await usersData.getAvatarUrl(uid)) || null;
      } catch (e) {
        avatarUrl = null;
      }
      if (!avatarUrl) avatarUrl = "https://i.imgur.com/TPHk4Qu.png";

      let genderText = "⚧️ Inconnu";
      switch (info.gender) {
        case 1:
          genderText = "👩 Femme";
          break;
        case 2:
          genderText = "👨 Homme";
          break;
      }

      const userRecord = (await usersData.get(uid)) || {};
      const money = Number(userRecord.money || 0);
      const exp = Number(userRecord.exp || 0);
      const allUser = (await usersData.getAll()) || [];

      const rank =
        allUser.length > 0
          ? allUser
              .slice()
              .sort((a, b) => (b.exp || 0) - (a.exp || 0))
              .findIndex((u) => String(u.userID) === String(uid)) + 1
          : 0;
      const moneyRank =
        allUser.length > 0
          ? allUser
              .slice()
              .sort((a, b) => (b.money || 0) - (a.money || 0))
              .findIndex((u) => String(u.userID) === String(uid)) + 1
          : 0;

      const accountType = info.type ? String(info.type).toUpperCase() : "Utilisateur";
      const isFriend = info.isFriend ? "✅ Oui" : "❌ Non";
      const isBirthday =
        typeof info.isBirthday !== "undefined" && info.isBirthday !== false
          ? info.isBirthday
          : "Privé";

      let threadInfo = {};
      try {
        if (event.isGroup && event.threadID) {
          threadInfo = (await api.getThreadInfo(event.threadID)) || {};
        }
      } catch (e) {
        threadInfo = {};
      }

      const now = new Date();
      const localeOpts = {
        timeZone: "Africa/Abidjan",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const reportDate = new Intl.DateTimeFormat("en-GB", localeOpts).format(now);

      const userInformation = [
        "𝐒𝐏𝐘",
        "━━━━━━━━━━━━",
        "",
        "👤 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐏𝐄𝐑𝐒𝐎𝐍𝐍𝐄𝐋𝐋𝐄",
        `📝 𝗡𝗼𝗺 𝗰𝗼𝗺𝗽𝗹𝗲𝘁: ${info?.name || userRecord?.name || "Inconnu"}`,
        `👤 𝗣𝗿𝗲𝗺𝗶𝗲𝗿 𝗻𝗼𝗺: ${extractFirstName(info?.name || userRecord?.name)}`,
        `👥 𝗡𝗼𝗺 𝗱𝗲 𝗳𝗮𝗺𝗶𝗹𝗹𝗲: ${extractLastName(info?.name || userRecord?.name)}`,
        `🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${uid}`,
        `⚧️ 𝗚𝗲𝗻𝗿𝗲: ${genderText}`,
        `🔗 𝗡𝗼𝗺 𝗱'𝘂𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗲𝘂𝗿: ${info?.vanity || "Non défini"}`,
        `🎂 𝗔𝗻𝗻𝗶𝘃𝗲𝗿𝘀𝗮𝗶𝗿𝗲: ${isBirthday}`,
        `🌐 𝗣𝗿𝗼𝗳𝗶𝗹 𝗨𝗥𝗟: ${info?.profileUrl || "Non disponible"}`,
        "",
        "📱 𝐒𝐓𝐀𝐓𝐔𝐓 𝐃𝐔 𝐂𝐎𝐌𝐏𝐓𝐄",
        `🏷️ 𝗧𝘆𝗽𝗲 𝗱𝘂 𝗰𝗼𝗺𝗽𝘁𝗲: ${accountType}`,
        `✅ 𝗩é𝗿𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻: ${info?.is_verified ? "✅ Vérifié" : "❌ Non vérifié"}`,
        `👥 𝗔𝗺𝗶𝘁𝗶𝗲́: ${isFriend}`,
        `🚫 𝗕𝗮𝗻𝗻𝗶: ${info?.is_suspended ? "✅ Oui" : "❌ Non"}`,
        "",
        "🤖 𝐁𝐀𝐒𝐄 𝐃𝐄 𝐃𝐎𝐍𝐍É𝐄𝐒 𝐃𝐔 𝐁𝐎𝐓",
        `📅 𝗣𝗿𝗲𝗺𝗶𝗲̀𝗿 𝗷𝗼𝗶𝗻: ${userRecord?.firstJoin || "Inconnu"}`,
        `🔄 𝗗𝗲𝗿𝗻𝗶𝗲̀𝗿𝗲 𝗺𝗶𝘀𝗲 𝗮 𝗷𝗼𝘂𝗿: ${userRecord?.lastUpdate || reportDate}`,
        `💰 𝗦𝗼𝗹𝗱𝗲: ${formatMoney(money)}`,
        `⭐ 𝗘𝘅𝗽𝗲́𝗿𝗶𝗲𝗻𝗰𝗲: ${exp || 0} XP`,
        `🎯 𝗡𝗶𝘃𝗲𝗮𝘂: ${userRecord?.level || "N/A"}`,
        `📈 𝗣𝗿𝗼𝗰𝗵𝗮𝗶𝗻 𝗻𝗶𝘃𝗲𝗮𝘂: ${userRecord?.nextLevelXP || "N/A"}`,
        "",
        "💬 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐃𝐄 𝐆𝐑𝐎𝐔𝐏𝐄",
        `🏷️ 𝗦𝘂𝗿𝗻𝗼𝗺: ${threadInfo?.nicknames?.[uid] || "Non défini"}`,
        `📅 𝗥𝗲𝗷𝗼𝗶𝗻𝘁 𝗹𝗲 𝗴𝗿𝗼𝘂𝗽𝗲: ${threadInfo?.participantIDs && threadInfo.participantIDs.includes(uid) ? "Oui" : "Inconnu"}`,
        `👑 𝗦𝘁𝗮𝘁𝘂𝘁 𝗮𝗱𝗺𝗶𝗻: ${threadInfo?.adminIDs && threadInfo.adminIDs.includes(uid) ? "✅ Admin" : "❌ Membre"}`,
        `💬 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝗲𝗻𝘃𝗼𝘆𝗲́𝘀: ${userRecord?.messages || 0}`,
        `📍 𝗡𝗼𝗺 𝗱𝘂 𝗴𝗿𝗼𝘂𝗽𝗲: ${threadInfo?.threadName || "Inconnu"}`,
        "",
        "📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐐𝐔𝐄𝐒 𝐃𝐔 𝗣𝗥𝗢𝗙𝗜𝗟",
        `🌟 𝗦𝗰𝗼𝗿𝗲 𝗱𝘂 𝗽𝗿𝗼𝗳𝗶𝗹: ${userRecord?.profileScore || "N/A"}`,
        `🏆 𝗥𝗮𝗻𝗴 𝗱'𝘂𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗲𝘂𝗿: ${rank > 0 ? `#${rank}` : "Non classé"}`,
        `📈 𝗖𝗹𝗮𝘀𝘀𝗲𝗺𝗲𝗻𝘁 𝗘𝗫𝗣: ${userRecord?.expRank || "N/A"}`,
        `💰 𝗖𝗹𝗮𝘀𝘀𝗲𝗺𝗲𝗻𝘁 𝗮𝗿𝗴𝗲𝗻𝘁: ${moneyRank > 0 ? `#${moneyRank}` : "Non classé"}`,
        `🕐 𝗥𝗮𝗽𝗽𝗼𝗿𝘁 𝗴𝗲́𝗻𝗲́𝗿𝗲́: ${reportDate}`,
      ].join("\n");

      await message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl),
      });
    } catch (err) {
      console.error("Erreur commande SPY:", err);
      return message.reply("❌ Une erreur est survenue lors de la récupération des informations.");
    }
  },
};

// --- helpers ---
function extractFirstName(full) {
  if (!full) return "Inconnu";
  const parts = String(full).trim().split(/\s+/);
  return parts[0] || "Inconnu";
}
function extractLastName(full) {
  if (!full) return "";
  const parts = String(full).trim().split(/\s+/);
  return parts.slice(1).join(" ") || "";
}
function formatMoney(num) {
  num = Number(num) || 0;
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }
  return (Math.round(num * 10) / 10).toString().replace(/\.0$/, "") + units[unit];
        }
