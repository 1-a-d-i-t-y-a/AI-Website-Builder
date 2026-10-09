import { ArrowLeft, Check, Cpu, Palette, Sparkles, Wand2, Zap, SlidersHorizontal } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "motion/react"
import axios from "axios"
import { serverUrl } from '../App'

const MODELS = [
    {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash",
        badge: "Recommended",
        color: "from-blue-500/20 to-violet-500/20",
        border: "border-blue-500/40",
        iconColor: "text-blue-400",
        desc: "Google's fast, high-quality AI model for website generation."
    },
    {
        id: "llama3-70b-8192",
        name: "Llama 3 70B",
        badge: "Ultra Fast",
        color: "from-orange-500/20 to-red-500/20",
        border: "border-orange-500/40",
        iconColor: "text-orange-400",
        desc: "Blistering fast model powered by Groq LPUs."
    },
    {
        id: "meta-llama/llama-3-8b-instruct:free",
        name: "Llama 3 8B",
        badge: "Free API",
        color: "from-pink-500/20 to-rose-500/20",
        border: "border-pink-500/40",
        iconColor: "text-pink-400",
        desc: "Completely free open-source model via OpenRouter."
    },
    {
        id: "cloudflare/qwen2.5-coder-32b-instruct",
        name: "Qwen2.5 Coder 32B",
        badge: "Cloudflare",
        color: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/40",
        iconColor: "text-emerald-400",
        desc: "Code-focused model hosted by Cloudflare Workers AI."
    },
];

const STYLE_PRESETS = [
    { name: "Dark Glassmorphism SaaS", promptSuffix: "Sleek dark mode theme with glassmorphism cards, glowing purple/violet gradients, and smooth hover effects." },
    { name: "E-Commerce & Store", promptSuffix: "Clean modern storefront with product grid, price tags, interactive shopping cart drawer, and checkout modal." },
    { name: "Minimalist Studio / Portfolio", promptSuffix: "Sophisticated editorial typography, generous white space, curated image galleries, and smooth scroll navigation." },
    { name: "High-Growth Startup", promptSuffix: "Vibrant high-converting landing page with hero CTA, interactive feature tabs, testimonial carousel, and FAQ accordion." },
    { name: "Modern Agency", promptSuffix: "Bold typographic hierarchy, dark background, stat counter badges, client logos, and interactive contact form." }
];

const PHASES = [
    "Analyzing your idea…",
    "Selecting design tokens & layout…",
    "Writing HTML structure…",
    "Applying responsive CSS system…",
    "Adding JavaScript interactions & animations…",
    "Finalizing production output…",
];

