import { ArrowLeft, Check, ExternalLink, Globe, Rocket, Share2, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'

const VercelIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg viewBox="0 0 76 65" fill="currentColor" className={className}>
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
);

function Dashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [websites, setWebsites] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copiedId, setCopiedId] = useState(null)
    const [deployingId, setDeployingId] = useState(null)
    const [deleteModalWebsite, setDeleteModalWebsite] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const getLiveUrl = (site) => {
        if (!site) return ""
        if (site.deployUrl && (site.deployUrl.startsWith("http://") || site.deployUrl.startsWith("https://"))) {
            return site.deployUrl
        }
        if (site.slug) return `${window.location.origin}/site/${site.slug}`
        return `${window.location.origin}/site/${site._id}`
    }

    const handleDeploy = async (id, target = "vercel") => {
        setDeployingId(id)
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${id}?target=${target}`, { withCredentials: true })
            const liveUrl = result.data.url || (result.data.slug ? `${window.location.origin}/site/${result.data.slug}` : `${window.location.origin}/site/${id}`)
            window.open(liveUrl, "_blank")
            setWebsites((prev) =>
                prev.map((w) =>
                    w._id === id
                        ? { ...w, deployed: true, deployUrl: liveUrl, slug: result.data.slug || w.slug }
                        : w
                )
            );
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || "Deployment failed. Please check your Vercel Token.")
        } finally {
            setDeployingId(null)
        }
    }

    const handleDeleteWebsite = async () => {
        if (!deleteModalWebsite) return
        setDeleteLoading(true)
        try {
            await axios.delete(`${serverUrl}/api/website/delete/${deleteModalWebsite._id}`, { withCredentials: true })
            setWebsites(prev => prev ? prev.filter(w => w._id !== deleteModalWebsite._id) : [])
            setDeleteModalWebsite(null)
        } catch (err) {
            console.error("Delete website error:", err)
            alert(err?.response?.data?.message || "Failed to delete website. Please try again.")
        } finally {
            setDeleteLoading(false)
        }
    }

    useEffect(() => {
        const handleGetAllWebsites = async () => {
            setLoading(true)
            try {

                const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
                setWebsites(result.data || [])
                setLoading(false)
            } catch (error) {
                console.log(error)
                setError(error?.response?.data?.message || error.message || "Failed to load websites")
                setLoading(false)
            }
        }
        handleGetAllWebsites()
    }, [])

    const handleCopy = async (site) => {
        const liveUrl = getLiveUrl(site)
        await navigator.clipboard.writeText(liveUrl)
        setCopiedId(site._id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className='min-h-screen bg-[#050505] text-white'>
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button className='p-2 rounded-lg hover:bg-white/10 transition' onClick={() => navigate("/")}><ArrowLeft size={16} /></button>
                        <h1 className='text-lg font-semibold'>Dashboard</h1>
                    </div>
                    <button className='px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition' onClick={() => navigate("/generate")}>
                        + New Website
                    </button>
                </div>
            </div>
            <div className='max-w-7xl mx-auto px-6 py-10'>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <p className='text-sm text-zinc-400 mb-1'>Welcome Back</p>
                    <h1 className='text-3xl font-bold'>{userData?.name || "Creator"}</h1>
                </motion.div>

                {loading && (
                    <div className="mt-24 text-center text-zinc-400">Loading Your Websites...</div>
                )}

                {error && !loading && (
                    <div className="mt-24 text-center text-red-400">{error}</div>
                )}

                {websites?.length == 0 && (
                    <div className="mt-16 flex flex-col items-center justify-center text-center p-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.02]">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                            <Rocket size={28} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">You don't have any websites yet</h3>
                        <p className="text-zinc-400 text-sm max-w-md mb-6">
                            Describe your vision and our AI will generate a complete, responsive website for you in seconds.
                        </p>
                        <button
                            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold text-white transition shadow-lg shadow-indigo-500/20 cursor-pointer"
                            onClick={() => navigate("/generate")}
                        >
                            + Generate Your First Website
                        </button>
                    </div>
                )}

                {!loading && !error && websites?.length > 0 && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                        {websites.map((w, i) => {

                            const copied = copiedId === w._id

                            return <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -6 }}
                               
                                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col"
                            >
                                <div className='relative h-40 bg-black cursor-pointer group/card' onClick={()=>navigate(`/editor/${w._id}`)}>
                                    <iframe srcDoc={w.latestCode} className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white' />
                                    <div className='absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition' />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteModalWebsite(w);
                                        }}
                                        title="Delete Website"
                                        className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/70 hover:bg-red-600 text-zinc-400 hover:text-white transition backdrop-blur-md z-20 cursor-pointer shadow-lg group/trash"
                                    >
                                        <Trash2 size={14} className="group-hover/trash:scale-110 transition" />
                                    </button>
                                </div>

                                <div className='p-5 flex flex-col gap-4 flex-1'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <h3 className='text-base font-semibold line-clamp-2 flex-1'>{w.title}</h3>
                                        {w.deployed && (
                                            w.deployUrl?.includes("vercel.app") ? (
                                                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">
                                                    <VercelIcon className="w-2.5 h-2.5 text-white" /> Vercel
                                                </span>
                                            ) : (
                                                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                    Local
                                                </span>
                                            )
                                        )}
                                    </div>
                                    <p className='text-xs text-zinc-400'>Last Updated {""}
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>

                                    {!w.deployed ? (
                                        <button className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition cursor-pointer shadow-md disabled:opacity-50"
                                            onClick={() => handleDeploy(w._id, "vercel")}
                                            disabled={deployingId === w._id}
                                        >
                                            <VercelIcon className="w-3.5 h-3.5 text-black" />
                                            {deployingId === w._id ? "Deploying..." : "Deploy to Vercel"}
                                        </button>
                                    ) : (
                                        <div className='mt-auto flex items-center gap-2'>
                                            <a
                                                href={getLiveUrl(w)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                                                    w.deployUrl?.includes("vercel.app")
                                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                                }`}
                                            >
                                                {w.deployUrl?.includes("vercel.app") ? (
                                                    <VercelIcon className="w-3 h-3 text-emerald-400" />
                                                ) : (
                                                    <Rocket size={14} />
                                                )}
                                                <span>View Live</span>
                                            </a>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleCopy(w)}
                                                className={`
                                  px-3 py-2 rounded-xl text-sm font-medium
                                  transition-all flex items-center justify-center gap-1.5 cursor-pointer
                                  ${copied
                                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                        : "bg-white/10 hover:bg-white/20 border border-white/10"
                                                    }
                                `}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={14} />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 size={14} />
                                                        Share
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    )}

                                </div>

                            </motion.div>
                        })}

                    </div>
                )}


            </div>

            <AnimatePresence>
                {deleteModalWebsite && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                        onClick={() => !deleteLoading && setDeleteModalWebsite(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl bg-[#121217] border border-white/15 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative text-left"
                        >
                            <button
                                onClick={() => !deleteLoading && setDeleteModalWebsite(null)}
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
                                <p className="text-sm font-semibold text-white truncate">{deleteModalWebsite.title}</p>
                                {deleteModalWebsite.deployUrl && (
                                    <p className="text-[11px] text-zinc-500 truncate font-mono mt-1">
                                        {deleteModalWebsite.deployUrl}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModalWebsite(null)}
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
}

export default Dashboard
