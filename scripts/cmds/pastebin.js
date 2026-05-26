const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["bin"],
    version: "1.0",
    author: "ArYAN",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Upload files and get cmds short links"
    },
    longDescription: {
      en: "This command allows you to upload files to goatbin and sends the link to the file."
    },
    category: "GoatStor",
    guide: {
      en: "To use this command, type goatbin <filename>. The file must be located in the 'cmds' folder."
    }
  },

  onStart: async function({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        '[⚜️]➜ Please provide the filename to upload. Usage: {p}pastebin <filename>',
        event.threadID,
        event.messageID
      );
    }

    const fileName = args[0];
    const cmdsDir = path.join(__dirname, '..', 'cmds');
    const filePathWithoutExt = path.join(cmdsDir, fileName);
    const filePathWithExt = path.join(cmdsDir, fileName + '.js');

    let filePath;
    if (fs.existsSync(filePathWithoutExt)) {
      filePath = filePathWithoutExt;
    } else if (fs.existsSync(filePathWithExt)) {
      filePath = filePathWithExt;
    } else {
      return api.sendMessage('[⚜️]➜ Invalid command/file not found.', event.threadID, event.messageID);
    }

    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        return api.sendMessage('[⚜️]➜ An error occurred while reading the file.', event.threadID, event.messageID);
      }

      try {
        const response = await axios.post('https://nixbin.onrender.com/v1/paste', { code: data });

        if (response.data && response.data.link) {
          api.sendMessage(response.data.link, event.threadID, event.messageID);
        } else {
          api.sendMessage('[⚜️]➜ Failed to upload the command. Please try again later.', event.threadID, event.messageID);
        }
      } catch (uploadErr) {
        console.error(uploadErr);
        api.sendMessage('[⚜️]➜ An error occurred while uploading the command.', event.threadID, event.messageID);
      }
    });
  },
};
