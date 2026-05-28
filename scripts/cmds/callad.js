const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
    config: {
        name: "callad",
        version: "1.7",
        author: "Christus",
        countDown: 5,
        role: 0,
        description: {
            fr: "📨 Envoyez vos rapports, suggestions ou bugs directement aux administrateurs du bot",
            en: "📨 Send reports, feedbacks, or bugs directly to bot admins"
        },
        category: "contacts admin",
        guide: {
            fr: "📌 Usage : {pn} <votre message>",
            en: "📌 Usage: {pn} <your message>"
        }
    },

    langs: {
        fr: {
            missingMessage: "❌ Veuillez écrire le message que vous souhaitez envoyer aux admins !",
            sendByGroup: "\n- Envoyé depuis le groupe : %1\n- Thread ID : %2",
            sendByUser: "\n- Envoyé par l'utilisateur",
            content: "\n\n💬 Contenu du message :\n────────────────────────────\n%1\n────────────────────────────\n💡 Répondez à ce message pour envoyer un retour à l'utilisateur",
            success: "✅ Votre message a été envoyé avec succès à %1 admin !\n%2",
            failed: "❌ Une erreur est survenue lors de l'envoi à %1 admin\n%2\n📌 Vérifiez la console pour plus de détails",
            reply: "📍 Réponse de l'admin %1 :\n────────────────────────────\n%2\n────────────────────────────\n💡 Répondez à ce message pour continuer la discussion avec l'admin",
            replySuccess: "✅ Votre réponse a été envoyée avec succès à l'admin !",
            feedback: "📝 Feedback de l'utilisateur %1 :\n- User ID : %2%3\n\n💬 Contenu :\n────────────────────────────\n%4\n────────────────────────────\n💡 Répondez à ce message pour envoyer votre retour à l'utilisateur",
            replyUserSuccess: "✅ Votre réponse a été envoyée avec succès à l'utilisateur !",
            noAdmin: "⚠️ Actuellement, aucun administrateur n'est disponible."
        },
        en: {
            missingMessage: "❌ Please enter the message you want to send to admin!",
            sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
            sendByUser: "\n- Sent from user",
            content: "\n\n💬 Message content:\n────────────────────────────\n%1\n────────────────────────────\n💡 Reply to this message to send feedback to the user",
            success: "✅ Your message has been successfully sent to %1 admin!\n%2",
            failed: "❌ An error occurred while sending your message to %1 admin\n%2\n📌 Check console for details",
            reply: "📍 Reply from admin %1:\n────────────────────────────\n%2\n────────────────────────────\n💡 Reply to this message to continue chatting with admin",
            replySuccess: "✅ Your reply has been successfully sent to admin!",
            feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\n💬 Content:\n────────────────────────────\n%4\n────────────────────────────\n💡 Reply to this message to send feedback to user",
            replyUserSuccess: "✅ Your reply has been successfully sent to user!",
            noAdmin: "⚠️ No admin is available at the moment."
        }
    },

    onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
        const { config } = global.GoatBot;

        if (!args[0]) return message.reply(getLang("missingMessage"));

        const { senderID, threadID, isGroup } = event;
        if (config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

        const senderName = await usersData.getName(senderID);

        const msgHeader = "==📨️ APPEL ADMIN 📨️=="
            + `\n- Nom de l'utilisateur : ${senderName}`
            + `\n- ID de l'utilisateur : ${senderID}`
            + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

        const formMessage = {
            body: msgHeader + getLang("content", args.join(" ")),
            mentions: [{
                id: senderID,
                tag: senderName
            }],
            attachment: await getStreamsFromAttachment(
                [...event.attachments, ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        const successIDs = [];
        const failedIDs = [];
        const adminNames = await Promise.all(config.adminBot.map(async item => ({
            id: item,
            name: await usersData.getName(item)
        })));

        for (const uid of config.adminBot) {
            try {
                const messageSend = await api.sendMessage(formMessage, uid);
                successIDs.push(uid);
                global.GoatBot.onReply.set(messageSend.messageID, {
                    commandName,
                    messageID: messageSend.messageID,
                    threadID,
                    messageIDSender: event.messageID,
                    type: "userCallAdmin"
                });
            } catch (err) {
                failedIDs.push({ adminID: uid, error: err });
            }
        }

        let resultMsg = "";
        if (successIDs.length > 0) {
            resultMsg += getLang("success", successIDs.length,
                adminNames.filter(item => successIDs.includes(item.id))
                    .map(item => ` <@${item.id}> (${item.name})`).join("\n")
            );
        }
        if (failedIDs.length > 0) {
            resultMsg += getLang("failed", failedIDs.length,
                failedIDs.map(item => ` <@${item.adminID}> (${adminNames.find(a => a.id === item.adminID)?.name || item.adminID})`).join("\n")
            );
            log.err("CALL ADMIN", failedIDs);
        }

        return message.reply({
            body: resultMsg,
            mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
        });
    },

    onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
        const { type, threadID, messageIDSender } = Reply;
        const senderName = await usersData.getName(event.senderID);
        const { isGroup } = event;

        switch (type) {
            case "userCallAdmin": {
                const formMessage = {
                    body: getLang("reply", senderName, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err) return message.err(err);
                    message.reply(getLang("replyUserSuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "adminReply"
                    });
                }, messageIDSender);
                break;
            }
            case "adminReply": {
                let sendByGroup = "";
                if (isGroup) {
                    const { threadName } = await api.getThreadInfo(event.threadID);
                    sendByGroup = getLang("sendByGroup", threadName, event.threadID);
                }
                const formMessage = {
                    body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err) return message.err(err);
                    message.reply(getLang("replySuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "userCallAdmin"
                    });
                }, messageIDSender);
                break;
            }
            default: break;
        }
    }
};
