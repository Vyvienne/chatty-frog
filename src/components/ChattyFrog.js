const Chattyfrog = {
    defaultResponses: {
        'hello hi': `Hello! How can I help you?`,
        'how are you': `I'm doing great! How can I help you?`,
        'flip a coin': function () {
            return Math.random() < 0.5 ? 'Sure! You got heads' : 'Sure! You got tails';
        },
        'roll a dice': function () {
            const diceResult = Math.floor(Math.random() * 6) + 1;
            return `Sure! You got ${diceResult}`;
        },
        'what is the date today': function () {
            const now = new Date();
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return `Today is ${months[now.getMonth()]} ${now.getDate()}`;
        },
        'thank': 'No problem! Let me know if you need help with anything else!',
    },

    additionalResponses: {},

    unsuccessfulResponse: `Sorry, I didn't quite understand that. Currently, I only know how to flip a coin, roll a dice, or get today's date. Let me know how I can help!`,

    emptyMessageResponse: `Sorry, it looks like your message is empty. Please make sure you send a message and I will give you a response.`,

    addResponses(additionalResponses) {
        this.additionalResponses = {
            ...this.additionalResponses,
            ...additionalResponses
        };
    },

    getResponse(message) {
        if (!message) return this.emptyMessageResponse;

        const responses = { ...this.defaultResponses, ...this.additionalResponses };

        const { ratings, bestMatchIndex } = this.stringSimilarity(message, Object.keys(responses));
        const bestResponseRating = ratings[bestMatchIndex].rating;

        if (bestResponseRating <= 0.3) return this.unsuccessfulResponse;

        const response = responses[ratings[bestMatchIndex].target];
        return typeof response === 'function' ? response() : response;
    },

    getResponseAsync(message) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(this.getResponse(message)), 1000);
        });
    },

    compareTwoStrings(first, second) {
        first = first.replace(/\s+/g, '');
        second = second.replace(/\s+/g, '');

        if (first === second) return 1;
        if (first.length < 2 || second.length < 2) return 0;

        let firstBigrams = new Map();
        for (let i = 0; i < first.length - 1; i++) {
            const bigram = first.substring(i, i + 2);
            firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
        }

        let intersectionSize = 0;
        for (let i = 0; i < second.length - 1; i++) {
            const bigram = second.substring(i, i + 2);
            if (firstBigrams.get(bigram)) {
                firstBigrams.set(bigram, firstBigrams.get(bigram) - 1);
                intersectionSize++;
            }
        }

        return (2.0 * intersectionSize) / (first.length + second.length - 2);
    },

    stringSimilarity(mainString, targetStrings) {
        const ratings = [];
        let bestMatchIndex = 0;

        for (let i = 0; i < targetStrings.length; i++) {
            const currentRating = this.compareTwoStrings(mainString, targetStrings[i]);
            ratings.push({ target: targetStrings[i], rating: currentRating });
            if (currentRating > ratings[bestMatchIndex].rating) bestMatchIndex = i;
        }

        return { ratings, bestMatch: ratings[bestMatchIndex], bestMatchIndex };
    },
};

// Export as ESM
export { Chattyfrog };
export default Chattyfrog;
