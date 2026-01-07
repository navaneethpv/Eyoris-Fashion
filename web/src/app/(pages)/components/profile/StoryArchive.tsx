"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Clock, Archive, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Story {
    _id: string;
    imageUrl: string;
    createdAt: string;
    expiresAt: string;
    productId: {
        name: string;
        images: string[];
        price_cents: number;
        slug: string;
    };
}

export default function StoryArchive() {
    const { getToken } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${base}/api/stories/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch (error) {
            console.error("Failed to fetch stories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            const token = await getToken();
            const res = await fetch(`${base}/api/stories/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setStories(prev => prev.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete story", error);
        } finally {
            setDeletingId(null);
        }
    };

    const activeStories = stories.filter(s => !isPast(new Date(s.expiresAt)));
    const archivedStories = stories.filter(s => isPast(new Date(s.expiresAt)));

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500">

            {/* Active Stories Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Active Stories
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            {activeStories.length}
                        </span>
                    </h3>
                    <p className="text-xs text-gray-400">Visible to public</p>
                </div>

                {activeStories.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50">
                        <p className="text-sm text-gray-500">No active stories at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {activeStories.map(story => (
                            <StoryCard
                                key={story._id}
                                story={story}
                                onDelete={handleDelete}
                                isDeleting={deletingId === story._id}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Archived Stories Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 opacity-80">
                        <Archive className="w-4 h-4 text-gray-400" />
                        Archive
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {archivedStories.length}
                        </span>
                    </h3>
                    <p className="text-xs text-gray-400">Only visible to you</p>
                </div>

                {archivedStories.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {archivedStories.map(story => (
                            <StoryCard
                                key={story._id}
                                story={story}
                                onDelete={handleDelete}
                                isDeleting={deletingId === story._id}
                                isArchived
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function StoryCard({ story, onDelete, isDeleting, isArchived = false }: {
    story: Story,
    onDelete: (id: string) => void,
    isDeleting: boolean,
    isArchived?: boolean
}) {
    const getImgUrl = (img: any) => (typeof img === 'string' ? img : img?.url || "");

    return (
        <div className={`relative group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md ${isArchived ? 'opacity-75 hover:opacity-100 grayscale-[0.3] hover:grayscale-0' : ''}`}>
            {/* Image & Overlay */}
            <div className="aspect-[3/4] relative bg-gray-100">
                <Image
                    src={story.imageUrl}
                    alt="Story"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm">
                        {isArchived ? 'Expired' : 'Live'}
                    </div>
                    <button
                        onClick={() => onDelete(story._id)}
                        disabled={isDeleting}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
                        aria-label="Delete story"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-md bg-white border border-white/20 overflow-hidden relative flex-shrink-0">
                            <Image src={getImgUrl(story.productId.images?.[0])} alt="Product" fill className="object-cover" />
                        </div>
                        <p className="text-xs font-medium truncate opacity-90">{story.productId.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-80 uppercase tracking-wide">
                        <Clock className="w-3 h-3" />
                        {isArchived
                            ? `Expired ${formatDistanceToNow(new Date(story.expiresAt))} ago`
                            : `${formatDistanceToNow(new Date(story.expiresAt))} left`
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
