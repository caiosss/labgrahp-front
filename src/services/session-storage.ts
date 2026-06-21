const SESSION_TOKEN_KEY = "labgraph-session-token";

export const getStoredSessionToken = () => {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
};

export const setStoredSessionToken = (token: string) => {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
};

export const clearStoredSessionToken = () => {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
};
