sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (Controller, MessageBox) {
  "use strict";

  return Controller.extend("appcap.appcap.controller.Home", {
    onInit: function () {
      // Inizializza il modello OData per il servizio CAP
      // this.oModel = new sap.ui.model.odata.v2.ODataModel("/your_service_path/");
      // this.getView().setModel(this.oModel);
    },

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

    onUploadPress: function () {
      var oFileUploader = this.getView().byId("fileUploader");
      var oFile = oFileUploader.oFileUpload.files[0];

      if (!oFile) {
        sap.m.MessageToast.show("Seleziona un file!");
        return;
      }

      var reader = new FileReader();
      reader.onload = function (event) {
        var base64String = event.target.result.split(",")[1];

        $.ajax({
          url: "/main-service/uploadSingleFattura",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ file: base64String }),
          success: function (response) {
            console.log(response);
            sap.m.MessageToast.show("Upload completato!");
          },
          error: function (err) {
            sap.m.MessageToast.show("Errore durante l'upload");
          },
        });
      };

      reader.readAsDataURL(oFile);
    },
  });
});
