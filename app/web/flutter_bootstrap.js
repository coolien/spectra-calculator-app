{{flutter_js}}
{{flutter_build_config}}

_flutter.loader.load({
  onEntrypointLoaded: async function (engineInitializer) {
    const appRunner = await engineInitializer.initializeEngine();
    await appRunner.runApp();
  },
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("spectra_service_worker.js")
      .then(function (registration) {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", function () {
          const worker = registration.installing;
          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", function () {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      });
  });
}
