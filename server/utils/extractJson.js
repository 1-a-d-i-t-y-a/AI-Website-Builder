export const normalizeGeneratedCode = (code) => {
    const escapedNewlines = code.match(/\\n/g)?.length || 0;
    const actualNewlines = code.match(/\n/g)?.length || 0;
    if (escapedNewlines < 4 || escapedNewlines <= actualNewlines * 2) {
        return code;
    }

    return code
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\(["'])/g, "$1");
};

const extractJson = async (text) => {
    if (!text) {
        return null
    }

    const cleaned = text.trim()
        .replace(/^```(?:json|html)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    for (let start = cleaned.indexOf("{"); start !== -1; start = cleaned.indexOf("{", start + 1)) {
        let depth = 0;
        let inString = false;
        let escaped = false;

        for (let index = start; index < cleaned.length; index++) {
            const character = cleaned[index];

            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (character === "\\") {
                    escaped = true;
                } else if (character === '"') {
                    inString = false;
                }
                continue;
            }

            if (character === '"') {
                inString = true;
            } else if (character === "{") {
                depth++;
            } else if (character === "}" && --depth === 0) {
                try {
                    const parsed = JSON.parse(cleaned.slice(start, index + 1));
                    if (typeof parsed.code === "string" && parsed.code.trim()) {
                        return { ...parsed, code: normalizeGeneratedCode(parsed.code) };
                    }
                } catch {
                    break;
                }
                break;
            }
        }
    }

    const htmlStart = cleaned.search(/<!doctype\s+html|<html[\s>]/i);
    if (htmlStart !== -1) {
        return {
            message: "Your website is ready.",
            code: normalizeGeneratedCode(cleaned.slice(htmlStart).trim())
        }
    }

    return null;

}
export default extractJson
