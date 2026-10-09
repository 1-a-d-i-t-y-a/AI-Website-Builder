import dotenv from "dotenv";
dotenv.config();

const REQUEST_TIMEOUT_MS = 180_000;

export const generateGroqResponse = async (prompt, model) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: "Return only a JSON object with string properties message and code. The code property must contain a complete HTML document." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Groq error (${response.status}): ${data.error?.message || JSON.stringify(data)}`);
    }

    const generatedText = data.choices?.[0]?.message?.content;
    if (typeof generatedText !== "string" || !generatedText.trim()) {
        throw new Error("Groq returned an empty response");
    }

    return generatedText;
};
