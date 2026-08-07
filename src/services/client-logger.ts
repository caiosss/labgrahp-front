interface ClientLogEntry {
    context: string;
    message: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

const CLIENT_LOGS_KEY = "labgraph-client-logs";
const MAX_LOG_ENTRIES = 30;

const readClientLogs = (): ClientLogEntry[] => {
    try {
        const storedLogs = window.localStorage.getItem(CLIENT_LOGS_KEY);

        if (!storedLogs) {
            return [];
        }

        const parsedLogs = JSON.parse(storedLogs);

        if (!Array.isArray(parsedLogs)) {
            return [];
        }

        return parsedLogs as ClientLogEntry[];
    } catch {
        return [];
    }
};

const writeClientLogs = (logs: ClientLogEntry[]) => {
    try {
        window.localStorage.setItem(
            CLIENT_LOGS_KEY,
            JSON.stringify(logs.slice(0, MAX_LOG_ENTRIES)),
        );
    } catch {
        // Logs locais não podem quebrar o fluxo principal do app.
    }
};

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    }

    return "Erro desconhecido";
};

export const logClientError = (
    context: string,
    error: unknown,
    metadata?: Record<string, unknown>,
) => {
    const entry: ClientLogEntry = {
        context,
        message: getErrorMessage(error),
        metadata,
        timestamp: new Date().toISOString(),
    };
    const logs = readClientLogs();

    writeClientLogs([entry, ...logs]);
    console.warn(`[LabGraph] ${context}`, {
        error,
        metadata,
    });
};

export const getClientLogs = readClientLogs;
