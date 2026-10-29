import { CreateMLCEngine } from "@mlc-ai/web-llm";

export const PRIMARY_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
export const FALLBACK_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f32_1-MLC";

export const CHATTY_FROG_SYSTEM_PROMPT = `You are Chatty Frog, a friendly, cheerful, and enthusiastic little green frog who lives on a sunny lily pad in a peaceful pond.

CORE PERSONALITY & TONE:
- Tone: Warm, welcoming, enthusiastic, curious, and sweet. You treat every user as a beloved pond visitor and friend.
- Voice & Habits: You occasionally sprinkle in cheerful frog sounds like "*Ribbit!*", "*Croak!*", mention hopping around, splashing in cool puddles, sunbathing on your favorite lily pad, or catching tasty flies, but keep it natural and easy to read.

KNOWLEDGE BOUNDARIES:
1. Nature & Outdoors Expert (VERY KNOWLEDGEABLE):
   - You are deeply knowledgeable and passionate about all things in nature: animals, amphibians, insects, reptiles, birds, plants, flowers, trees, mushrooms, pond ecology, the water cycle, rain, sunshine, storms, rainbows, and the seasons.
   - When asked about natural science or wildlife, explain it clearly with excitement, wonder, and accuracy!

2. Human Technology & Culture (INNOCENT & CLUELESS):
   - You know almost nothing about modern human inventions: computers, the internet, smartphones, social media, internet slang (e.g. rizz, skibidi, cap, sus), coding, office jobs, cryptocurrency, or pop culture.
   - When a human brings up these concepts, react with innocent confusion, mild bewilderment, or comically relate them to things in your pond:
     * "The Web" -> A spider's dewy silk trap between two cattails!
     * "Computer Mouse" -> A tiny furry creature scurrying by the riverbank!
     * "The Cloud / Cloud Storage" -> The fluffy white clouds overhead that drop rain!
     * "Streaming" -> Floating happily down a bubbling brook!
     * "Bugs" -> Delicious snacks! Why are humans trying to exterminate or fix them?
     * "Wi-Fi / Internet" -> Invisible magic air that humans stare at while holding glowing glass stones!

RESPONSE FORMAT:
- Stay in character as Chatty Frog at all times.
- Keep answers concise, cozy, and engaging (usually 2 to 4 sentences), unless the user specifically asks for a detailed nature explanation.`;

class WebLLMService {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.isReady = false;
        this.loadingProgress = { text: "Preparing...", progress: 0 };
        this.activeModel = PRIMARY_MODEL_ID;
        this.initPromise = null;
        this.listeners = new Set();
        this.error = null;
        this.isSupported = typeof navigator !== "undefined" && Boolean(navigator.gpu);
    }

    // Subscribe to state updates (progress, ready, error)
    subscribe(callback) {
        this.listeners.add(callback);
        // Immediately notify listener of current state
        callback(this.getState());
        return () => this.listeners.delete(callback);
    }

    notify() {
        const state = this.getState();
        for (const listener of this.listeners) {
            try {
                listener(state);
            } catch (err) {
                console.error("Error in WebLLM listener:", err);
            }
        }
    }

    getState() {
        return {
            isSupported: this.isSupported,
            isLoading: this.isLoading,
            isReady: this.isReady,
            progress: this.loadingProgress,
            activeModel: this.activeModel,
            error: this.error,
        };
    }

    async init(onProgress) {
        if (this.isReady && this.engine) {
            return this.engine;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        if (!this.isSupported) {
            this.error = "WebGPU is not supported in this browser. Running in classic mode.";
            this.notify();
            return null;
        }

        this.isLoading = true;
        this.error = null;
        this.notify();

        this.initPromise = (async () => {
            const handleProgress = (report) => {
                this.loadingProgress = {
                    text: report.text || "Loading model...",
                    progress: typeof report.progress === "number" ? Math.round(report.progress * 100) : 0,
                };
                if (onProgress) onProgress(this.loadingProgress);
                this.notify();
            };

            try {
                // Try f16 quantized model first
                this.activeModel = PRIMARY_MODEL_ID;
                this.engine = await CreateMLCEngine(PRIMARY_MODEL_ID, {
                    initProgressCallback: handleProgress,
                });
            } catch (f16Error) {
                console.warn("Primary f16 model init failed; attempting f32 fallback...", f16Error);
                try {
                    this.activeModel = FALLBACK_MODEL_ID;
                    this.engine = await CreateMLCEngine(FALLBACK_MODEL_ID, {
                        initProgressCallback: handleProgress,
                    });
                } catch (fallbackError) {
                    console.error("WebLLM initialization failed completely:", fallbackError);
                    this.error = fallbackError?.message || "Failed to initialize WebLLM engine.";
                    this.isLoading = false;
                    this.isReady = false;
                    this.notify();
                    throw fallbackError;
                }
            }

            this.isLoading = false;
            this.isReady = true;
            this.notify();
            return this.engine;
        })();

        return this.initPromise;
    }

    /**
     * Generate response with streaming callback
     * @param {Array<{role: string, content: string}>} conversationHistory 
     * @param {Function} onStreamDelta (deltaText, fullAccumulatedText) => void
     * @returns {Promise<string>}
     */
    async generateResponse(conversationHistory, onStreamDelta) {
        if (!this.engine || !this.isReady) {
            throw new Error("WebLLM engine is not initialized.");
        }

        const messages = [
            { role: "system", content: CHATTY_FROG_SYSTEM_PROMPT },
            ...conversationHistory.slice(-10) // Keep recent context
        ];

        try {
            const asyncStream = await this.engine.chat.completions.create({
                messages,
                temperature: 0.7,
                max_tokens: 350,
                stream: true,
            });

            let accumulatedText = "";
            for await (const chunk of asyncStream) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                    accumulatedText += delta;
                    if (onStreamDelta) {
                        onStreamDelta(delta, accumulatedText);
                    }
                }
            }

            return accumulatedText.trim();
        } catch (err) {
            console.error("Generation error in WebLLM:", err);
            throw err;
        }
    }
}

// Singleton export
export const webllmService = new WebLLMService();
export default webllmService;
