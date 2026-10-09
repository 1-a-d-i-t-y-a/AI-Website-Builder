import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Code, Code2, Copy, Cpu, ExternalLink, Globe, MessageCircle, MessageSquare, Monitor, Rocket, Send, Trash2, X } from 'lucide-react'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const VercelIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg viewBox="0 0 76 65" fill="currentColor" className={className}>
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
);

import Editor from '@monaco-editor/react';
function WebsiteEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [website, setWebsite] = useState(null)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    const iframeRef = useRef(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [thinkingIndex, setThinkingIndex] = useState(0)
    const [showCode, setShowCode] = useState(false)
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [deployLoading, setDeployLoading] = useState(false)
    const [deployError, setDeployError] = useState("")
    const [showDeployMenu, setShowDeployMenu] = useState(false)
    const [deploySuccessModal, setDeploySuccessModal] = useState(null)
    const [copiedUrl, setCopiedUrl] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [activeModel, setActiveModel] = useState("gemini-3.8-flash")
    const [chatError, setChatError] = useState("")
    const defaultModelId = "gemini-3.8-flash"
    const supportedModelIds = [defaultModelId, "cloudflare/qwen2.5-coder-32b-instruct"]
    const thinkingSteps = [
        "Understanding your request…",
        "Planning layout changes…",
        "Improving responsiveness…",
        "Applying animations…",
        "Finalizing update…",
    ]
    const handleUpdate = async () => {
        if (!prompt.trim() || updateLoading) return
        setUpdateLoading(true)
        setChatError("")
        const text = prompt
        setPrompt("")
        setMessages((m) => [...m, { role: "user", content: prompt }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: text, model: activeModel }, { withCredentials: true })
            console.log(result)
            setUpdateLoading(false)
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
            setActiveModel(supportedModelIds.includes(result.data.aiModel) ? result.data.aiModel : defaultModelId)
        } catch (error) {
            setUpdateLoading(false)
            setChatError(error.response?.data?.message || "The AI update failed. Please try again.")
            console.log(error)
        }
    }

    const getLiveUrl = (site) => {
        if (!site) return ""
        if (site.deployUrl && (site.deployUrl.startsWith("http://") || site.deployUrl.startsWith("https://"))) {
            return site.deployUrl
        }
        if (site.slug) return `${window.location.origin}/site/${site.slug}`
        return `${window.location.origin}/site/${site._id}`
    }

    const handleDeploy = async (target = "vercel") => {
        setDeployLoading(true)
        setDeployError("")
        setShowDeployMenu(false)
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${website._id}?target=${target}`, { withCredentials: true })
            const liveUrl = result.data.url || (result.data.slug ? `${window.location.origin}/site/${result.data.slug}` : `${window.location.origin}/site/${website._id}`)
            
            setWebsite(prev => ({ 
                ...prev, 
                deployed: true, 
                deployUrl: liveUrl, 
                slug: result.data.slug || prev.slug 
            }))

            setDeploySuccessModal({
                target: result.data.target || target,
                url: liveUrl,
                vercelUrl: result.data.vercelUrl,
                localUrl: result.data.localUrl || `${window.location.origin}/site/${result.data.slug || website._id}`
            })

            const newTab = window.open(liveUrl, "_blank")
            if (!newTab) {
                // Popup blocked — modal will allow clicking through
            }
        } catch (error) {
            console.error(error)
            setDeployError(error?.response?.data?.message || "Deployment failed. Please check your Vercel Token.")
        } finally {
            setDeployLoading(false)
        }
    }

    const handleDeleteWebsite = async () => {
        if (!website) return
        setDeleteLoading(true)
        try {
            await axios.delete(`${serverUrl}/api/website/delete/${website._id}`, { withCredentials: true })
            navigate("/dashboard")
        } catch (err) {
            console.error("Delete website error:", err)
            alert(err?.response?.data?.message || "Failed to delete website.")
            setDeleteLoading(false)
        }
    }


    useEffect(() => {
        if (!updateLoading) return;
        const i = setInterval(() => {
            setThinkingIndex((i) => (i + 1) % thinkingSteps.length)
        }, 1200)

        return () => clearInterval(i)
    }, [updateLoading])

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`, { withCredentials: true })
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation)
                setActiveModel(supportedModelIds.includes(result.data.aiModel) ? result.data.aiModel : defaultModelId)
            } catch (error) {
                console.log(error)
                setError(error?.response?.data?.message || error.message || "Failed to load website")
            }
        }
        handleGetWebsite()
    }, [id])


    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const blob = new Blob([code], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url
        return () => URL.revokeObjectURL(url)
    }, [code])

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>
                {error}
            </div>
        )
    }
    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>
                Loading...
            </div>
        )
    }



    return (
        <div className='h-screen w-screen flex bg-black text-white overflow-hidden'>
            <aside className='hidden lg:flex w-95 flex-col border-r border-white/10 bg-black/80'>
                <Header />
                <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {chatError && <p role="alert" className='text-sm text-red-400'>{chatError}</p>}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-white/10 space-y-2'>
                        <div className='flex items-center justify-between px-1 text-xs'>
                            <span className='text-zinc-400 font-medium flex items-center gap-1.5'>
                                <Cpu size={12} className='text-violet-400' /> AI Model:
                            </span>
                            <select
                                value={activeModel}
                                onChange={(e) => setActiveModel(e.target.value)}
                                className='bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 outline-none cursor-pointer hover:bg-white/10'
                            >
                                <option value="gemini-3.8-flash" className="bg-[#111]">Gemini 3.8 Flash</option>
                                <option value="llama3-70b-8192" className="bg-[#111]">Llama 3 70B (Groq)</option>
                                <option value="meta-llama/llama-3-8b-instruct:free" className="bg-[#111]">Llama 3 8B (OpenRouter)</option>
                                <option value="cloudflare/qwen2.5-coder-32b-instruct" className="bg-[#111]">Qwen2.5 Coder 32B (Cloudflare)</option>
                            </select>
                        </div>
                        <div className='flex gap-2'>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none' onChange={(e) => setPrompt(e.target.value)} value={prompt} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdate() } }} />
                            <button aria-label="Send message" className='px-4 py-3 rounded-2xl bg-white text-black cursor-pointer hover:bg-zinc-200 transition disabled:opacity-50' disabled={updateLoading || !prompt.trim()} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
            </aside>

            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                    <span className='text-xs text-zinc-400'>Live Preview</span>
                    <div className='flex items-center gap-2'>
                        {deployError && <span className='text-xs text-red-400 max-w-[200px] truncate' title={deployError}>{deployError}</span>}
                        
                        {!website.deployed ? (
                            <div className="relative">
                                <div className="flex items-center shadow-lg rounded-lg overflow-hidden border border-white/20">
                                    <button
                                        onClick={() => handleDeploy("vercel")}
                                        disabled={deployLoading}
                                        className="flex items-center gap-2 px-3.5 py-1.5 bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <VercelIcon className="w-3 h-3 text-black" />
                                        <span>{deployLoading ? "Deploying..." : "Deploy to Vercel"}</span>
                                    </button>
                                    <button
                                        onClick={() => setShowDeployMenu(prev => !prev)}
                                        disabled={deployLoading}
                                        className="px-2 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-black border-l border-black/10 text-xs transition cursor-pointer"
                                        title="Deployment Target Options"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>

                                {showDeployMenu && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121217] border border-white/10 shadow-2xl p-2 z-50 text-left">
                                        <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                            Choose Deployment Target
                                        </div>
                                        <button
                                            onClick={() => handleDeploy("vercel")}
                                            className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/10 transition text-left cursor-pointer group"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-md bg-white/10 text-white group-hover:bg-white group-hover:text-black transition">
                                                <VercelIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-white flex items-center gap-1.5">
                                                    Deploy to Vercel
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CDN</span>
                                                </div>
                                                <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Instant live .vercel.app domain</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDeploy("local")}
                                            className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/10 transition text-left cursor-pointer group mt-1"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-md bg-white/10 text-zinc-300 group-hover:bg-blue-500 group-hover:text-white transition">
                                                <Globe size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-zinc-200">Local Preview Route</div>
                                                <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Serve in-app via /site/:slug</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {website.deployUrl?.includes("vercel.app") ? (
                                    <a
                                        href={website.deployUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition group shadow-sm"
                                    >
                                        <VercelIcon className="w-3 h-3 text-emerald-400" />
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                            Live on Vercel
                                        </span>
                                        <ExternalLink size={12} className="text-emerald-400 group-hover:translate-x-0.5 transition" />
                                    </a>
                                ) : (
                                    <a
                                        href={getLiveUrl(website)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-semibold hover:bg-blue-500/25 transition"
                                    >
                                        <Globe size={14} />
                                        <span>Local Site</span>
                                        <ExternalLink size={12} />
                                    </a>
                                )}

                                <div className="relative">
                                    <button
                                        onClick={() => setShowDeployMenu(prev => !prev)}
                                        disabled={deployLoading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:border-white/30 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <Rocket size={13} />
                                        <span>{deployLoading ? "Deploying..." : "Redeploy / Options"}</span>
                                        <ChevronDown size={12} />
                                    </button>

                                    {showDeployMenu && (
                                        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121217] border border-white/10 shadow-2xl p-2 z-50 text-left">
                                            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                Deployment Actions
                                            </div>
                                            <button
                                                onClick={() => handleDeploy("vercel")}
                                                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/10 transition text-left cursor-pointer group"
                                            >
                                                <div className="mt-0.5 p-1.5 rounded-md bg-white/10 text-white group-hover:bg-white group-hover:text-black transition">
                                                    <VercelIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-white">Redeploy to Vercel</div>
                                                    <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Push latest code to Vercel CDN</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleDeploy("local")}
                                                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/10 transition text-left cursor-pointer group mt-1"
                                            >
                                                <div className="mt-0.5 p-1.5 rounded-md bg-white/10 text-zinc-300 group-hover:bg-blue-500 group-hover:text-white transition">
                                                    <Globe size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-zinc-200">Switch to Local Preview</div>
                                                    <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Serve via internal /site/:slug</div>
                                                </div>
                                            </button>
                                            <div className="my-1.5 border-t border-white/10"></div>
                                            <button
                                                onClick={() => {
                                                    const targetUrl = website.deployUrl?.includes("vercel.app") ? website.deployUrl : getLiveUrl(website);
                                                    navigator.clipboard.writeText(targetUrl);
                                                    setCopiedUrl(true);
                                                    setTimeout(() => setCopiedUrl(false), 2000);
                                                    setShowDeployMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition text-xs text-zinc-300 cursor-pointer"
                                            >
                                                {copiedUrl ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                <span>{copiedUrl ? "URL Copied!" : "Copy Active Live URL"}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                       
                        <button className='p-2 lg:hidden' onClick={() => setShowChat(true)}><MessageSquare size={18} /></button>

                        <button className='p-2' onClick={() => setShowCode(true)} title="View Code"><Code2 size={18} /></button>
                        <button className='p-2' onClick={() => setShowFullPreview(true)} title="Full Preview"><Monitor size={18} /></button>
                        <button 
                            className='p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer' 
                            onClick={() => setShowDeleteModal(true)} 
                            title="Delete Website"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                </div>

                <iframe ref={iframeRef} sandbox='allow-scripts allow-forms' className='flex-1 w-full bg-white' />
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col"
                    >
                    <Header onclose={()=>setShowChat(false)}/>
                   <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {chatError && <p role="alert" className='text-sm text-red-400'>{chatError}</p>}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-white/10 space-y-2'>
                        <div className='flex items-center justify-between px-1 text-xs'>
                            <span className='text-zinc-400 font-medium flex items-center gap-1.5'>
                                <Cpu size={12} className='text-violet-400' /> AI Model:
                            </span>
                            <select
                                value={activeModel}
                                onChange={(e) => setActiveModel(e.target.value)}
                                className='bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 outline-none cursor-pointer'
                            >
                                <option value="gemini-3.8-flash" className="bg-[#111]">Gemini 3.8 Flash</option>
                                <option value="llama3-70b-8192" className="bg-[#111]">Llama 3 70B (Groq)</option>
                                <option value="meta-llama/llama-3-8b-instruct:free" className="bg-[#111]">Llama 3 8B (OpenRouter)</option>
                                <option value="cloudflare/qwen2.5-coder-32b-instruct" className="bg-[#111]">Qwen2.5 Coder 32B (Cloudflare)</option>
                            </select>
                        </div>
                        <div className='flex gap-2'>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none' onChange={(e) => setPrompt(e.target.value)} value={prompt} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdate() } }} />
                            <button aria-label="Send message" className='px-4 py-3 rounded-2xl bg-white text-black cursor-pointer hover:bg-zinc-200 transition disabled:opacity-50' disabled={updateLoading || !prompt.trim()} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] bg-[#1e1e1e] flex flex-col"
                    >
                        <div className='h-12 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                            <span className='text-sm font-medium'>index.html</span>
                            <button onClick={() => setShowCode(false)}><X size={18} /></button>
                        </div>
                        <Editor
                            theme='vs-dark'
                            value={code}
                            language='html'
                            onChange={(v) => setCode(v)}
                        />

                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black"
                    >
                        <iframe className='w-full h-full bg-white' srcDoc={code} sandbox='allow-scripts allow-forms'/>
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {deploySuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                        onClick={() => setDeploySuccessModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg rounded-2xl bg-[#0f0f14] border border-white/15 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative"
                        >
                            <button
                                onClick={() => setDeploySuccessModal(null)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    {deploySuccessModal.target === "vercel" ? <VercelIcon className="w-5 h-5 text-white" /> : <Globe size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {deploySuccessModal.target === "vercel" ? "Deployed to Vercel!" : "Deployed Locally!"}
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        {deploySuccessModal.target === "vercel"
                                            ? "Your website is live across Vercel's global CDN edge network."
                                            : "Your website is accessible via the local preview route."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                                        {deploySuccessModal.target === "vercel" ? "Live Vercel Production URL" : "Local Preview URL"}
                                    </label>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10">
                                        <span className="flex-1 text-xs text-emerald-400 font-mono truncate">
                                            {deploySuccessModal.url}
                                        </span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(deploySuccessModal.url);
                                                setCopiedUrl(true);
                                                setTimeout(() => setCopiedUrl(false), 2000);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                            <span>{copiedUrl ? "Copied" : "Copy"}</span>
                                        </button>
                                    </div>
                                </div>

                                {deploySuccessModal.target === "vercel" && deploySuccessModal.localUrl && (
                                    <div>
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                                            Internal Preview Backup
                                        </label>
                                        <a
                                            href={deploySuccessModal.localUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-zinc-400 hover:text-zinc-200 underline font-mono truncate block"
                                        >
                                            {deploySuccessModal.localUrl}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeploySuccessModal(null)}
                                    className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                                >
                                    Close
                                </button>
                                <a
                                    href={deploySuccessModal.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold hover:opacity-95 transition shadow-lg cursor-pointer"
                                >
                                    <span>Open Live Website</span>
                                    <ExternalLink size={13} />
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                        onClick={() => !deleteLoading && setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl bg-[#121217] border border-white/15 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative text-left"
                        >
                            <button
                                onClick={() => !deleteLoading && setShowDeleteModal(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition cursor-pointer"
                                disabled={deleteLoading}
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3.5 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Website</h3>
                                    <p className="text-xs text-zinc-400">This action is permanent and cannot be undone.</p>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-5">
                                <p className="text-xs text-zinc-400 mb-1">Website Name</p>
                                <p className="text-sm font-semibold text-white truncate">{website?.title || "Website"}</p>
                                {website?.deployUrl && (
                                    <p className="text-[11px] text-zinc-500 truncate font-mono mt-1">
                                        {website.deployUrl}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteWebsite}
                                    disabled={deleteLoading}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/20"
                                >
                                    <Trash2 size={13} />
                                    <span>{deleteLoading ? "Deleting..." : "Delete Website"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )

    function Header({onclose}) {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/10'>
                <span className='font-semibold truncate'>{website?.title || "Website"}</span>
                {onclose &&  <button onClick={onclose}><X size={18} color='white'/></button>}
           
            </div>
        )
    }



}





export default WebsiteEditor
