import webllmService from '../services/webllmService.js';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

    // Initialize WebLLM engine
    async initAI(onProgress) {
        return webllmService.init(onProgress);
    },

    isAIReady() {
        return webllmService.isReady;
    },

    // Persona-rich rule-based responses for offline / fallback
    responses: [
        {
            pattern: /^(hi|hello|hey|greetings|howdy|croak|ribbit)/i,
            response: () => pickRandom([
                "*Ribbit!* 🐸 Hello human friend! Welcome to my lily pad! What can I explore with you today?",
                "*Croak!* Hey there! Hope the sunshine is warm where you are today! How can I help?",
                "Hop hop! A visitor at the pond! 🌿 What would you like to chat about?"
            ])
        },
        {
            pattern: /how are you/i,
            response: () => pickRandom([
                "I'm feeling leap-tastic today! The pond water is cool and there are plenty of flies around. How are you?",
                "*Ribbit!* Doing splendidly! Just sunbathing on a nice green leaf. How are you doing today?"
            ])
        },
        {
            pattern: /flip.*coin/i,
            response: () => Math.random() < 0.5 
                ? "🪙 *Fliiiip!* ...It landed on Heads! *Ribbit!*" 
                : "🪙 *Fliiiip!* ...It landed on Tails! *Croak!*"
        },
        {
            pattern: /roll.*(dice|die)/i,
            response: () => `🎲 *Rolls the dice across the lily pad...* You got a ${Math.floor(Math.random() * 6) + 1}!`
        },
        {
            pattern: /(date|today.*date|what.*day)/i,
            response: () => {
                const now = new Date();
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                return `Today is ${months[now.getMonth()]} ${now.getDate()}! A beautiful day in nature! 🌿`;
            }
        },
        {
            pattern: /(joke|funny|laugh)/i,
            response: () => pickRandom([
                "Why are frogs always so happy? Because they eat whatever bugs them! 🐸🦗",
                "What happened to the frog who double-parked his lily pad? He got toad away! 🚗🐸",
                "What kind of shoes do stylish frogs wear? Open-toad sandals! 👡",
                "What is a frog's favorite candy? Lolli-hops! 🍭"
            ])
        },
        {
            pattern: /(eat|food|hungry|snack|diet)/i,
            response: () => pickRandom([
                "Mmm! Juicy beetles, crispy dragonflies, and crunchy water bugs! 🪰 Want to share? (Humans usually say no for some reason!)",
                "My favorite delicacy is freshly caught gnats right over the pond water at twilight. Simply delicious! 🦟"
            ])
        },
        {
            pattern: /(who are you|your name)/i,
            response: "I'm Chatty Frog! 🐸 The chattiest, friendliest amphibian in the pond. I know all about trees, rain, and animals, though human gadgets baffle me!"
        },
        {
            pattern: /(wifi|wi-fi|internet|computer|phone|smartphone|coding|programmer|software)/i,
            response: () => pickRandom([
                "*Taps chin with webbed foot*... Internet? Is that like the dewy spider webs between the reeds? Humans keep staring into glowing bricks to check it! 🕸️📱",
                "I hear humans talk about 'bugs in code' all the time... whenever I see bugs, I just eat them! Why do you humans get so upset about tasty snacks? 🪰💻"
            ])
        },
        {
            pattern: /thank/i,
            response: "You are very welcome! *Ribbit!* It's always a delight chatting with you! 🐸💚"
        }
    ],

    unsuccessfulResponses: [
        "*Ribbit?* My little frog ears didn't catch that. Try asking about animals, weather, a frog joke, or tell me to flip a coin! 🐸",
        "*Blinks large frog eyes*... Hmm, that sounds like strange human language! Could you say that in another way?",
        "Hmm, I haven't learned that one yet in tadpole school! 🐸 Try asking about nature or pond life!"
    ],

    emptyMessageResponse: `*Ribbit?* It looks like your message is empty! Type something and I'll jump right on it. 🐸`,

    // Normalize input
    normalize(message) {
        return message.toLowerCase().replace(/[^\w\s]/gi, "").trim();
    },

    // Simple word intersection similarity
    similarity(a, b) {
        const aWords = new Set(a.split(/\s+/));
        const bWords = new Set(b.split(/\s+/));
        const intersection = [...aWords].filter(x => bWords.has(x));
        return intersection.length / Math.max(aWords.size, bWords.size);
    },

    findBestMatch(message) {
        let best = { score: 0, answer: null };
        const normMsg = this.normalize(message);
        for (const { question, answer } of this.knowledge) {
            const score = this.similarity(normMsg, this.normalize(question));
            if (score > best.score) best = { score, answer };
        }
        return best.score > 0.35 ? best.answer : null;
    },

    // Local pattern/knowledge response
    getLocalResponse(message) {
        if (!message || !message.trim()) return this.emptyMessageResponse;

        const normalized = this.normalize(message);

        for (const { pattern, response } of this.responses) {
            if (pattern.test(normalized)) {
                return typeof response === "function" ? response() : response;
            }
        }

        // Check local nature knowledge base
        const kbAnswer = this.findBestMatch(message);
        if (kbAnswer) {
            return `*Ribbit!* Nature trivia time: ${kbAnswer} 🌿`;
        }

        return pickRandom(this.unsuccessfulResponses);
    },

    /**
     * Primary entry point: Generates a response using WebLLM if ready,
     * otherwise falls back smoothly to local persona engine.
     */
    async replyStream({ message, history = [], onDelta }) {
        if (webllmService.isReady) {
            try {
                // Convert app message format to OpenAI role/content format
                const formattedHistory = history.map(item => ({
                    role: item.sender === "frog" ? "assistant" : "user",
                    content: item.message
                }));

                // Ensure current message is at end
                formattedHistory.push({ role: "user", content: message });

                const aiReply = await webllmService.generateResponse(formattedHistory, onDelta);
                if (aiReply && aiReply.trim()) {
                    return aiReply;
                }
            } catch (err) {
                console.warn("WebLLM generation failed, falling back to local engine:", err);
            }
        }

        // Fallback to local rule/knowledge engine with a short natural typing delay
        const localReply = this.getLocalResponse(message);
        if (onDelta) {
            // Emulate streaming for smooth UX
            const words = localReply.split(" ");
            let current = "";
            for (let i = 0; i < words.length; i++) {
                current += (i > 0 ? " " : "") + words[i];
                onDelta(words[i] + " ", current);
                await new Promise(r => setTimeout(r, 35));
            }
        }
        return localReply;
    },

    getResponseAsync(message) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(this.getLocalResponse(message)), 400);
        });
    }
};

export { Chattyfrog };
export default Chattyfrog;