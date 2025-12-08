import { useState } from 'react';

export const useCategorySuggest = () => {
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

    const suggestCategory = async (imageFile: File | null) => {
        if (!imageFile) {
            setSuggestedCategory(null);
            return;
        }

        setIsSuggesting(true);
        const form = new FormData();
        form.append('image', imageFile);

        try {
            const res = await fetch('http://localhost:4000/api/ai/suggest-category', {
                method: 'POST',
                body: form
            });

            if (res.ok) {
                const data = await res.json();
                setSuggestedCategory(data.suggested_category);
            } else {
                alert('AI Suggestion Failed. Check Gemini Key.');
            }
        } catch (error) {
            alert('Network error while contacting AI.');
            console.log(error);
        } finally {
            setIsSuggesting(false);
        }
    };

    return { suggestCategory, suggestedCategory, isSuggesting, setSuggestedCategory };
};