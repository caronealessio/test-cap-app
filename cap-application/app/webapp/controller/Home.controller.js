sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("appcap.appcap.controller.Home", {
    onInit() {},

    onCallToInteger: function () {
      const value = "123.45"; // Valore di esempio da inviare al servizio

      // Effettua una richiesta HTTP GET al servizio
      fetch(`/main-service/toInteger(value='${encodeURIComponent(value)}')`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Errore nella richiesta: " + response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          MessageBox.success("Valore convertito: " + data.value);
        })
        .catch((error) => {
          MessageBox.error("Errore durante la chiamata al servizio: " + error.message);
        });
    },
  });
});
