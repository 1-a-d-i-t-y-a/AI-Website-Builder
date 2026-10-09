import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import LoginModal from '../components/LoginModal'
import { useDispatch, useSelector } from 'react-redux'
import { Coins, Code2, Database, Layers, Server, Users, Zap } from "lucide-react"
import { serverUrl } from '../App'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

const teamMembers = [
    { name: "Utkarsh", regNo: "23BAI11310" },
    { name: "Aryan Singh", regNo: "23BAI11304" },
    { name: "Samarth Khadiwala", regNo: "23BAI11074" },
    { name: "Aditya Soni", regNo: "23BAI11002" },
    { name: "Sanjay Vijay Barve", regNo: "23BAI10976" },
    { name: "Harish B", regNo: "23BAI10991" },
]

const techStack = [
    {
        category: "Frontend",
        icon: Layers,
        items: ["React.js", "Framer Motion (Animations)", "Tailwind CSS"]
    },
    {
        category: "Backend",
        icon: Server,
        items: ["Node.js", "Express.js"]
    },
    {
        category: "Database & Auth",
        icon: Database,
        items: ["MongoDB", "Firebase (Google OAuth)"]
    },
    {
        category: "Monetization & Deployment",
        icon: Zap,
        items: ["Payment Gateway API Integration", "Automated Live Hosting Serverless Pipelines"]
    }
]

