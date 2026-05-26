.cmd install balance.js const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
	config: {
		name: "balance",
		aliases: ["bal"],
		version: "2.0",
		author: "NTKhang + Christ",
		countDown: 5,
		role: 0,
		description: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person"
		},
		category: "game",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person"
		}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "You have %1$",
			moneyOf: "%1 has %2$"
		}
	},

	onStart: async function ({ message, usersData, event, api }) {
		try {
			const uid = Object.keys(event.mentions).length > 0
				? Object.keys(event.mentions)[0]
				: event.senderID;

			const userData = await usersData.get(uid);
			const money = userData.money || 0;

			const userName = Object.keys(event.mentions).length > 0
				? event.mentions[uid].replace("@", "")
				: userData.name || "User";

			// ====== CREATE CANVAS ======
			const canvas = createCanvas(1200, 700);
			const ctx = canvas.getContext("2d");

			// ====== BACKGROUND ======
			const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
			gradient.addColorStop(0, "#ff1b1b");
			gradient.addColorStop(1, "#121212");

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, 1200, 700);

			// ====== MAIN CARD ======
			ctx.save();

			ctx.beginPath();
			ctx.moveTo(80, 80);
			ctx.lineTo(1120, 80);
			ctx.quadraticCurveTo(1160, 80, 1160, 120);
			ctx.lineTo(1160, 580);
			ctx.quadraticCurveTo(1160, 620, 1120, 620);
			ctx.lineTo(80, 620);
			ctx.quadraticCurveTo(40, 620, 40, 580);
			ctx.lineTo(40, 120);
			ctx.quadraticCurveTo(40, 80, 80, 80);
			ctx.closePath();

			ctx.fillStyle = "rgba(255,255,255,0.08)";
			ctx.fill();

			// Blur overlay
			ctx.fillStyle = "rgba(0,0,0,0.30)";
			ctx.fill();

			ctx.restore();

			// ====== LIGHT EFFECT ======
			const glow = ctx.createRadialGradient(250, 200, 50, 250, 200, 400);
			glow.addColorStop(0, "rgba(255,0,0,0.6)");
			glow.addColorStop(1, "rgba(255,0,0,0)");

			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, 1200, 700);

			// ====== PROFILE ======
			const avatarURL = await usersData.getAvatarUrl(uid);

			const avatarPath = path.join(__dirname, "cache", `${uid}.png`);

			const response = await axios({
				url: avatarURL,
				method: "GET",
				responseType: "arraybuffer"
			});

			fs.writeFileSync(avatarPath, Buffer.from(response.data, "utf-8"));

			const avatar = await loadImage(avatarPath);

			// Avatar circle
			ctx.save();

			ctx.beginPath();
			ctx.arc(250, 360, 150, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(avatar, 100, 210, 300, 300);

			ctx.restore();

			// Avatar border
			ctx.beginPath();
			ctx.arc(250, 360, 155, 0, Math.PI * 2);
			ctx.strokeStyle = "#ff2d2d";
			ctx.lineWidth = 10;
			ctx.stroke();

			// ====== QR STYLE ======
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(70, 100, 70, 70);

			ctx.fillRect(1040, 100, 70, 70);

			// ====== ICONS ======
			ctx.font = "40px Arial";
			ctx.fillStyle = "#ffffff";
			ctx.fillText("◉", 690, 150);
			ctx.fillText("▽", 760, 150);

			// ====== TEXT ======
			ctx.fillStyle = "#ffffff";

			ctx.font = "bold 75px Sans";
			ctx.fillText("KENZO BANK", 470, 260);

			ctx.font = "45px Sans";
			ctx.fillStyle = "#e2e2e2";
			ctx.fillText(userName, 470, 340);

			ctx.font = "38px Sans";
			ctx.fillStyle = "#cccccc";
			ctx.fillText("Premium User", 470, 400);

			// ====== MONEY BOX ======
			ctx.save();

			const moneyGradient = ctx.createLinearGradient(0, 0, 500, 0);
			moneyGradient.addColorStop(0, "#ff0000");
			moneyGradient.addColorStop(1, "#ff4d4d");

			ctx.fillStyle = moneyGradient;

			ctx.beginPath();
			ctx.roundRect(470, 470, 500, 90, 50);
			ctx.fill();

			ctx.restore();

			ctx.font = "bold 45px Sans";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(`$ ${Number(money).toLocaleString()}`, 520, 530);

			// ====== YOUTUBE BUTTON ======
			ctx.save();

			ctx.fillStyle = "#ffffff";
			ctx.beginPath();
			ctx.roundRect(990, 485, 120, 60, 30);
			ctx.fill();

			ctx.fillStyle = "#ff0000";
			ctx.font = "bold 28px Sans";
			ctx.fillText("BAL", 1025, 525);

			ctx.restore();

			// ====== BARCODE ======
			for (let i = 0; i < 35; i++) {
				ctx.fillStyle = "#ffffff";

				const x = 880 + i * 6;
				const h = Math.floor(Math.random() * 40) + 20;

				ctx.fillRect(x, 585, 3, h);
			}

			// ====== SAVE IMAGE ======
			const imgPath = path.join(__dirname, "cache", `balance_${uid}.png`);

			const buffer = canvas.toBuffer("image/png");
			fs.writeFileSync(imgPath, buffer);

			// ====== SEND ======
			await message.reply({
				body: `💰 | ${userName} balance card`,
				};
