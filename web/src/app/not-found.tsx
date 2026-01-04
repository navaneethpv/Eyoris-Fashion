"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
            {/* Cinematic Background Gradients with Breathing Animation */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[150px]"
                />
            </div>

            {/* Elegant Floating Orb */}
            <motion.div
                className="absolute top-[20%] right-[20%] w-96 h-96 border-[0.5px] border-white/5 rounded-full"
                animate={{
                    y: [0, -30, 0],
                    rotate: [0, 180, 360],
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.02))" }}
            />

            <div className="relative z-10 flex flex-col items-center text-center px-4">
                {/* 404 Hero Text - Refined & Cinematic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} // Custom cubic bezier for "cinematic" feel
                    className="relative"
                >
                    <h1 className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent select-none drop-shadow-2xl">
                        404
                    </h1>
                    {/* Subtle overlay accent */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent mix-blend-overlay opacity-30 pointer-events-none" />
                </motion.div>

                {/* Message Container - Spacious & Clean */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className="mt-[-1rem] md:mt-[-2rem] space-y-8 max-w-lg backdrop-blur-sm p-8 rounded-2xl border border-white/5 bg-black/20 shadow-2xl"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-light text-white tracking-widest uppercase opacity-90">
                            Lost in Space
                        </h2>
                        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto" />
                        <p className="text-gray-400 font-light leading-relaxed text-lg tracking-wide">
                            The page you are looking for has drifted away into the void. <br /> Let's guide you back to luxury.
                        </p>
                    </div>

                    {/* Action Buttons - Premium Feel */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16, 185, 129, 0.2)" }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative px-10 py-4 bg-white text-black rounded-full font-medium text-sm tracking-[0.2em] uppercase overflow-hidden transition-all"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative flex items-center gap-3">
                                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                                    Return Home
                                </span>
                            </motion.button>
                        </Link>

                        <Link href="/contact">
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                                whileTap={{ scale: 0.98 }}
                                className="px-10 py-4 border border-white/10 text-white/80 hover:text-white rounded-full font-medium text-sm tracking-[0.2em] uppercase transition-all flex items-center gap-3 backdrop-blur-md"
                            >
                                <LifeBuoy className="w-4 h-4 opacity-70" />
                                Support
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Refined Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        </div>
    );
}
