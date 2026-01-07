import { Zap, HelpCircle } from "lucide-react";

interface StyleConfidenceCardProps {
    score: number;
}

export default function StyleConfidenceCard({ score }: StyleConfidenceCardProps) {
    // Determine color and text based on score
    let colorClass = "bg-orange-500";
    let textColorClass = "text-orange-600";
    let bgColorClass = "bg-orange-50";

    if (score >= 80) {
        colorClass = "bg-emerald-500";
        textColorClass = "text-emerald-700";
        bgColorClass = "bg-emerald-50";
    } else if (score >= 65) {
        colorClass = "bg-yellow-500";
        textColorClass = "text-yellow-700";
        bgColorClass = "bg-yellow-50";
    }

    return (
        <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${textColorClass} fill-current`} />
                    <h3 className="text-sm font-semibold text-gray-900 tracking-wide">
                        Style Confidence
                    </h3>
                </div>
                <span className={`text-lg font-bold ${textColorClass}`}>
                    {score}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="flex items-start gap-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                    Based on reviews, popularity & trends.
                </p>

                {/* Simple tooltip hint if needed, or just static text as per requirements */}
            </div>
        </div>
    );
}