function Generate() {
    const navigate = useNavigate()
    const [prompt, setPrompt] = useState("")
    const [selectedModel, setSelectedModel] = useState("gemini-3.8-flash")
    const [selectedStyle, setSelectedStyle] = useState("Dark Glassmorphism SaaS")
    const [customCommands, setCustomCommands] = useState("")
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [error, setError] = useState("")

    const handleGenerateWebsite = async () => {
        if (!prompt.trim() || loading) return
        setLoading(true)
        setError("")
        try {
            const result = await axios.post(`${serverUrl}/api/website/generate`, {
                prompt,
                model: selectedModel,
                style: selectedStyle,
                instructions: customCommands
            }, { withCredentials: true })
            
            setProgress(100)
            setLoading(false)
            navigate(`/editor/${result.data.websiteId}`)
        } catch (err) {
            setLoading(false)
            setError(err.response?.data?.message || "Failed to generate website. Please try again.")
            console.error("Generate error:", err)
        }
    }

    useEffect(() => {
        if (!loading) {
            setPhaseIndex(0)
            setProgress(0)
            return
        }

        let value = 0
        const interval = setInterval(() => {
            const increment = value < 25
                ? Math.random() * 2.5
                : value < 70
                    ? Math.random() * 1.8
                    : Math.random() * 0.8;
            value += increment

            if (value >= 94) value = 94;

            const nextPhase = Math.min(
                Math.floor((value / 100) * PHASES.length),
                PHASES.length - 1
            )

            setProgress(Math.floor(value))
            setPhaseIndex(nextPhase)
        }, 900)

        return () => clearInterval(interval)
    }, [loading])

    return (
        <div className='min-h-screen bg-[#050508] text-white selection:bg-violet-500 selection:text-white'>
            {/* Ambient Backlight */}
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25)_0%,rgba(59,130,246,0.1)_40%,transparent_70%)] pointer-events-none' />

            {/* Navigation */}
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button
                            className='p-2 rounded-lg hover:bg-white/10 transition cursor-pointer'
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className='text-lg font-semibold flex items-center gap-2'>
                            <Sparkles size={16} className='text-violet-400' /> Sitea AI Studio
                        </h1>
                    </div>
                </div>
            </div>

            <div className='relative max-w-5xl mx-auto px-6 py-12 z-10'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-3'>
                        <Sparkles size={12} /> Powered by Next-Gen AI
                    </span>
                    <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-3'>
                        Choose Your AI Model & Style
                    </h1>
                    <p className='text-zinc-400 text-sm md:text-base max-w-xl mx-auto'>
                        Pick the LLM engine, choose an aesthetic theme, and instruct the AI on exactly how to craft your website.
                    </p>
                </motion.div>

                {/* Step 1: Select AI Model */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between mb-3'>
                        <label className='text-sm font-semibold flex items-center gap-2 text-zinc-200'>
                            <Cpu size={16} className='text-violet-400' />
                            1. Select AI Engine
                        </label>
                        <span className='text-xs text-zinc-400'>
                            Active: <strong className='text-white'>{MODELS.find(m => m.id === selectedModel)?.name}</strong>
                        </span>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                        {MODELS.map((model) => {
                            const isSelected = selectedModel === model.id
                            return (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`relative text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                            ? `bg-white/10 ${model.border} shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-white/20`
                                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                                    }`}
                                >
                                    <div>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                isSelected ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-zinc-400'
                                            }`}>
                                                {model.badge}
                                            </span>
                                            {isSelected && (
                                                <div className='w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white'>
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className='font-semibold text-sm text-white mb-1'>{model.name}</h3>
                                        <p className='text-xs text-zinc-400 line-clamp-2 leading-relaxed'>{model.desc}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Step 2: Choose Design Style Preset */}
                <div className='mb-8'>
                    <label className='block text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-200'>
                        <Palette size={16} className='text-violet-400' />
                        2. Design Aesthetic Preset
                    </label>

                    <div className='flex flex-wrap gap-2'>
                        {STYLE_PRESETS.map((preset) => {
                            const isSelected = selectedStyle === preset.name
                            return (
                                <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => setSelectedStyle(preset.name)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                                            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {preset.name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Step 3: Prompt Textarea */}
                <div className='mb-6'>
                    <label className='block text-sm font-semibold mb-2 text-zinc-200'>
                        3. Describe What You Want to Build
                    </label>
                    <div className='relative'>
                        <textarea
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                            placeholder="E.g., Build a modern SaaS website for an AI video editing tool with an interactive pricing calculator, hero video mockup, and user reviews..."
                            className='w-full h-44 p-5 rounded-2xl bg-black/60 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition'
                        />
                    </div>
                </div>

                {/* Step 4: Optional Custom Instructions / Directives */}
                <div className='mb-8'>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className='text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer mb-2'
                    >
                        <SlidersHorizontal size={13} />
                        {showAdvanced ? "Hide Custom Directives" : "+ Add Specific Build Commands & Requirements (Optional)"}
                    </button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className='overflow-hidden'
                            >
                                <input
                                    type="text"
                                    value={customCommands}
                                    onChange={(e) => setCustomCommands(e.target.value)}
                                    placeholder="E.g., Include monthly/yearly billing toggle, FAQ accordion, floating WhatsApp button..."
                                    className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 outline-none focus:border-violet-500/40 transition'
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <p className='mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400'>
                            {error}
                        </p>
                    )}
                </div>

                {/* Generate Button */}
                <div className='flex justify-center'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateWebsite}
                        disabled={!prompt.trim() || loading}
                        className={`flex items-center gap-2.5 px-10 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                            prompt.trim() && !loading
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                                : "bg-white/10 text-zinc-500 cursor-not-allowed"
                        }`}
                    >
                        <Wand2 size={16} />
                        {loading ? "Generating Site with AI…" : "Generate Website"}
                    </motion.button>
                </div>

                {/* Progress Indicator */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/10"
                    >
                        <div className='flex justify-between items-center mb-2.5 text-xs text-zinc-400'>
                            <span className='flex items-center gap-2 font-medium text-white'>
                                <span className='w-2 h-2 rounded-full bg-violet-400 animate-pulse' />
                                {progress >= 94 ? "Waiting for AI response…" : PHASES[phaseIndex]}
                            </span>
                            <span className='font-mono text-violet-300'>{progress}%</span>
                        </div>

                        <div className='h-2 w-full bg-white/10 rounded-full overflow-hidden'>
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "easeOut", duration: 0.6 }}
                            />
                        </div>

                        <div className='text-center text-xs text-zinc-500 mt-3'>
                            Engine: <span className='text-zinc-300 font-medium'>{MODELS.find(m => m.id === selectedModel)?.name}</span> • High-fidelity responsive system
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Generate
