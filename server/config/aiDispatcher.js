import { generateGeminiResponse } from "./gemini.js";
import { generateCloudflareResponse } from "./cloudflare.js";
import { generateGroqResponse } from "./groq.js";
import { generateOpenRouterResponse } from "./openrouter.js";

export const AVAILABLE_MODELS = [
    {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash",
        provider: "Google Gemini",
        badge: "Recommended",
        description: "Google's fast, high-quality AI model for website generation.",
        isFree: true
    },
    {
        id: "llama3-70b-8192",
        name: "Llama 3 70B (Groq)",
        provider: "Groq",
        badge: "Ultra Fast",
        description: "Blistering fast Llama 3 running on Groq LPUs.",
        isFree: true
    },
    {
        id: "meta-llama/llama-3-8b-instruct:free",
        name: "Llama 3 8B (OpenRouter)",
        provider: "OpenRouter",
        badge: "Free API",
        description: "Meta's highly capable Llama 3 8B model, completely free.",
        isFree: true
    },
    {
        id: "cloudflare/qwen2.5-coder-32b-instruct",
        name: "Qwen2.5 Coder 32B",
        provider: "Cloudflare Workers AI",
        badge: "Cloudflare",
        description: "Code-focused Qwen model hosted by Cloudflare Workers AI.",
        isFree: true
    },
];

export const executePrompt = async (prompt, model = "gemini-3.8-flash") => {
    const selectedModel = model || "gemini-3.8-flash";
    if (!AVAILABLE_MODELS.some((availableModel) => availableModel.id === selectedModel)) {
        throw new Error(`Selected AI model is unavailable: ${selectedModel}`);
    }

    if (selectedModel.toLowerCase().startsWith("gemini")) {
        try {
            return await generateGeminiResponse(prompt, selectedModel);
        } catch (geminiError) {
            console.error("[AI Dispatcher] Gemini unavailable, falling back to Cloudflare Workers AI:", geminiError.message);
            try {
                return await generateCloudflareResponse(prompt);
            } catch (fallbackError) {
                throw new Error(`Both Gemini and Cloudflare Workers AI failed. Gemini: ${geminiError.message}. Cloudflare: ${fallbackError.message}`);
            }
        }
    } else if (selectedModel.startsWith("llama3-")) {
        try {
            return await generateGroqResponse(prompt, selectedModel);
        } catch (groqError) {
            console.error("[AI Dispatcher] Groq unavailable:", groqError.message);
            throw new Error(`Groq failed: ${groqError.message}`);
        }
    } else if (selectedModel.includes(":free") || selectedModel.includes("openrouter")) {
        try {
            return await generateOpenRouterResponse(prompt, selectedModel);
        } catch (orError) {
            console.error("[AI Dispatcher] OpenRouter unavailable:", orError.message);
            throw new Error(`OpenRouter failed: ${orError.message}`);
        }
    }

    try {
        return await generateCloudflareResponse(prompt);
    } catch (cloudflareError) {
        console.error("[AI Dispatcher] Cloudflare Workers AI failed, attempting Gemini fallback:", cloudflareError.message);
        if (process.env.GEMINI_API_KEY) {
            try {
                return await generateGeminiResponse(prompt, "gemini-3.8-flash");
            } catch (fallbackErr) {
                console.error("[AI Dispatcher] Gemini fallback also failed:", fallbackErr.message);
                throw new Error(`Both Cloudflare Workers AI and Gemini failed. Cloudflare: ${cloudflareError.message}. Gemini: ${fallbackErr.message}`);
            }
        }
        throw cloudflareError;
    }
};
