import { getStoredSessionToken } from "./session-storage";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? "";

export interface ClaimProjectsResult {
    claimedProjects: number;
}

export const claimAnonymousProjects = async (
    accessToken: string,
): Promise<ClaimProjectsResult> => {
    const anonymousToken = getStoredSessionToken();

    if (!anonymousToken) {
        return {
            claimedProjects: 0,
        };
    }

    const response = await fetch(
        `${API_BASE_URL}/sessions/claim-projects`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                anonymousToken,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Não foi possível transferir os projetos anônimos.",
        );
    }

    return response.json() as Promise<ClaimProjectsResult>;
};