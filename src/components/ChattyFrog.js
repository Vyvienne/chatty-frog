import webllmService from '../services/webllmService.js';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const STOP_WORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "what", "which", "who", "whom", "how", "why",
    "when", "where", "do", "does", "did", "of", "in", "on", "at", "to", "and", "or", "for", "me", "my", "about",
    "tell", "it", "its", "this", "that", "these", "those", "you", "your", "i", "can", "could", "would", "should",
    "please", "with", "from", "by", "as", "there", "their", "they", "them", "he", "she", "his", "her", "we", "us",
    "any", "some", "into", "than", "then", "so", "if", "not", "no", "yes", "document", "documents", "file", "files"
]);

const CHUNK_SIZE = 900;        // characters per chunk
const CONTEXT_BUDGET = 3500;   // characters of document text sent to the AI per question

// Lowercase, strip punctuation, drop stop words, light plural stemming
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w))
        .map(w => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

// Split a document into ~CHUNK_SIZE pieces along paragraph / sentence boundaries
function chunkText(text) {
    const paragraphs = text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const pieces = [];
    for (const para of paragraphs) {
        if (para.length <= CHUNK_SIZE) {
            pieces.push(para);
            continue;
        }
        const sentences = para.match(/[^.!?\n]+[.!?]*\s*/g) || [para];
        let buf = "";
        for (const s of sentences) {
            if ((buf + s).length > CHUNK_SIZE && buf) {
                pieces.push(buf.trim());
                buf = "";
            }
            if (s.length > CHUNK_SIZE) {
                for (let i = 0; i < s.length; i += CHUNK_SIZE) pieces.push(s.slice(i, i + CHUNK_SIZE).trim());
            } else {
                buf += s;
            }
        }
        if (buf.trim()) pieces.push(buf.trim());
    }

    // Merge small neighbouring pieces so chunks carry enough context
    const chunks = [];
    let current = "";
    for (const piece of pieces) {
        if ((current + "\n\n" + piece).length > CHUNK_SIZE && current) {
            chunks.push(current);
            current = piece;
        } else {
            current = current ? `${current}\n\n${piece}` : piece;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

const Chattyfrog = {
    knowledge: [],
    documents: [],

    /**
     * Store an uploaded document and index it for retrieval.
     * @param {{ name: string, content: string, size: number, uploadedAt: Date }} doc
     */
    addDocument({ name, content, size, uploadedAt }) {
        const chunks = chunkText(content).map((text, index) => {
            const tokens = tokenize(text);
            const tf = new Map();
            for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
            return { index, text, tf, length: tokens.length };
        });
        const doc = {
            id: crypto.randomUUID(),
            name,
            content,
            size: size ?? content.length,
            uploadedAt: uploadedAt ?? new Date(),
            chunks
        };
        this.documents = [...this.documents.filter(d => d.name !== name), doc];
        return doc;
    },

    removeDocument(id) {
        this.documents = this.documents.filter(d => d.id !== id);
    },

    // Lightweight metadata for the UI
    listDocuments() {
        return this.documents.map(({ id, name, size, uploadedAt, chunks }) => ({
            id, name, size, uploadedAt, chunkCount: chunks.length
        }));
    },

    hasDocuments() {
        return this.documents.length > 0;
    },

    /**
     * Rank all document chunks against the query using BM25 scoring.
     * @returns {Array<{ doc, chunk, score }>} sorted best-first, only chunks with score > 0
     */
    rankChunks(query) {
        const terms = [...new Set(tokenize(query))];
        if (!terms.length) return [];

        const all = this.documents.flatMap(doc => doc.chunks.map(chunk => ({ doc, chunk })));
        if (!all.length) return [];

        const N = all.length;
        const avgLen = all.reduce((s, { chunk }) => s + chunk.length, 0) / N || 1;
        const df = new Map(terms.map(t => [t, all.filter(({ chunk }) => chunk.tf.has(t)).length]));
        const k1 = 1.4, b = 0.75;

        return all
            .map(({ doc, chunk }) => {
                let score = 0;
                let matched = 0;
                for (const t of terms) {
                    const f = chunk.tf.get(t) || 0;
                    if (!f) continue;
                    matched++;
                    const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
                    score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * (chunk.length / avgLen)));
                }
                return { doc, chunk, score, coverage: matched / terms.length };
            })
            .filter(r => r.score > 0)
            .sort((a, b2) => b2.score - a.score);
    },

    /**
     * Build the document context sent to the AI for a given question.
     * Uses the most relevant chunks; for generic requests ("summarize this")
     * falls back to the opening chunks of each document.
     */
    getDocumentContext(query, budget = CONTEXT_BUDGET) {
        if (!this.documents.length) return "";

        let selected = this.rankChunks(query);
        if (!selected.length) {
            // Round-robin through the start of each document
            const maxChunks = Math.max(...this.documents.map(d => d.chunks.length));
            selected = [];
            for (let i = 0; i < maxChunks; i++) {
                for (const doc of this.documents) {
                    if (doc.chunks[i]) selected.push({ doc, chunk: doc.chunks[i] });
                }
            }
        }

        const picked = [];
        let used = 0;
        for (const item of selected) {
            if (used + item.chunk.text.length > budget) {
                if (!picked.length) picked.push({ ...item, chunk: { ...item.chunk, text: item.chunk.text.slice(0, budget) } });
                break;
            }
            picked.push(item);
            used += item.chunk.text.length;
        }

        // Keep reading order within each document
        picked.sort((a, b) => a.doc.name.localeCompare(b.doc.name) || a.chunk.index - b.chunk.index);
        return picked
            .map(({ doc, chunk }) => `[Source: ${doc.name}, part ${chunk.index + 1}/${doc.chunks.length}]\n${chunk.text}`)
            .join("\n\n---\n\n");
    },

    // Best single passage for the offline fallback
    searchDocuments(message) {
        const [best] = this.rankChunks(message);
        if (!best || best.coverage < 0.5) return null;
        return { passage: best.chunk.text, name: best.doc.name };
    },

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

        // Check uploaded documents first
        if (this.hasDocuments()) {
            const hit = this.searchDocuments(message);
            if (hit) {
                const snippet = hit.passage.length > 700 ? hit.passage.slice(0, 700) + "…" : hit.passage;
                return `*Ribbit!* Here's what I found in "${hit.name}":\n\n${snippet}`;
            }
        }

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

                // Retrieve the document passages relevant to this question.
                // For vague follow-ups ("tell me more"), also use the previous question.
                let documentContext = "";
                if (this.hasDocuments()) {
                    let query = message;
                    if (!this.rankChunks(message).length) {
                        const lastUser = [...history].reverse().find(m => m.sender === "user");
                        if (lastUser) query = `${lastUser.message} ${message}`;
                    }
                    documentContext = this.getDocumentContext(query);
                }

                const aiReply = await webllmService.generateResponse(formattedHistory, onDelta, documentContext);
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