import dotenv from "dotenv";
dotenv.config();

const CLOUDFLARE_MODEL = "@cf/qwen/qwen2.5-coder-32b-instruct";
const REQUEST_TIMEOUT_MS = 180_000;

export const generateCloudflareResponse = async (prompt) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API;

    if (!accountId || !apiToken) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API must be configured");
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_MODEL}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
            messages: [
                { role: "system", content: "Return only a JSON object with string properties message and code. The code property must contain a complete HTML document." },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            max_tokens: 12000,
            temperature: 0.2,
        }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        const details = data.errors?.map(({ message }) => message).filter(Boolean).join("; ");
        throw new Error(`Cloudflare Workers AI error (${response.status})${details ? `: ${details}` : ""}`);
    }

    const generatedText = data.result?.response;
    if (typeof generatedText !== "string" || !generatedText.trim()) {
        throw new Error("Cloudflare Workers AI returned an empty response");
    }

    return generatedText;
};