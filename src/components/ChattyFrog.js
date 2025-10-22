const Chattyfrog = {
    knowledge: [],

    async loadKnowledge() {
        try {
            const res = await fetch("/nature_knowledge.json");
            this.knowledge = await res.json();
        } catch (err) {
            console.error("Failed to load knowledge:", err);
            this.knowledge = [];
        }
    },

    // Regex-based responses
    responses: [
        {
            pattern: /^(hi|hello|hey)/i,
            response: "Hello! How can I help you?"
        },
        {
            pattern: /how are you/i,
            response: "I'm doing great! How can I help you?"
        },
        {
            pattern: /flip.*coin/i,
            response: () => Math.random() < 0.5 ? "Sure! You got heads" : "Sure! You got tails"
        },
        {
            pattern: /roll.*(dice|die)/i,
            response: () => `Sure! You got ${Math.floor(Math.random() * 6) + 1}`
        },
        {
            pattern: /(date|today)/i,
            response: () => {
                const now = new Date();
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                return `Today is ${months[now.getMonth()]} ${now.getDate()}`;
            }
        },
        {
            pattern: /thank/i,
            response: "No problem! Let me know if you need help with anything else!"
        }
    ],

    unsuccessfulResponse: `Sorry, I didn't quite understand that. I can flip a coin, roll a dice, or tell you today's date. Try asking again!`,

    emptyMessageResponse: `Sorry, it looks like your message is empty. Please type something and I'll respond.`,

    // Normalize input (lowercase, remove punctuation)
    normalize(message) {
        return message.toLowerCase().replace(/[^\w\s]/gi, "").trim();
    },

    // Simple similarity scoring
    similarity(a, b) {
        const aWords = new Set(a.split(" "));
        const bWords = new Set(b.split(" "));
        const intersection = [...aWords].filter(x => bWords.has(x));
        return intersection.length / Math.max(aWords.size, bWords.size);
    },

    findBestMatch(message) {
        let best = { score: 0, answer: null };
        for (const { question, answer } of this.knowledge) {
            const score = this.similarity(this.normalize(message), this.normalize(question));
            if (score > best.score) best = { score, answer };
        }
        return best.score > 0.3 ? best.answer : null; // adjust threshold
    },

    // Core response handler
    getResponse(message) {
        if (!message) return this.emptyMessageResponse;

        const normalized = this.normalize(message);

        for (const { pattern, response } of this.responses) {
            if (pattern.test(normalized)) {
                return typeof response === "function" ? response() : response;
            }
        }

        // Check knowledge base
        const kbAnswer = this.findBestMatch(message);
        return kbAnswer || "Hmm, I don't know that one yet 🐸 Maybe you can teach me?";

        // return this.unsuccessfulResponse;
    },

    getResponseAsync(message) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(this.getResponse(message)), 500);
        });
    }
};

// Export as ESM
export { Chattyfrog };
export default Chattyfrog;