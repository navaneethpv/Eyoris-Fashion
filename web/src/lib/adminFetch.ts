import { useAuth } from "@clerk/nextjs";

export const useAdminFetch = () => {
    const { getToken } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const adminFetch = async (
        url: string,
        options: RequestInit = {}
    ) => {
        const token = await getToken();

        // Ensure url starts with / if API_URL doesn't end with /
        // Ideally API_URL should not end with / and url should start with /
        // But let's handle the full url construction carefully.
        // If the input url is a full path (e.g. starts with http), usage might need check.
        // But based on user prompt, usage is adminFetch("/api/admin/...")

        // We already have API_URL handling in individual files, usually defined as const API_URL = ...
        // The user prompt example says: `${process.env.NEXT_PUBLIC_API_URL}${url}`
        // My implementation below follows that, assuming url starts with /.

        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

        const res = await fetch(
            fullUrl,
            {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (res.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        if (res.status === 403) {
            throw new Error("FORBIDDEN");
        }

        // Attempt to parse JSON, fail gracefully if not JSON (though admin APIs should return JSON)
        // This catches cases where backend might return plain text error or success.
        try {
            return await res.json();
        } catch (e) {
            if (res.ok) return {}; // Success but no JSON
            throw new Error(`Request failed with status ${res.status}`);
        }
    };

    return adminFetch;
};
