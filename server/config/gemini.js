// gemini.js
import dotenv from "dotenv";
dotenv.config();

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 180_000;

// Use valid Google Gemini model identifiers
const DEFAULT_MODEL = "gemini-3.8-flash";
const CANDIDATE_MODELS = [
    DEFAULT_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateGeminiResponse = async (prompt, model = DEFAULT_MODEL) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    const primaryModel = model || DEFAULT_MODEL;
    const modelsToTry = [primaryModel, ...CANDIDATE_MODELS.filter(m => m !== primaryModel)];
    let lastError = null;

    for (const targetModel of modelsToTry) {
        // Attempt each model up to 2 times (with brief backoff for 503)
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const url = `${GEMINI_BASE_URL}/${targetModel}:generateContent`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apiKey,
                    },
                    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.3
                        }
                    })
                });

                if (res.status === 503 || res.status === 429) {
                    const errorText = await res.text();
                    lastError = new Error(`Gemini (${targetModel}) overloaded (${res.status})`);
                    console.warn(`[Gemini] ${targetModel} overloaded (attempt ${attempt + 1}), retrying in ${(attempt + 1) * 1200}ms...`);
                    await sleep((attempt + 1) * 1200);
                    continue;
                }

                if (!res.ok) {
                    const errorText = await res.text();
                    lastError = new Error(`Gemini (${targetModel}) error (${res.status}): ${errorText}`);
                    console.warn(`[Gemini] ${targetModel} failed (${res.status}), trying next model...`);
                    break; // Don't retry this model, go to next
                }

                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    if (targetModel !== primaryModel) {
                        console.log(`[Gemini] Used fallback model: ${targetModel}`);
                    }
                    return text;
                }

                lastError = new Error(`Gemini (${targetModel}) returned empty response`);
                break;
            } catch (err) {
                lastError = err;
                console.warn(`[Gemini] ${targetModel} network error (attempt ${attempt + 1}):`, err.message);
                if (err.name === "TimeoutError" || err.name === "AbortError") {
                    throw new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`);
                }
                if (attempt === 0) await sleep(800);
            }
        }
    }

    throw lastError || new Error("All Gemini model candidates failed");
};
