// ULTRA HELP MENU V8 — LAST GENERATION

const { commands, aliases } = global.GoatBot;
const axios = require("axios");

function font(text = "") {
  const map = {
    A:"𝖠",B:"𝖡",C:"𝖢",D:"𝖣",E:"𝖤",F:"𝖥",G:"𝖦",H:"𝖧",I:"𝖨",J:"𝖩",
    K:"𝖪",L:"𝖫",M:"𝖬",N:"𝖭",O:"𝖮",P:"𝖯",Q:"𝖰",R:"𝖱",S:"𝖲",T:"𝖳",
    U:"𝖴",V:"𝖵",W:"𝖶",X:"𝖷",Y:"𝖸",Z:"𝖹",
    a:"𝖺",b:"𝖻",c:"𝖼",d:"𝖽",e:"𝖾",f:"𝖿",g:"𝗀",h:"𝗁",i:"𝗂",j:"𝗃",
    k:"𝗄",l:"𝗅",m:"𝗆",n:"𝗇",o:"𝗈",p:"𝗉",q:"𝗊",r:"𝗋",s:"𝗌",t:"𝗍",
    u:"𝗎",v:"𝗏",w:"𝗐",x:"𝗑",y:"𝗒",z:"𝗓",
    " ":" "
  };
  return text.split("").map(c => map[c] || c).join("");
}

function randomEmoji() {
  const emojis = ["⚡","🌌","🔥","💫","👑","🚀","🎭","🧠","💎","☄️"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

module.exports = {
  config: {
    name: "help",
    version: "8.0",
    author: "B.Michel",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Ultimate futuristic help menu"
    },
    longDescription: {
      en: "Modern AI styled help system"
    },
    category: "info",
    guide: {
      en: "{pn} | {pn} command"
    }
  },

  onStart: async function ({
    message,
    args,
    event,
    usersData,
    threadsData
  }) {

    const { commands } = global.GoatBot;

    const threadData = await threadsData.get(event.threadID);

    const prefix =
      threadData.data.prefix ||
      global.GoatBot.config.prefix;

    const uid = event.senderID;

    let avatar;

    try {
      const avatarUrl =
        await usersData.getAvatarUrl(uid);

      avatar =
        await global.utils.getStreamFromURL(avatarUrl);

    } catch {

      avatar =
        await global.utils.getStreamFromURL(
          `https://graph.facebook.com/${uid}/picture?width=720&height=720`
        );
    }

    // SINGLE COMMAND INFO
    if (args[0]) {

      const cmdName = args[0].toLowerCase();

      const command =
        commands.get(cmdName) ||
        commands.get(aliases.get(cmdName));

      if (!command) {
        return message.reply({
          body: `
╔════════════════╗
❌ 𝖢𝗈𝗆𝗆𝖺𝗇𝖽 𝖭𝗈𝗍 𝖥𝗈𝗎𝗇𝖽
╚════════════════╝

La commande "${cmdName}" n'existe pas.
`,
          attachment: avatar
        });
      }

      const cfg = command.config;

      return message.reply({
        body: `
╔════════════════════╗
      🌌 𝖢𝖮𝖬𝖬𝖠𝖭𝖣 𝖨𝖭𝖥𝖮 🌌
╚════════════════════╝

${randomEmoji()} 𝖭𝖺𝗆𝖾 : ${font(cfg.name)}

👑 𝖠𝗎𝗍𝗁𝗈𝗋 : ${cfg.author}

📂 𝖢𝖺𝗍𝖾𝗀𝗈𝗋𝗒 : ${font(cfg.category)}

⏱ 𝖢𝗈𝗈𝗅𝖽𝗈𝗐𝗇 : ${cfg.countDown}s

🔐 𝖯𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 :
${cfg.role == 0 ? "👤 Users" :
cfg.role == 1 ? "👥 Group Admins" :
"👑 Bot Owner"}

📖 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 :
${cfg.longDescription?.en ||
cfg.shortDescription?.en ||
"No description"}

💡 𝖦𝗎𝗂𝖽𝖾 :
${cfg.guide?.en || "No guide"}

━━━━━━━━━━━━━━━━━━
🌟 𝖴𝗅𝗍𝗋𝖺 𝖠𝖨 𝖧𝖾𝗅𝗉 𝖲𝗒𝗌𝗍𝖾𝗆
`,
        attachment: avatar
      });
    }

    // ALL COMMANDS
    const categories = {};

    for (const [name, cmd] of commands) {

      const category =
        cmd.config.category || "others";

      if (!categories[category])
        categories[category] = [];

      categories[category].push(name);
    }

    let uptime =
      process.uptime();

    let hours =
      Math.floor(uptime / 3600);

    let minutes =
      Math.floor((uptime % 3600) / 60);

    let seconds =
      Math.floor(uptime % 60);

    let msg = `
╔════════════════════════╗
     🌌 𝖴𝖫𝖳𝖨𝖬𝖠𝖳𝖤 𝖧𝖤𝖫𝖯 🌌
╚════════════════════════╝

👋 ${font("Welcome To GoatBot")}

🤖 𝖡𝗈𝗍 𝖭𝖺𝗆𝖾 : GoatBot V8
👑 𝖮𝗐𝗇𝖾𝗋 : Tua Michel
⚡ 𝖯𝗋𝖾𝖿𝗂𝗑 : [ ${prefix} ]

📦 𝖳𝗈𝗍𝖺𝗅 𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝗌 : ${commands.size}

🕒 𝖴𝗉𝗍𝗂𝗆𝖾 :
${hours}h ${minutes}m ${seconds}s

━━━━━━━━━━━━━━━━━━
`;

    for (const category in categories) {

      msg += `
╭━━━〔 ${font(category.toUpperCase())} 〕━━⬣
${categories[category]
.sort()
.map(cmd =>
`┃ ${randomEmoji()} ${font(cmd)}`
)
.join("\n")}
╰━━━━━━━━━━━━━━━━━━⬣
`;
    }

    msg += `
...
