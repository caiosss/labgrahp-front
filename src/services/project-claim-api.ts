import {
    clearStoredSessionToken,
    getStoredSessionToken,
} from "./session-storage";

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
        let detail = `HTTP ${response.status}`;

        try {
            const body = await response.json() as { message?: unknown };
            if (typeof body.message === "string") detail = body.message;
        } catch {
            // Mantém o status quando a resposta não possui JSON.
        }

        throw new Error(
            `Não foi possível transferir os projetos anônimos: ${detail}`,
        );
    }

    const result = await response.json() as ClaimProjectsResult;

    // A sessão já foi transferida. No próximo uso anônimo, criamos uma nova
    // identidade local para não misturar projetos posteriores ao logout.
    clearStoredSessionToken();

    console.info("[LabGraph] Transferência de projetos concluída.", result);

    return result;
};
