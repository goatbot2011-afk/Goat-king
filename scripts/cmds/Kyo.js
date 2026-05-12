const axios = require('axios');

const API_URL = 'https://messie-flash-api-ia.vercel.app/chat?prompt=';
const API_KEY = 'messie12356osango2025jinWoo';
const CREATOR_ID = "61578782186857";

// ================= IA =================
async function getAIResponse(input, userID) {
    try {
        const prompt = `
Tu es Kyo Soma.
- Tu parles comme un humain réel
- Tu es direct, parfois froid, sarcastique ou agressif
- Tu peux être respectueux uniquement avec ton créateur
- IMPORTANT : réponds uniquement en français
- Évite les phrases robotiques comme "Based on the information provided"

Message utilisateur : ${input}
`;

        const response = await axios.get(
            `${API_URL}${encodeURIComponent(prompt)}&apiKey=${API_KEY}`,
            {
                timeout: 10000,
                headers: { 'Accept': 'application/json' }
            }
        );

        let reply =
            response.data?.parts?.[0]?.reponse ||
            response.data?.response ||
            "…Tch, j’ai rien à dire.";

        // 👑 Mode créateur
        if (userID === CREATOR_ID) {
            reply = "⚡ " + reply;
        }

        return reply;

    } catch (error) {
        console.error("API Error:", error.response?.status, error.message);
        return "😾 Tch… le serveur est mort ou quoi ?";
    }
}

// ================= STYLE =================
function toBoldFont(text) {
    const offsetUpper = 0x1D400 - 65;
    const offsetLower = 0x1D41A - 97;

    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
        return char;
    }).join('');
}

function formatResponse(content) {
    return "😾 𝗞𝘆𝗼 𝗦𝗼𝗺𝗮 :\n\n" + toBoldFont(content);
}

// ================= MODULE =================
module.exports = {
    config: {
        name: 'kyo',
        author: 'Camille',
        version: '3.0',
        role: 0,
        category: 'AI',
        shortDescription: 'Kyo Soma IA',
        longDescription: 'IA avec personnalité humaine froide et sarcastique',
        keywords: ['kyo', 'ai']
    },

    // ===== AVEC PRÉFIXE =====
    onStart: async function({ api, event, args }) {
        const input = args.join(' ').trim();

        if (!input) {
            return api.sendMessage(
                formatResponse("Parle. J’ai pas toute la journée."),
                event.threadID
            );
        }

        const res = await getAIResponse(input, event.senderID);
        api.sendMessage(formatResponse(res), event.threadID, event.messageID);
    },

    // ===== SANS PRÉFIXE =====
    onChat: async function({ event, message }) {
        if (!event.body) return;

        const body = event.body;

        // Détection naturelle
        if (!/\b(kyo)\b/i.test(body)) return;

        // Si juste "kyo"
        if (/^\s*kyo\s*$/i.test(body)) {
            return message.reply(formatResponse("Quoi ?"));
        }

        const input = body.replace(/\bkyo\b/i, "").trim();
        if (!input) return;

        const res = await getAIResponse(input, event.senderID);
        message.reply(formatResponse(res));
    }
};
