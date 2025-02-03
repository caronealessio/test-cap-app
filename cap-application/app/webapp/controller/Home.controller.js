sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast"],
  function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("appcap.appcap.controller.Home", {
      onInit: function () {},

      onCallToInteger: function () {
        const value = "123.45";

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

      onUploadSingleFatturaPress: function () {
        var oFileUploader = this.getView().byId("fileUploaderUploadSingleFattura");
        var oFile = oFileUploader.oFileUpload.files[0];

        if (!oFile) {
          MessageToast.show("Seleziona un file!");
          return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          var base64String = event.target.result.split(",")[1];

          fetch("/main-service/uploadSingleFattura", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64String,
              fileName: oFile.name,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Errore durante l'upload");
              }
              return response.json();
            })
            .then((data) => {
              console.log(data);
              MessageToast.show("Upload completato!");
            })
            .catch((error) => {
              MessageToast.show(error.message);
            });
        };

        reader.readAsDataURL(oFile);
      },

      onUploadMassiveFatturaPress: function () {
        var oFileUploader = this.getView().byId("fileUploaderUploadMassiveFattura");
        var oFile = oFileUploader.oFileUpload.files[0];

        if (!oFile) {
          MessageToast.show("Seleziona un file!");
          return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          var base64String = event.target.result.split(",")[1];

          fetch("/main-service/uploadMassiveFattura", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64String,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Errore durante l'upload");
              }
              return response.json();
            })
            .then((data) => {
              console.log(data);
              MessageToast.show("Upload completato!");
            })
            .catch((error) => {
              MessageToast.show(error.message);
            });
        };

        reader.readAsDataURL(oFile);
      },

      onDownloadSingleDispPagPress: function () {},
      onDownloadMassiveDispPagPress: function () {},
      onDownloadCUPress: function () {},
    });
  }
);
