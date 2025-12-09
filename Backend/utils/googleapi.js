const { GoogleGenAI } = require('@google/genai');
const logger = require('./logger');

const API_KEY = process.env.API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function askGemini(context, question) {
    try {
        let response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: question,
            config: { systemInstruction: context }
        });
        return response.text;
    } catch (error) {
        logger.error('Lỗi khi gọi Gemini API', error);
        throw new Error('Lỗi Gemini API');
    }
}

module.exports = { askGemini };