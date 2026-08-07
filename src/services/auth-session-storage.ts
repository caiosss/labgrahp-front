const ACCESS_TOKEN_KEY = "labgraph-access-token";

export const getStoredAccessToken = () =>
  window.sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const setStoredAccessToken = (token: string) => {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearStoredAccessToken = () => {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};
