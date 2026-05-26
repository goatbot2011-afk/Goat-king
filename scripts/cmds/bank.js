const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'bank_advanced.json');
let data = { users: {} };

// --------- Chargement initial ---------
function loadBank() {
    if (!fs.existsSync(bankPath)) {
        fs.writeFileSync(bankPath, JSON.stringify({ users: {} }, null, 2));
    }
    data = JSON.parse(fs.readFileSync(bankPath));
}

// --------- Sauvegarde automatique ---------
function saveBank() {
    fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));
}

// Sauvegarde automatique toutes les 30 secondes
setInterval(() => {
    saveBank();
    console.log("💾 Bank sauvegardée automatiquement.");
}, 30000);

loadBank();

// --------- Fonction encadrée décorée ---------
function encadre(title, content, emoji = "🏦") {
    let line = "═".repeat(30);
    return `╔${line}╗\n${emoji}  【 ${title} 】  ${emoji}\n╠${line}╣\n${content}\n╚${line}╝`;
}

// --------- Formattage historique ---------
function formatHistory(history) {
    return history.map(t => {
        let icon = "💰";
        if (t.type.includes("transfert")) icon = "🔄";
        else if (t.type === "daily") icon = "🎁";
        else if (t.type === "depot") icon = "💵";
        else if (t.type === "retrait") icon = "🏧";
        let extra = t.to ? ` → ${t.to}` : t.from ? ` ← ${t.from}` : '';
        return `${icon} ${t.date.split("T")[0]} - ${t.type.toUpperCase()}${extra} : ${t.amount} coins`;
    }).join("\n");
}

module.exports = {
    config: {
        name: "bank",
        aliases: ["banque", "wallet", "walletbank", "bal"],
        version: "1.0",
        author: "Camille",
        description: "💰 Banque Messenger complète 🏦\n- Dépôt / Retrait / Transfert\n- Daily 500 coins\n- Historique complet\n- Solde / Bal"
    },
    run: async ({ message, args, senderName, sendMessage }) => {
        let userId = message.senderID;

        // Créer un compte si inexistant
        if (!data.users[userId]) {
            data.users[userId] = { name: senderName, balance: 0, history: [], lastDaily: null };
        }

        let user = data.users[userId];

        if (!args[0]) return sendMessage(encadre("Guide Bank", "bal | solde | depot <montant> | retrait <montant> | transfert <@user> <montant> | daily | historique", "✨"));

        let cmd = args[0].toLowerCase();

        // ----------------- BAL / SOLDE -----------------
        if (cmd === "bal" || cmd === "solde") {
            return sendMessage(encadre("💰 Solde", `${user.name}, ton solde actuel est : ${user.balance} coins`, "💎"));
        }

        // ----------------- DEPOT -----------------
        if (cmd === "depot") {
            let amount = parseInt(args[1]);
            if (isNaN(amount) || amount <= 0) return sendMessage(encadre("❌ Erreur", "Montant invalide pour le dépôt.", "⚠️"));
            user.balance += amount;
            user.history.push({ type: "depot", amount, date: new Date().toISOString() });
            saveBank();
            return sendMessage(encadre("✅ Dépôt", `${user.name}, tu as déposé ${amount} coins.\n💵 Nouveau solde : ${user.balance} coins`, "💰"));
        }

        // ----------------- RETRAIT -----------------
        if (cmd === "retrait") {
            let amount = parseInt(args[1]);
            if (isNaN(amount) || amount <= 0) return sendMessage(encadre("❌ Erreur", "Montant invalide pour le retrait.", "⚠️"));
            if (amount > user.balance) return sendMessage(encadre("⚠️ Attention", "Solde insuffisant pour ce retrait.", "⚠️"));
            user.balance -= amount;
            user.history.push({ type: "retrait", amount, date: new Date().toISOString() });
            saveBank();
            return sendMessage(encadre("🏧 Retrait", `${user.name}, tu as retiré ${amount} coins.\n💵 Nouveau solde : ${user.balance} coins`, "🏦"));
        }

        // ----------------- TRANSFERT -----------------
        if (cmd === "transfert") {
            let targetTag = args[1];
            let amount = parseInt(args[2]);
            if (!targetTag || isNaN(amount) || amount <= 0) return sendMessage(encadre("❌ Erreur", "Usage: transfert <@user> <montant>", "⚠️"));
            let targetUser = Object.entries(data.users).find(([id, u]) => `@${u.name}` === targetTag);
            if (!targetUser) return sendMessage(encadre("❌ Erreur", "Utilisateur cible introuvable.", "⚠️"));
            let [targetId, target] = targetUser;
            if (amount > user.balance) return sendMessage(encadre("⚠️ Attention", "Solde insuffisant pour le transfert.", "⚠️"));
            user.balance -= amount;
            target.balance += amount;
            let date = new Date().toISOString();
            user.history.push({ type: "transfert-envoye", to: target.name, amount, date });
            target.history.push({ type: "transfert-recu", from: user.name, amount, date });
            saveBank();
            return sendMessage(encadre("🔄 Transfert", `${user.name} a transféré ${amount} coins à ${target.name}\n💵 Nouveau solde : ${user.balance} coins`, "🔄"));
        }

        // ----------------- DAILY -----------------
        if (cmd === "daily") {
            let now = new Date();
            let lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
            if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
                let next = new Date(lastDaily.getTime() + 24 * 60 * 60 * 1000);
                return sendMessage(encadre("⏳ Daily déjà pris", `Reviens le ${next.toLocaleString()}`, "⏳"));
            }
            let dailyAmount = 500;
            user.balance += dailyAmount;
            user.lastDaily = now.toISOString();
            user.history.push({ type: "daily", amount: dailyAmount, date: now.toISOString() });
            saveBank();
            return sendMessage(encadre("🎁 Daily reçu", `${user.name}, tu as reçu ton daily de ${dailyAmount} coins !\n💵 Nouveau solde : ${user.balance} coins`, "🎉"));
        }

        // ----------------- HISTORIQUE -----------------
        if (cmd === "historique") {
            if (user.history.length === 0) return sendMessage(encadre("📜 Historique", "Aucun historique de transactions.", "📜"));
            return sendMessage(encadre("📜 Historique", formatHistory(user.history), "📜"));
        }

        return sendMessage(encadre("❌ Commande inconnue", "Utilise : bal | solde | depot <montant> | retrait <montant> | transfert <@user> <montant> | daily | historique", "⚠️"));
    }
};
