"use client";

import { motion } from "framer-motion";

export default function ProductPageLoader() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden">

                {/* Abstract Floating Bubbles */}
                <motion.div
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-72 h-72 bg-purple-200/30 rounded-full blur-3xl -top-10 -left-10"
                />

                <motion.div
                    animate={{
                        y: [30, -30, 30],
                        x: [20, -20, 20],
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute w-96 h-96 bg-violet-200/20 rounded-full blur-3xl bottom-10 right-10"
                />

                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute w-64 h-64 bg-pink-100/40 rounded-full blur-3xl"
                />

                {/* Central Brand Element (Subtle pulsing text) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        <span className="text-white font-extrabold text-3xl">E</span>
                    </div>
                    <p className="text-sm font-medium tracking-[0.3em] text-gray-400 uppercase">Loading Collection</p>
                </motion.div>

            </div>
        </motion.div>
    );
}
