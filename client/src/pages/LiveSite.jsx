import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import axios from 'axios'
import { ArrowLeft, Rocket } from 'lucide-react'

function LiveSite() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [html, setHtml] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const handleGetWebsite = async () => {
            setLoading(true)
            setError("")
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-slug/${id}`)
                setHtml(result.data.latestCode)
                if (result.data.title) {
                    document.title = result.data.title
                }
            } catch (err) {
                console.error("LiveSite fetch error:", err)
                setError("Website not found or not published yet.")
            } finally {
                setLoading(false)
            }
        }
        handleGetWebsite()
    }, [id])

    if (loading) {
        return (
            <div className='h-screen flex flex-col items-center justify-center bg-[#060713] text-white gap-3'>
                <div className='w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                <p className='text-zinc-400 text-sm'>Loading website preview...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='h-screen flex flex-col items-center justify-center bg-[#060713] text-white gap-4 px-6 text-center'>
                <div className='w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400'>
                    <Rocket size={24} />
                </div>
                <h2 className='text-xl font-semibold'>Site Not Found</h2>
                <p className='text-zinc-400 text-sm max-w-sm'>{error}</p>
                <button
                    onClick={() => navigate("/")}
                    className='mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm transition cursor-pointer'
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>
        )
    }

    return (
        <iframe
            title='Live Site'
            srcDoc={html}
            className='w-screen h-screen border-none'
            sandbox='allow-scripts allow-same-origin allow-forms allow-modals allow-popups'
        />
    )
}

export default LiveSite

