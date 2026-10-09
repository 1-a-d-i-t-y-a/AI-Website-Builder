import React from 'react'
import { ArrowLeft, Code2, Database, Globe, Layers, Server, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

const teamMembers = [
    { name: "Utkarsh", regNo: "23BAI11310", role: "Full Stack Engineer" },
    { name: "Aryan Singh", regNo: "23BAI11304", role: "Full Stack Collaborator" },
    { name: "Samarth Khadiwala", regNo: "23BAI11074", role: "Full Stack Collaborator" },
    { name: "Aditya Soni", regNo: "23BAI11002", role: "Full Stack Collaborator" },
    { name: "Sanjay Vijay Barve", regNo: "23BAI10976", role: "Full Stack Collaborator" },
    { name: "Harish B", regNo: "23BAI10991", role: "Full Stack Collaborator" },
]

const techStack = [
    {
        category: "Frontend",
        icon: Layers,
        color: "from-blue-500/20 to-indigo-500/20",
        border: "border-blue-500/30",
        badge: "text-blue-400 bg-blue-500/10",
        items: ["React.js", "Framer Motion (Animations)", "Tailwind CSS"]
    },
    {
        category: "Backend",
        icon: Server,
        color: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/30",
        badge: "text-emerald-400 bg-emerald-500/10",
        items: ["Node.js", "Express.js"]
    },
    {
        category: "Database & Auth",
        icon: Database,
        color: "from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/30",
        badge: "text-amber-400 bg-amber-500/10",
        items: ["MongoDB", "Firebase (Google OAuth)"]
    },
    {
        category: "Monetization & Deployment",
        icon: Zap,
        color: "from-purple-500/20 to-violet-500/20",
        border: "border-purple-500/30",
        badge: "text-purple-400 bg-purple-500/10",
        items: ["Payment Gateway API Integration", "Automated Live Hosting Serverless Pipelines"]
    }
]

function About() {
    const navigate = useNavigate()

    return (
        <div className='relative min-h-screen bg-[#060713] text-white overflow-hidden selection:bg-violet-500 selection:text-white'>
            {/* Ambient Purple Illumination */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.35)_0%,rgba(99,102,241,0.2)_35%,rgba(6,7,19,0)_75%)]' />
                <div className='absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-purple-500/30 via-violet-600/20 to-transparent blur-[130px] rounded-full' />
            </div>

            {/* Header */}
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-[#060713]/70 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-18 flex items-center justify-between'>
                    <button
                        className='flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer'
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                    <div className='flex items-center gap-2 font-bold text-lg cursor-pointer' onClick={() => navigate("/")}>
                        <div className='w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]'>
                            <Sparkles size={14} className='text-white' />
                        </div>
                        Sitea
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='relative max-w-6xl mx-auto px-6 py-16 z-10'>
                {/* Intro Section */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <span className='inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs tracking-wider uppercase font-semibold mb-4'>
                        About the Project
                    </span>
                    <h1 className='text-4xl md:text-5xl font-bold tracking-tight mb-6'>
                        AI-Powered Website Builder
                    </h1>
                    <div className='max-w-3xl mx-auto text-zinc-300 text-base md:text-lg leading-relaxed space-y-4 text-justify sm:text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl'>
                        <p>
                            Welcome to our <span className='text-white font-semibold'>AI-Powered Website Builder</span>, a full-stack SaaS platform designed to transform natural language prompts into production-ready, interactive websites in seconds. Built on the modern <span className='text-violet-400 font-semibold'>MERN stack</span> (MongoDB, Express.js, React.js, Node.js), this application leverages artificial intelligence to automate web design, complete with dynamic themes, functional shopping carts, and smooth Framer Motion animations.
                        </p>
                        <p className='text-zinc-400'>
                            Equipped with secure Google Authentication via Firebase, an integrated credit billing system, and instant one-click deployment, the platform offers an end-to-end, seamless web creation experience.
                        </p>
                    </div>
                </motion.div>

                {/* Development Team */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-24"
                >
                    <div className='text-center mb-12'>
                        <div className='w-12 h-12 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3'>
                            <Users size={22} />
                        </div>
                        <h2 className='text-2xl md:text-3xl font-bold'>Development Team</h2>
                        <p className='text-zinc-400 text-sm mt-1'>This project was engineered and collaborated on by:</p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {teamMembers.map((member, i) => (
                            <motion.div
                                key={member.regNo}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className='p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.05] transition-all group'
                            >
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600/30 to-purple-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-lg group-hover:scale-105 transition-transform'>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-semibold text-white group-hover:text-violet-300 transition-colors'>
                                            {member.name}
                                        </h3>
                                        <span className='inline-block px-2.5 py-0.5 mt-1 text-xs font-mono rounded-md bg-white/5 border border-white/10 text-zinc-400'>
                                            Reg: {member.regNo}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Key Features & Tech Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='text-center mb-12'>
                        <div className='w-12 h-12 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3'>
                            <Code2 size={22} />
                        </div>
                        <h2 className='text-2xl md:text-3xl font-bold'>Key Features & Tech Stack</h2>
                        <p className='text-zinc-400 text-sm mt-1'>Core technologies powering the application architecture</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {techStack.map((tech, i) => {
                            const Icon = tech.icon
                            return (
                                <motion.div
                                    key={tech.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className='p-7 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all'
                                >
                                    <div className='flex items-center gap-3 mb-5'>
                                        <div className={`p-2.5 rounded-xl border ${tech.border} bg-white/5`}>
                                            <Icon size={20} className='text-violet-400' />
                                        </div>
                                        <h3 className='text-lg font-semibold text-white'>{tech.category}</h3>
                                    </div>
                                    <ul className='space-y-2.5'>
                                        {tech.items.map((item) => (
                                            <li key={item} className='flex items-center gap-2.5 text-sm text-zinc-300'>
                                                <div className='w-1.5 h-1.5 rounded-full bg-violet-400' />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default About
