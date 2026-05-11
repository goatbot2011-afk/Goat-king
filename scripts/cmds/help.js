const { commands, aliases } = global.GoatBot;
const axios = require("axios");

const font = t =>
  t.replace(/[A-Za-z]/g, a =>
    String.fromCodePoint(
      a <= "Z"
        ? a.charCodeAt(0) + 0x1d5a0 - 65
        : a.charCodeAt(0) + 0x1d5ba - 97
    )
  );

module.exports = {
  config: {
    name: "help",
    version: "7.0",
    author: "Christus Premium",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Ultimate help menu"
    },
    category: "info",
    guide: {
      en: ".help / .help <cmd> / .help -ai <cmd> <question>"
    }
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;

      let avatar;
      try {
        avatar = await global.utils.getStreamFromURL(
          await usersData.getAvatarUrl(uid)
        );
      } catch {
        avatar = await global.utils.getStreamFromURL(
          `https://graph.facebook.com/${uid}/picture?width=512&height=512`
        );
      }

      // ===== AI HELP =====
      if (args[0] === "-ai") {
        const cmdName = args[1]?.toLowerCase();
        const question = args.slice(2).join(" ");

        if (!cmdName)
          return message.reply("❌ Usage: .help -ai <command> <question>");

        const cmd =
          commands.get(cmdName) ||
          commands.get(aliases.get(cmdName));

        if (!cmd) return message.reply("❌ Command not found.");

        const info = cmd.config;

        const prompt = `
Explain this GoatBot command simply.

Name: ${info.name}
Description: ${info.shortDescription?.en}
Category: ${info.category}
Guide: ${info.guide?.en}

Question:
${question || "How does it work?"}
`;

        const api = `https://christus-api.vercel.app/ai/gemini-proxy2?prompt=${encodeURIComponent(prompt)}`;

        const { data } = await axios.get(api);

        return message.reply({
          body:
`🤖 𝗔𝗜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗔𝗦𝗦𝗜𝗦𝗧𝗔𝗡𝗧

📌 Command: ${font(info.name)}

❓ Question:
${question || "How does it work?"}

💡 Answer:
${data.result || "No answer."}`,
          attachment: avatar
        });
      }

      // ===== MENU =====
      if (!args[0]) {
        let msg = `╔══════════════════╗
   🌟 𝗚𝗢𝗔𝗧𝗕𝗢𝗧 𝗛𝗘𝗟𝗣
╚══════════════════╝

`;

        const
