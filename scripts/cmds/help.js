// ULTRA HELP MENU V9 — NEXT GEN PREMIUM

const { commands, aliases } = global.GoatBot;

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

function emoji() {
  const e = ["⚡","🌌","🔥","💎","🚀","👑","☄️","🧠"];
  return e[Math.floor(Math.random() * e.length)];
}

module.exports = {
  config: {
    name: "help",
    version: "9.0",
    author: "Tua Michel",
    countDown: 2,
    role: 0,
    category: "info"
  },

  onStart: async function ({ message, args, event }) {

    // SINGLE CMD INFO
    if (args[0]) {
      const name = args[0].toLowerCase();

      const cmd =
        commands.get(name) ||
        commands.get(aliases.get(name));

      if (!cmd) {
        return message.reply(
`❌ Command not found: ${name}`
        );
      }

      const c = cmd.config;

      return message.reply(
`╔════════════════════╗
      🌌 COMMAND INFO 🌌
╚════════════════════╝

${emoji()} Name: ${font(c.name)}
👑 Author: ${c.author}
📂 Category: ${font(c.category || "unknown")}
⏱ Cooldown: ${c.countDown || 0}s
🔐 Role: ${c.role}

📖 Description:
${c.longDescription?.en || c.shortDescription?.en || "No description"}

💡 Guide:
${c.guide?.en || "No guide"}

━━━━━━━━━━━━━━━━━━`
      );
    }

    // GROUP COMMANDS
    const cats = {};

    for (const [n, c] of commands) {
      const cat = c.config.category || "others";
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(n);
    }

    let msg =
`╔════════════════════╗
   🌌 HELP SYSTEM 🌌
╚════════════════════╝

⚡ Bot: KENZO VORTEX 
👑 Owner: Tua Michel
📦 Total Commands: ${commands.size}
━━━━━━━━━━━━━━━━━━
`;

    for (const cat in cats) {
      msg += `
╭──〔 ${font(cat.toUpperCase())} 〕──╮
${cats[cat].map(c => `┃ ${emoji()} ${font(c)}`).join("\n")}
╰────────────────────╯`;
    }

    msg += `
━━━━━━━━━━━━━━━━━━
💡 Use: help <command>
🚀 System: NEXT-GEN UI
`;

    return message.reply(msg);
  }
};
