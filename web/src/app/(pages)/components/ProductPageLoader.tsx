"use client";

import { motion } from "framer-motion";

export default function ProductPageLoader() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-white"
        >
            {/* Brand Group */}
            <motion.div
                animate={{ opacity: [0.85, 1, 0.85] }}
                transition={{
                    duration: 3.2,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="flex flex-col items-center"
            >
                {/* Logo Mark */}
                <div
                    className="
            w-14 h-14
            md:w-16 md:h-16
            2xl:w-20 2xl:h-20
            rounded-xl bg-black
            flex items-center justify-center
            mb-4 md:mb-5
          "
                >
                    <span
                        className="
              text-white font-serif
              text-2xl md:text-3xl 2xl:text-4xl
              leading-none
            "
                    >
                        E
                    </span>
                </div>

                {/* Brand Name */}
                <span
                    className="
            font-serif text-black leading-none
            text-lg md:text-xl 2xl:text-2xl
            mb-1
          "
                >
                    Eyoris
                </span>

                {/* Sub Brand */}
                <span
                    className="
            text-gray-500 tracking-[0.25em]
            text-[10px] md:text-[11px] 2xl:text-[12px]
          "
                >
                    FASHION
                </span>
            </motion.div>
        </motion.div>
    );
}
