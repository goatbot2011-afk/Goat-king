const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
	config: {
		name: "setwelcome",
		aliases: ["setwc"],
		version: "2.0",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: "Edit welcome message and attachments",
		category: "custom",
		guide: {
			en: "{pn} text | file | on | off"
		}
	},

	langs: {
		en: {
			turnedOn: "Turned on welcome message",
			turnedOff: "Turned off welcome message",
			missingContent: "Please enter welcome message content",
			edited: "Updated welcome message: %1",
			reseted: "Reset welcome message",
			noFile: "No attachments found",
			resetedFile: "Deleted welcome attachments",
			missingFile: "Reply with an image/video/audio",
			addedFile: "Added %1 attachment(s)"
		}
	},

	onStart: async function ({ args, threadsData, message, event, getLang }) {
		const { threadID, senderID } = event;
		const { data, settings } = await threadsData.get(threadID);

		const type = args[0]?.toLowerCase();

		switch (type) {

			// TEXT
			case "text": {
				const content = args.slice(1).join(" ").trim();
				if (!content) return message.reply(getLang("missingContent"));

				if (content.toLowerCase() === "reset") {
					delete data.welcomeMessage;
					await threadsData.set(threadID, { data });
					return message.reply(getLang("reseted"));
				}

				data.welcomeMessage = content;
				await threadsData.set(threadID, { data });

				return message.reply(getLang("edited", content));
			}

			// FILE
			case "file": {
				if (args[1]?.toLowerCase() === "reset") {
					if (!data.welcomeAttachment?.length)
						return message.reply(getLang("noFile"));

					try {
						await Promise.allSettled(
							data.welcomeAttachment.map(id => drive.deleteFile(id))
						);
					} catch (e) {}

					delete data.welcomeAttachment;
					await threadsData.set(threadID, { data });

					return message.reply(getLang("resetedFile"));
				}

				await saveChanges(message, event, threadID, senderID, threadsData, getLang);
				break;
			}

			// ON / OFF
			case "on":
			case "off": {
				settings.sendWelcomeMessage = type === "on";
				await threadsData.set(threadID, { settings });

				return message.reply(
					settings.sendWelcomeMessage
						? getLang("turnedOn")
						: getLang("turnedOff")
				);
			}

			default:
				return message.SyntaxError();
		}
	},

	onReply: async function ({ event, Reply, message, threadsData, getLang }) {
		if (event.senderID !== Reply.author) return;
		await saveChanges(message, event, event.threadID, event.senderID, threadsData, getLang);
	}
};


// ================= SAVE FUNCTION =================
async function saveChanges(message, event, threadID, senderID, threadsData, getLang) {
	const { data } = await threadsData.get(threadID);

	const attachments = [
		...(event.attachments || []),
		...(event.messageReply?.attachments || [])
	].filter(a =>
		["photo", "video", "audio", "animated_image"].includes(a.type)
	);

	if (!attachments.length)
		return message.reply(getLang("missingFile"));

	if (!data.welcomeAttachment) data.welcomeAttachment = [];

	for (const attachment of attachments) {
		try {
			const ext = getExtFromUrl(attachment.url) || "jpg";
			const fileName = `${getTime()}_${senderID}.${ext}`;

			const uploaded = await drive.uploadFile(
				`setwelcome_${threadID}_${fileName}`,
				await getStreamFromURL(attachment.url)
			);

			// Sauvegarde ID fichier drive
			if (uploaded?.id) {
				data.welcomeAttachment.push(uploaded.id);
			}
		} catch (err) {
			console.error("Upload error:", err);
		}
	}

	await threadsData.set(threadID, { data });

	return message.reply(getLang("addedFile", attachments.length));
}
