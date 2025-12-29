"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useCartCount() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [count, setCount] = useState(0);

    const fetchCartCount = async () => {
        if (!user) {
            setCount(0);
            return;
        }

        try {
            const token = await getToken();
            const base =
                process.env.NEXT_PUBLIC_API_BASE ||
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:4000";
            const baseUrl = base.replace(/\/$/, "");

            const res = await fetch(`${baseUrl}/api/cart?userId=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                const items = data?.items || [];
                const total = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                setCount(total);
            }
        } catch (err) {
            console.error("Failed to fetch cart count:", err);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchCartCount();
        }
    }, [isLoaded, user]);

    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener("cart-updated", handleCartUpdate);
        return () => window.removeEventListener("cart-updated", handleCartUpdate);
    }, [isLoaded, user]);

    return count;
}
