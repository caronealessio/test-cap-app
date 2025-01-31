// Importa le librerie necessarie
const multer = require("multer");
const pdfParse = require("pdf-parse");
const xml2js = require("xml2js");
const fs = require("fs");
const axios = require("axios");

module.exports = (srv) => {
  srv.on("toInteger", (req) => {
    const { value } = req.data;

    return { value: parseInt(value) };
  });

  // Implementazione dell'azione `uploadSingleFattura`
  srv.on("uploadSingleFattura", async (req) => {
    try {
      // Ottieni la stringa Base64 del file dalla richiesta
      const fileBase64 = req.data.file;

      if (!fileBase64) {
        throw new Error("File non trovato");
      }

      // Decodifica la stringa Base64 in un buffer
      const buffer = Buffer.from(fileBase64, "base64");

      // Verifica se è un file PDF valido
      if (!isValidPdf(buffer)) {
        throw new Error("Il file non è un PDF valido");
      }

      // Estrai il testo dal PDF
      const pdfData = await pdfParse(buffer);

      // Converti il testo del PDF in XML
      const xmlData = convertPdfTextToXml(pdfData.text);

      const xmlDataBase64 = convertXmlToBase64(xmlData);
      console.log("[INFO] xmlDataBase64", xmlDataBase64);

      // Restituisci il file XML
      return { value: "Fattura inviata correttamente" };
    } catch (error) {
      console.error("Errore nell'upload della fattura: ", error);
      throw new Error("Errore durante la conversione del file: " + error.message);
    }
  });
};

// Funzione per convertire il testo del PDF in formato XML
function convertPdfTextToXml(pdfText) {
  const builder = new xml2js.Builder();
  // Esegui il parsing del testo e crea un oggetto XML (questo dipende dalla struttura della tua fattura)
  const xmlObj = {
    invoice: {
      text: pdfText, // Aggiungi qui la logica per strutturare i dati correttamente
    },
  };

  return builder.buildObject(xmlObj);
}

// Funzione per convertire XML in Base64
function convertXmlToBase64(xmlData) {
  // 1. Converti il testo XML in un buffer
  const buffer = Buffer.from(xmlData, "utf-8");

  // 2. Codifica il buffer in Base64
  const base64String = buffer.toString("base64");

  return base64String;
}

async function setDocumentGo2Doc(fileObject) {
  const base64 = fileObject?.base64;
  const filename = fileObject?.filename;
  var metadato = fileObject?.metadato;
  var token = fileObject?.token;

  metadato.document.content = {
    data: base64,
    mimeType: "application/pdf",
    name: filename,
  };
  metadato.folderId = [];
  metadato.folderPath = [];

  const jsonData = JSON.stringify(metadato);

  try {
    if (!token || token === "''") {
      console.log("Fetching new token");
      const response = await getJWT();
      token = response.data.authenticationToken;
      console.log("Fetched token:", token);
    }

    const config = {
      url: process.env.BASE_URL_GO2DOC + "/go2docdest/go2doc/documentservice/v1/document/base64",
      type: "POST",
      method: "POST",
      data: jsonData,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response2 = await axios.request(config);
    console.log(response2);
    // result.Result = response2.data.documentId;
    // result.Token = token;
  } catch (error) {
    console.log(error);
  }
  return result;
}

function getJWT() {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify({
      userName: "ACQBTPG2DUser",
      password: "Password.1",
      repositoryName: "ACQOS",
    });

    let config = {
      method: "post",
      url: process.env.BASE_URL_GO2DOC + "/go2docdest/go2doc/authenticationservice/authenticate/getToken",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    console.log("Token JWT Config:", config);
    axios
      .request(config)
      .then((response) => {
        resolve(response);
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
}

const isValidPdf = (buffer) => {
  return buffer.slice(0, 4).toString() === "%PDF";
};
