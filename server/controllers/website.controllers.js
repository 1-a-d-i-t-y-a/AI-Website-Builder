import mongoose from "mongoose";
import { executePrompt, AVAILABLE_MODELS } from "../config/aiDispatcher.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson, { normalizeGeneratedCode } from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;


export const generateWebsite = async (req, res) => {
    try {
        const { prompt, model, style, instructions } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 50) {
            return res.status(400).json({ message: "you have not enough credits to generate a website" })
        }

        let fullPromptRequirement = prompt
        if (style && style !== "Default") {
            fullPromptRequirement += `\n\nDESIGN THEME & AESTHETIC:\nAdhere strictly to the '${style}' visual design aesthetic with tailored color palette, modern typography, card styling, and interactive micro-animations.`
        }
        if (instructions && instructions.trim()) {
            fullPromptRequirement += `\n\nUSER SPECIFIC DIRECTIVES & COMMANDS:\n${instructions}`
        }

        const selectedModel = model || "gemini-3.8-flash"
        const finalPrompt = masterPrompt.replace("USER_PROMPT", fullPromptRequirement)
        let raw = ""
        let parsed = null
        raw = await executePrompt(finalPrompt, selectedModel)
        parsed = await extractJson(raw)

        if (!parsed) {
            raw = await executePrompt(finalPrompt + "\n\nRETURN ONLY RAW JSON.", selectedModel)
            parsed = await extractJson(raw)
        }

        if (!parsed || typeof parsed.code !== "string" || !parsed.code.trim()) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: parsed.code,
            aiModel: selectedModel,
            style: style || "Modern",
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "ai",
                    content: parsed.message || "Your website is ready."
                }
            ]
        })

        user.credits = user.credits - 50
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits,
            aiModel: selectedModel
        })

    } catch (error) {
        if (/overloaded|rate.?limit|temporarily rate-limited|timed out|\b429\b|\b503\b/i.test(error.message || "")) {
            console.error("AI providers are unavailable:", error.message)
            const providerIssues = []
            const geminiStatus = error.message.match(/Gemini \([^)]*\) overloaded \((429|503)\)/i)
            if (geminiStatus) {
                providerIssues.push(`Gemini is overloaded (HTTP ${geminiStatus[1]})`)
            } else if (/Gemini request timed out/i.test(error.message)) {
                providerIssues.push("Gemini request timed out")
            }

            if (/Cloudflare Workers AI error \(429\)|rate.?limit/i.test(error.message)) {
                providerIssues.push("Cloudflare Workers AI is rate-limited")
            } else if (/timed out|operation was aborted due to timeout/i.test(error.message)) {
                providerIssues.push("AI provider request timed out")
            }

            return res.status(503).json({
                message: providerIssues.length
                    ? `${providerIssues.join("; ")}. The API key can be valid while provider capacity is unavailable. Retry later.`
                    : "An AI provider is temporarily unavailable. Check the server terminal for the provider error, then retry."
            })
        }
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        const normalizedCode = normalizeGeneratedCode(website.latestCode)
        if (normalizedCode !== website.latestCode) {
            website.latestCode = normalizedCode
            await website.save()
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt, model } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const selectedModel = model || (AVAILABLE_MODELS.some((availableModel) => availableModel.id === website.aiModel)
            ? website.aiModel
            : "gemini-3.8-flash")
        if (!AVAILABLE_MODELS.some((availableModel) => availableModel.id === selectedModel)) {
            return res.status(400).json({ message: "That AI model is no longer available. Select another model and retry." })
        }

        const conversationContext = website.conversation
            .slice(-10)
            .map(({ role, content }) => `${role === "user" ? "User" : "Assistant"}: ${content}`)
            .join("\n")

        const updatePrompt = `
UPDATE THIS HTML WEBSITE.

    UPDATE REQUIREMENTS:
    - Treat the USER REQUEST below as the change to implement in this response. Do not ignore it or substitute a different improvement.
    - Make the requested change in the HTML, CSS, or JavaScript as appropriate; do not only describe the change.
    - Preserve existing content and behavior unless the request asks to change or remove it.
    - Return the complete updated HTML document, not a partial patch.

RECENT CHAT CONTEXT:
${conversationContext || "No earlier messages."}

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await executePrompt(updatePrompt, selectedModel)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await executePrompt(updatePrompt + "\n\nRETURN ONLY RAW JSON.", selectedModel)
                parsed = await extractJson(raw)
            }
        }

        if (!parsed || typeof parsed.code !== "string" || !parsed.code.trim()) {
            console.log("ai returned invalid response", raw)
            return res.status(502).json({ message: "The AI returned an invalid website update. Please try again." })
        }

        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message },
        )

        website.latestCode = parsed.code
        if (model) {
            website.aiModel = model
        }

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message: parsed.message,
            code: parsed.code,
            remainingCredits: user.credits,
            aiModel: website.aiModel
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `update website error ${error}` })
    }
}

export const getModels = async (req, res) => {
    try {
        return res.status(200).json(AVAILABLE_MODELS)
    } catch (error) {
        return res.status(500).json({ message: `get models error ${error}` })
    }
}




export const getAll = async (req, res) => {
    try {
        const websites = await Website.find({ user: req.user._id })
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!website) {
            return res.status(400).json({ message: "website not found" });
        }

        if (!website.slug) {
            website.slug = website.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60) + website._id.toString().slice(-5);
        }

        const originHeader = req.get("origin") || (req.get("referer") ? new URL(req.get("referer")).origin : null);
        const frontendBase = originHeader || process.env.FRONTEND_URL || "http://localhost:5174";
        const localUrl = `${frontendBase}/site/${website.slug}`;

        const requestedTarget = (req.query.target || req.body?.target || "vercel").toLowerCase();
        const vercelToken = process.env.VERCEL_TOKEN;

        if (requestedTarget === "local") {
            website.deployUrl = localUrl;
            website.deployed = true;
            await website.save();
            return res.status(200).json({
                url: localUrl,
                vercelUrl: null,
                localUrl,
                slug: website.slug,
                target: "local",
                message: "Local preview deployment ready"
            });
        }

        // Vercel deployment requested
        if (!vercelToken) {
            return res.status(400).json({
                message: "Vercel Access Token (VERCEL_TOKEN) is not configured in server/.env. Please configure it or use Local Preview."
            });
        }

        try {
            const sanitizedName = `sitea-${website.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 52);
            const response = await fetch("https://api.vercel.com/v13/deployments", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${vercelToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: sanitizedName,
                    target: "production",
                    files: [
                        {
                            file: "index.html",
                            data: website.latestCode
                        }
                    ],
                    projectSettings: {
                        framework: null
                    }
                })
            });

            const data = await response.json();

            if (response.ok && data.url) {
                // Determine best public URL (prefer production alias if present)
                const publicDomain = (data.alias && data.alias.length > 0) ? data.alias[0] : data.url;
                const liveVercelUrl = `https://${publicDomain}`;
                website.deployUrl = liveVercelUrl;
                website.deployed = true;
                await website.save();

                // Automatically disable Vercel Authentication / SSO Protection so visitors never have to log in to Vercel
                try {
                    const projectIdOrName = data.projectId || sanitizedName;
                    await fetch(`https://api.vercel.com/v9/projects/${projectIdOrName}`, {
                        method: "PATCH",
                        headers: {
                            "Authorization": `Bearer ${vercelToken}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ssoProtection: null,
                            passwordProtection: null
                        })
                    });
                    console.log("[server] Disabled Vercel Authentication / SSO Protection for:", projectIdOrName);
                } catch (patchErr) {
                    console.warn("[server] Could not toggle project ssoProtection:", patchErr.message);
                }

                console.log("[server] Deployed to Vercel successfully:", liveVercelUrl);

                return res.status(200).json({
                    url: liveVercelUrl,
                    vercelUrl: liveVercelUrl,
                    localUrl,
                    slug: website.slug,
                    target: "vercel",
                    message: "Successfully deployed live to Vercel!"
                });
            } else {
                console.error("[server] Vercel API error:", data);
                const errMsg = data.error?.message || "Vercel API failed to create deployment";
                return res.status(502).json({
                    message: `Vercel deployment failed: ${errMsg}`,
                    details: data
                });
            }
        } catch (vercelError) {
            console.error("[server] Network/fetch error during Vercel deployment:", vercelError);
            return res.status(500).json({
                message: `Failed to connect to Vercel API: ${vercelError.message}`
            });
        }

    } catch (error) {
        console.error("[server] Deploy error:", error);
        return res.status(500).json({ message: `deploy website error: ${error.message}` });
    }
};


export const getBySlug = async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
        const website = await Website.findOne(
            isObjectId
                ? { $or: [{ slug: req.params.slug }, { _id: req.params.slug }] }
                : { slug: req.params.slug }
        );

        if (!website) {
            return res.status(404).json({ message: "website not found" });
        }
        return res.status(200).json(website);
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` });
    }
};

export const deleteWebsite = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!website) {
            return res.status(404).json({ message: "Website not found or unauthorized" });
        }

        // Clean up Vercel project if one was created
        const vercelToken = process.env.VERCEL_TOKEN;
        if (vercelToken && website.slug) {
            try {
                const projectName = `sitea-${website.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 52);
                await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${vercelToken}`
                    }
                });
                console.log("[server] Deleted associated Vercel project:", projectName);
            } catch (vErr) {
                console.warn("[server] Could not delete Vercel project:", vErr.message);
            }
        }

        await Website.findByIdAndDelete(website._id);

        return res.status(200).json({
            message: "Website deleted successfully",
            deletedId: website._id
        });
    } catch (error) {
        console.error("[server] Delete website error:", error);
        return res.status(500).json({ message: `Delete website error: ${error.message}` });
    }
};