function Home() {
    const highlights = [
        "AI Generated Code",
        "Fully Responsive Layouts",
        "Production Ready Output",
    ]

    const [openLogin, setOpenLogin] = useState(false)
    const { userData } = useSelector(state => state.user)
    const [openProfile, setOpenProfile] = useState(false)
    const [websites, setWebsites] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [heroTextIndex, setHeroTextIndex] = useState(0);
    const heroPhrases = ["Websites", "SaaS Platforms", "Portfolios", "Web Apps", "E-Commerce"];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroTextIndex((prev) => (prev + 1) % heroPhrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
            dispatch(setUserData(null))
            setOpenProfile(false)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!userData) return;
        const handleGetAllWebsites = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
                setWebsites(result.data || [])
            } catch (error) {
                console.log(error)
            }
        }
        handleGetAllWebsites()
    }, [userData])

    const scrollToAbout = () => {
        const el = document.getElementById("about");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/about");
        }
    };

    return (
        <div className='relative min-h-screen bg-[#060713] text-white overflow-hidden'>

            {/* Ambient Purple Illumination Matching Reference Screenshot */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                {/* Primary overhead radiant cone */}
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[720px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.38)_0%,rgba(99,102,241,0.22)_35%,rgba(6,7,19,0)_72%)]' />

                {/* Inner bright violet hotspot */}
                <div className='absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-b from-purple-500/35 via-violet-600/25 to-transparent blur-[130px] rounded-full' />

                {/* Left ambient purple glow */}
                <div className='absolute top-16 left-1/4 -translate-x-1/2 w-[550px] h-[450px] bg-purple-700/20 blur-[160px] rounded-full' />

                {/* Right ambient indigo glow */}
                <div className='absolute top-24 right-1/4 translate-x-1/2 w-[550px] h-[450px] bg-indigo-600/18 blur-[160px] rounded-full' />
            </div>

            {/* Navbar */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10'
            >
                <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
                    <div className='text-lg font-semibold cursor-pointer' onClick={() => navigate("/")}>
                        Sitea
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='hidden md:inline text-sm text-zinc-400 hover:text-white cursor-pointer transition' onClick={() => navigate("/pricing")}>
                            Pricing
                        </div>
                        {userData && <div className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition' onClick={() => navigate("/pricing")}>
                            <Coins size={14} className='text-yellow-400' />
                            <span className='text-zinc-300'>Credits</span>
                            <span>{userData.credits}</span>
                            <span className='font-semibold'>+</span>
                        </div>}

                        {/* Top-Right About Button (Replaced Get Started) */}
                        <button
                            className='px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 hover:border-violet-400/50 text-sm cursor-pointer transition'
                            onClick={scrollToAbout}
                        >
                            About
                        </button>

                        {userData && (
                            <div className='relative'>
                                <button className='flex items-center cursor-pointer' onClick={() => setOpenProfile(!openProfile)}>
                                    <img src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData.name}`} alt="" referrerPolicy='no-referrer' className='w-9 h-9 rounded-full border border-white/20 object-cover' />
                                </button>
                                <AnimatePresence>
                                    {openProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-60 z-50 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden"
                                        >
                                            <div className='px-4 py-3 border-b border-white/10'>
                                                <p className='text-sm font-medium truncate'>{userData.name}</p>
                                                <p className='text-xs text-zinc-500 truncate'>{userData.email}</p>
                                            </div>

                                            <button className='md:hidden w-full px-4 py-3 flex items-center gap-2 text-sm border-b border-white/10 hover:bg-white/5'>
                                                <Coins size={14} className='text-yellow-400' />
                                                <span className='text-zinc-300'>Credits</span>
                                                <span>{userData.credits}</span>
                                                <span className='font-semibold'>+</span>
                                            </button>

                                            <button className='w-full px-4 py-3 text-left text-sm hover:bg-white/5 cursor-pointer' onClick={() => navigate("/dashboard")}>Dashboard</button>
                                            <button className='w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 cursor-pointer' onClick={handleLogOut}>Logout</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Hero Section */}
            <section className='pt-44 pb-32 px-6 text-center relative z-10'>
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight flex flex-col items-center justify-center gap-2 md:gap-4"
                >
                    <span>Build</span>
                    <span className="h-[1.2em] w-full relative flex justify-center overflow-hidden text-white">
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={heroTextIndex}
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -60, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute"
                            >
                                {heroPhrases[heroTextIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <span className='bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent'>with AI</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-8 max-w-2xl mx-auto text-zinc-400 text-lg'
                >
                    Describe your idea and let AI generate a modern,
                    responsive, production-ready website.
                </motion.p>

                <button className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition mt-12 cursor-pointer shadow-xl" onClick={() => userData ? navigate("/dashboard") : setOpenLogin(true)}>
                    {userData ? "Go to dashboard" : "Get Started"}
                </button>
            </section>

            {/* Highlights Section */}
            {!userData && <section className='max-w-7xl mx-auto px-6 pb-24 relative z-10'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
                    {highlights.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-violet-500/30 transition"
                        >
                            <h1 className='text-xl font-semibold mb-3'>{h}</h1>
                            <p className='text-sm text-zinc-400'>
                                Sitea builds real websites — clean code,
                                animations, responsiveness and scalable structure.
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>}

            {/* User Existing Websites Section */}
            {userData && websites?.length > 0 && (
                <section className='max-w-7xl mx-auto px-6 pb-24 relative z-10'>
                    <h3 className='text-2xl font-semibold mb-6'>Your Websites</h3>

                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                        {websites.slice(0, 3).map((w) => (
                            <motion.div
                                key={w._id}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(`/editor/${w._id}`)}
                                className="cursor-pointer rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-violet-500/40 transition"
                            >
                                <div className='h-40 bg-black'>
                                    <iframe
                                        srcDoc={w.latestCode}
                                        className='w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white'
                                    />
                                </div>
                                <div className='p-4'>
                                    <h3 className='text-base font-semibold line-clamp-2'>{w.title}</h3>
                                    <p className='text-xs text-zinc-400'>Last Updated {""}
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* About Section on Home Page */}
            <section id="about" className='max-w-6xl mx-auto px-6 py-28 relative z-10 border-t border-white/10'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className='text-center mb-16'
                >
                    <span className='inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs tracking-wider uppercase font-semibold mb-4'>
                        About the Project
                    </span>
                    <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6'>
                        AI-Powered Website Builder
                    </h2>
                    <div className='max-w-3xl mx-auto text-zinc-300 text-base md:text-lg leading-relaxed space-y-4 p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl text-left sm:text-center'>
                        <p>
                            Welcome to our <span className='text-white font-semibold'>AI-Powered Website Builder</span>, a full-stack SaaS platform designed to transform natural language prompts into production-ready, interactive websites in seconds. Built on the modern <span className='text-violet-400 font-semibold'>MERN stack</span> (MongoDB, Express.js, React.js, Node.js), this application leverages artificial intelligence to automate web design, complete with dynamic themes, functional shopping carts, and smooth Framer Motion animations.
                        </p>
                        <p className='text-zinc-400'>
                            Equipped with secure Google Authentication via Firebase, an integrated credit billing system, and instant one-click deployment, the platform offers an end-to-end, seamless web creation experience.
                        </p>
                    </div>
                </motion.div>

                {/* Development Team */}
                <div className='mb-20'>
                    <div className='text-center mb-10'>
                        <div className='w-12 h-12 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3'>
                            <Users size={22} />
                        </div>
                        <h3 className='text-2xl md:text-3xl font-bold'>Development Team</h3>
                        <p className='text-zinc-400 text-sm mt-1'>This project was engineered and collaborated on by:</p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                        {teamMembers.map((member, i) => (
                            <motion.div
                                key={member.regNo}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className='p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.05] transition-all'
                            >
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600/30 to-purple-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-base'>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className='text-base font-semibold text-white'>
                                            {member.name}
                                        </h4>
                                        <span className='inline-block px-2 py-0.5 mt-0.5 text-xs font-mono rounded bg-white/5 border border-white/10 text-zinc-400'>
                                            Reg: {member.regNo}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Key Features & Tech Stack */}
                <div className='max-w-5xl mx-auto'>
                    <div className='text-center mb-10'>
                        <div className='w-12 h-12 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3'>
                            <Code2 size={22} />
                        </div>
                        <h3 className='text-2xl md:text-3xl font-bold'>Key Features & Tech Stack</h3>
                        <p className='text-zinc-400 text-sm mt-1'>Core technologies powering the application architecture</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {techStack.map((tech) => {
                            const Icon = tech.icon
                            return (
                                <div key={tech.category} className='p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition'>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <div className='p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400'>
                                            <Icon size={18} />
                                        </div>
                                        <h4 className='text-base font-semibold text-white'>{tech.category}</h4>
                                    </div>
                                    <ul className='space-y-2'>
                                        {tech.items.map((item) => (
                                            <li key={item} className='flex items-center gap-2 text-sm text-zinc-300'>
                                                <div className='w-1.5 h-1.5 rounded-full bg-violet-400' />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='border-t border-white/10 py-10 text-center text-sm text-zinc-500 relative z-10'>
                <div className='max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div>&copy; {new Date().getFullYear()} Sitea</div>
                    <div className='flex items-center gap-6 text-sm text-zinc-400'>
                        <span className='hover:text-white cursor-pointer transition' onClick={() => navigate("/pricing")}>Pricing</span>
                        <span className='hover:text-white cursor-pointer transition' onClick={scrollToAbout}>About</span>
                        {userData && <span className='hover:text-white cursor-pointer transition' onClick={() => navigate("/dashboard")}>Dashboard</span>}
                    </div>
                </div>
            </footer>

            {openLogin && <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />}
        </div>
    )
}

export default Home
