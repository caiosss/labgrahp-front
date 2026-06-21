export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
    });

    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        registration.update().catch((error) => {
          console.warn("Não foi possível atualizar o service worker.", error);
        });
      })
      .catch((error) => {
        console.warn("Não foi possível registrar o service worker.", error);
      });
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type !== "LABGRAPH_PWA_UPDATED") {
      return;
    }

    const reloadKey = `labgraph-reloaded-${event.data.version}`;
    const alreadyReloaded = window.sessionStorage.getItem(reloadKey);

    if (alreadyReloaded) {
      return;
    }

    window.sessionStorage.setItem(reloadKey, "true");
    window.location.reload();
  });
};
