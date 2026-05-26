 const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "admin",
	version: "2.1",
	author: "NTKhang + Christ",
		countDown: 5,
	role: 2,
		description: {
			en: "Ajouter, retirer, gérer les admins du bot"
	},
		category: "groupe",
	guide: {
			en: ' {pn} [add | -a] <uid | @tag>: Ajouter un admin'
				+ '\n {pn} [remove | -r] <uid | @tag>: Retirer un admin'
				+ '\n {pn} [list | -l]: Voir la liste des admins'
	}
	},

	langs: {
	en: {
			added: "Ajouté le rôle admin à %1 utilisateur(s):\n%2",
			alreadyAdmin: "\n⚠️ %1 utilisateur(s) sont déjà admin:\n%2",
			missingIdAdd: "⚠️ Merci d'entrer l'ID ou de taguer l'utilisateur à passer admin",
			removed: "✅ Rôle admin retiré à %1 utilisateur(s):\n%2",
			notAdmin: "⚠️ %1 utilisateur(s) ne sont pas admin:\n%2",
			missingIdRemove: "⚠️ Merci d'entrer l'ID ou de taguer l'utilisateur à retirer des admins",
			listAdmin: "Liste des admins du bot"
	}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {
			case "add":
			case "-a": {
				if (!args[1]) return message.reply(getLang("missingIdAdd"));
				
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg =>!isNaN(arg));

				const notAdminIds = [];
				const adminIds = [];
				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);
				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				if (notAdminIds.length > 0) {
					const addedUsers = getNames.filter(u => notAdminIds.includes(u.uid));
					await sendAdminCanvas(message, addedUsers, usersData, "ADMIN AJOUTÉ", "#00f0ff", getLang("added", notAdminIds.length, ""));
				}
				
				if (adminIds.length > 0) {
					const alreadyUsers = getNames.filter(u => adminIds.includes(u.uid));
					await sendAdminCanvas(message, alreadyUsers, usersData, "DÉJÀ ADMIN", "#ff3b3b", getLang("alreadyAdmin", adminIds.length, ""));
				}
				break;
			}
			
			case "remove":
			case "-r": {
				if (!args[1]) return message.reply(getLang("missingIdRemove"));
				
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else
					uids = args.filter(arg =>!isNaN(arg));
					
				const notAdminIds = [];
				const adminIds = [];
				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}
				
				for (const uid of adminIds)
					config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					
				const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				if (adminIds.length > 0) {
					await sendAdminCanvas(message, getNames, usersData, "ADMIN RETIRÉ", "#ff9500", getLang("removed", adminIds.length, ""));
				}
				
				if (notAdminIds.length > 0) {
					const notAdminUsers = await Promise.all(notAdminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					await sendAdminCanvas(message, notAdminUsers, usersData, "PAS ADMIN", "#ff3b3b", getLang("notAdmin", notAdminIds.length, ""));
				}
				break;
			}
			
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				await sendAdminListCanvas(message, getNames, usersData);
				break;
			}
			default:
				return message.SyntaxError();
	}
	}
};

// Canvas liste des admins
async function sendAdminListCanvas(message, admins, usersData) {
	const height = 250 + (admins.length * 110);
	const canvas = createCanvas(1200, Math.min(height, 1200));
	const ctx = canvas.getContext("2d");

	// Fond
	ctx.fillStyle = "#050505";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.shadowColor = "#00f0ff";
	ctx.shadowBlur = 40;

	ctx.fillStyle = "#101010";
	roundRect(ctx, 40, 40, 1120, canvas.height - 80, 40, true);

	ctx.shadowBlur = 0;

	// Header Kenzo vortex 
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 55px Sans";
	ctx.textAlign = "left";
	ctx.fillText("Kenzo vortex", 80, 120);

	ctx.fillStyle = "#8f8f8f";
	ctx.font = "32px Sans";
	ctx.fillText("Admin Control System", 80, 165);

	// Ligne séparatrice
	ctx.fillStyle = "#00f0ff";
	ctx.fillRect(80, 190, 1040, 4);

	// Titre centré
	ctx.fillStyle = "#00f0ff";
	ctx.font = "bold 45px Sans";
	ctx.textAlign = "center";
	ctx.fillText("👑 Liste des admins du bot", 6};
