const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "sage",
		aliases: ["sg"],
		version: "2.0",
		author: "NZR",
		countDown: 5,
		role: 0,
		description: "Extract command file",
		category: "owner",
		guide: "{pn} <file name>"
	},

	onStart: async function ({ api, event, args }) {

		const permission = ["61578782186857"];

		if (!permission.includes(event.senderID)) {
			return api.sendMessage(
				"❌ | You don't have permission to use this command.",
				event.threadID,
				event.messageID
			);
		}

		const fileName = args[0];

		if (!fileName) {
			return api.sendMessage(
				"⚠️ | Please enter a file name.",
				event.threadID,
				event.messageID
			);
		}

		// Protection
		if (fileName.includes("..") || fileName.includes("/")) {
			return api.sendMessage(
				"❌ | Invalid file name.",
				event.threadID,
				event.messageID
			);
		}

		// dossier commands
		const filePath = path.join(__dirname, `${fileName}.js`);

		if (!fs.existsSync(filePath)) {
			return api.sendMessage(
				`❌ | File not found:\n${fileName}.js`,
				event.threadID,
				event.messageID
			);
		}

		// envoyer fichier directement
		return api.sendMessage(
			{
				body: `📂 | ${fileName}.js`,
				attachment: fs.createReadStream(filePath)
			},
			event.threadID,
			event.messageID
		);
	}
};
