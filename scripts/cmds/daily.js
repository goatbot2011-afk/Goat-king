 const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
	version: "2.1",
	author: "NTKhang + Christ",
		countDown: 5,
	role: 0,
		description: {
			vi: "Nhận quà hàng ngày",
			en: "Recevoir la récompense journalière"
	},
		category: "jeu",
	guide: {
			en: " {pn}\n {pn} info: Voir les infos des récompenses journalières"
	},
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
	}
	},

	langs: {
	en: {
			monday: "Lundi",
			tuesday: "Mardi",
			wednesday: "Mercredi",
			thursday: "Jeudi",
			friday: "Vendredi",
			saturday: "Samedi",
			sunday: "Dimanche",
			alreadyReceived: "Tu as déjà récupéré ta récompense aujourd'hui",
			received: "Tu as reçu %1 coins et %2 exp"
	}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;
		const { senderID, threadID } = event;
		const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay();
		const dayName = currentDay == 0? getLang("sunday") :
			currentDay == 6? getLang("saturday") :
			currentDay == 5? getLang("friday") :
			currentDay == 4? getLang("thursday") :
			currentDay == 3? getLang("wednesday") :
			currentDay == 2? getLang("tuesday") :
			getLang("monday");

		if (args[0] == "info") {
			let msg = "📅 Récompenses journalières :\n\n";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0? 7 : i) - 1));
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0? 7 : i) - 1));
				const day = i == 7? getLang("sunday") :
					i == 6? getLang("saturday") :
					i == 5? getLang("friday") :
					i == 4? getLang("thursday") :
					i == 3? getLang("wednesday") :
					i == 2? getLang("tuesday") :
					getLang("monday");
				msg += `${day}: ${getCoin} coins, ${getExp} exp\n`;
			}
			return message.reply(msg);
	}

		const userData = await usersData.get(senderID);
		
		if (userData.data.lastTimeGetReward === dateTime) {
			return await sendAlreadyReceivedCanvas(message, senderID, usersData, dateTime);
	}

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0? 7 : currentDay) - 1));
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0? 7 : currentDay) - 1));
		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
	});

		await sendRewardCanvas(message, senderID, usersData, getCoin, getExp, dayName, dateTime);
	}
};

// Canvas Récompense reçue
async function sendRewardCanvas(message, senderID, usersData, coin, exp, day, date) {
	const canvas = createCanvas(1200, 650);
	const ctx = canvas.getContext("2d");

	drawBaseCanvas(ctx, canvas, "REWARD CLAIMED", "#00f0ff");

	const userAvatar = await usersData.getAvatarUrl(senderID);
	const avatar = await loadImage(userAvatar);
	drawAvatar(ctx, avatar);

	const username = await usersData.getName(senderID);
	drawRightPanel(ctx, username, day, `${coin} coins • ${exp} exp`, date);

	const imagePath = await saveCanvas(canvas, `daily_${senderID}`);
	return message.reply({
		body: `✨ Récompense récupérée!\n💰 ${coin} coins\n⚡ ${exp} exp`,
	attachment: fs.createReadStream(imagePath)
	}, () => fs.unlinkSync(imagePath));
}

// Canvas Déjà récupéré
async function sendAlreadyReceivedCanvas(message, senderID, usersData, date) {
	const canvas = createCanvas(1200, 650);
	const ctx = canvas.getContext("2d");

	drawBaseCanvas(ctx, canvas, "ALREADY CLAIMED", "#ff3b3b");

	const userAvatar = await usersData.getAvatarUrl(senderID);
	const avatar = await loadImage(userAvatar);
	drawAvatar(ctx, avatar);

	const username = await usersData.getName(senderID);
	drawRightPanel(ctx, username, "Aujourd'hui", "Déjà récupéré", date);

	const imagePath = await saveCanvas(canvas, `daily_already_${senderID}`);
	return message.reply({
		body: `❌ Tu as déjà récupéré ta récompense aujourd'hui`,
	attachment: fs.createReadStream(imagePath)
	}, () => fs.unlinkSync(imagePath));
}

// Base du canvas style Kenzo
function drawBaseCanvas(ctx, canvas, title, color) {
	ctx.fillStyle = "#050505";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.shadowColor = color;
	ctx.shadowBlur = 40;

	ctx.fillStyle = "#101010";
	roundRect(ctx, 40, 40, 1120, 570, 40, true);

	ctx.shadowBlur = 0;

	ctx.fillStyle = "#0d0d0d";
	roundRect(ctx, 70, 70, 430, 510, 30, true);

	ctx.strokeStyle = color;
	ctx.lineWidth = 8;
	ctx.beginPath();
	ctx.arc(285, 280, 155, 0, Math.PI * 2);
	ctx.stroke();

	ctx.fillStyle = color;
	ctx.font = "bold 45px Sans";
	ctx.textAlign = "center";
	ctx.fillText(title, 285, 520);

	ctx.fillStyle = color;
	ctx.fillRect(560, 80, 14, 460);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 55px Sans";
	ctx.textAlign = "left";
	ctx.fillText("Kenzo vortex", 700, 140);

	ctx.fillStyle = "#8f8f8f";
	ctx.font = "32px Sans";
	ctx.fillText("Daily Gift System", 700, 185);
}

// Dessin avatar
function drawAvatar(ctx, avatar) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(285, 280, 150, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(avatar, 135, 130, 300, 300);
	ctx.restore();
}

// Panel droit
function drawRightPanel(ctx, username, day, reward, date) {
	ctx.fillStyle = "#00f0ff";
	ctx.font = "bold 38px Sans";
	ctx.fillText("UTILISATEUR", 640, 280);

	ctx.fillStyle = "#ffffff";
	ctx.font = "35px Sans";
	ctx.fillText(username, 640, 330);

	ctx.fillStyle = "#00f0ff";
	ctx.font = "bold 38px Sans";
	ctx.fillText("JOUR", 640, 410);

	ctx.fillStyle = "#ffffff";
	ctx.font = "35px Sans";
	ctx.fillText(day, 640, 460);

	ctx.fillStyle = "#00f0ff";
	ctx.font = "bold 38px Sans";
	ctx.fillText("RÉCOMPENSE", 640, 540);

	ctx.fillStyle = "#ffffff";
	ctx.font = "35px Sans";
	ctx.fillText(reward, 640, 590);

	ctx.fillStyle = "#6e6e6e";
	ctx.font = "28px Sans";
	ctx.fillText(date, 700, 80);
}

// Sauvegarde
async function saveCanvas(canvas, name) {
	const imagePath = path.join(__dirname, "cache", `${name}.png`);
	fs.ensureDirSync(path.join(__dirname, "cache"));
	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync(imagePath, buffer);
	return imagePath;
}

// Rounded Rect
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof radius === "undefined") radius = 5;
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
	ctx.closePath();
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
			   }
