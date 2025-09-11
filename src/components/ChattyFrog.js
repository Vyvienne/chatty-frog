const Chattyfrog = {
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

    // Core response handler
    getResponse(message) {
        if (!message) return this.emptyMessageResponse;

        const normalized = this.normalize(message);

        for (const { pattern, response } of this.responses) {
            if (pattern.test(normalized)) {
                return typeof response === "function" ? response() : response;
            }
        }

        return this.unsuccessfulResponse;
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