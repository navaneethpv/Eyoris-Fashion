"use client";

import { motion } from "framer-motion";
import { RefreshCcw, Truck, Headset } from "lucide-react";

const features = [
    {
        icon: RefreshCcw,
        title: "7 Days Easy Return",
        description: "Hassle-free returns & exchange",
    },
    {
        icon: Truck,
        title: "Fast Delivery",
        description: "Free shipping on orders over ₹999",
    },
    {
        icon: Headset,
        title: "24×7 Customer Support",
        description: "We are here to help you anytime",
    },
];

export default function ServiceFeatures() {
    return (
        <section className="py-12 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-black transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
