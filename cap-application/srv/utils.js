// util.js

const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const pdfParse = require("pdf-parse");
const unzipper = require("unzipper");

// Funzione per validare se il buffer è un PDF
const isValidPdf = (buffer) => {
  return buffer.slice(0, 4).toString() === "%PDF";
};

// Funzione per convertire il testo del PDF in formato XML
function convertPdfTextToXml(pdfText) {
  const builder = new xml2js.Builder();
  const xmlObj = {
    invoice: {
      text: pdfText, // Aggiungi qui la logica per strutturare i dati correttamente
    },
  };

  return builder.buildObject(xmlObj);
}

// Funzione per convertire XML in Base64
function convertXmlToBase64(xmlData) {
  const buffer = Buffer.from(xmlData, "utf-8");
  return buffer.toString("base64");
}

// Funzione per provare a parsificare un PDF con retry
const tryParsePdf = async (buffer, retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await pdfParse(buffer);
    } catch (error) {
      console.error(`[Tentativo ${i + 1}] Errore nell'analisi del PDF:`, error);
      if (i === retries - 1) throw error;
    }
  }
};

// Funzione per estrarre contenuto da un file ZIP
const extractZip = async (zipBuffer, extractPath) => {
  const zipPath = path.join(extractPath, "uploaded.zip");
  fs.writeFileSync(zipPath, zipBuffer);
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();
  console.log("[INFO] ZIP estratto in:", extractPath);
};

// Funzione per leggere un file CSV e restituire i nomi dei file
const readCsvFile = async (csvPath) => {
  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(require("csv-parser")())
      .on("data", (row) => {
        const fileNameFromCsv = row[Object.keys(row)[1]];
        results.push(fileNameFromCsv);
      })
      .on("end", resolve)
      .on("error", reject);
  });
  return results;
};

// Creazione di cartelle se non esistono
const createDirectoriesIfNeeded = (dirs) => {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

async function setDocumentGo2Doc(fileObject) {
  const base64 = fileObject?.base64;
  const filename = fileObject?.filename;
  var metadato = getMetadato();
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
    return {
      result: response2.data.documentId,
      token: token,
    };
  } catch (error) {
    console.log(error);
    return {
      value: "Errore durante l'invio a go2doc",
    };
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

function getMetadato() {
  return {
    document: {
      documentType: "DocumentazioneContrattuale",
      attributes: [
        { name: "AnnoEsercizio", val: "2025" },
        { name: "CFPIVADestinatario", val: "112234" },
        { name: "CFPIVAMittente", val: "-" },
        { name: "CIG", val: "-" },
        { name: "CodiceSottotipo", val: "DOCCONTRATTUALE" },
        { name: "CodiceTipo", val: "GESTIONE_CONTRATTI" },
        { name: "ConformitaCopie", val: "true" },
        { name: "Contraente", val: "STEFANO" },
        { name: "DataRegistrazione", val: "03/02/2025 09:15:47" },
        { name: "Destinatario", val: "Destinatario" },
        { name: "FirmatoDigitalmente", val: "false" },
        { name: "Formazione", val: "A" },
        { name: "IDGara", val: "-" },
        { name: "IDPianoGare", val: "-" },
        { name: "MarcaturaTemporale", val: "false" },
        { name: "Mese", val: "02" },
        { name: "Mittente", val: "Mittente" },
        { name: "NumeroAllegati", val: "0" },
        { name: "NumeroRubrica", val: "-" },
        { name: "Oggetto", val: "-" },
        { name: "OLDGUID", val: "-" },
        { name: "ProgressivoDocumento", val: "1" },
        { name: "RagSocDestinatario", val: "STEFANO" },
        { name: "RagSocMittente", val: "ITF" },
        { name: "RIA", val: "0000001204" },
        { name: "Riservato", val: "false" },
        { name: "Rubrica", val: "-" },
        { name: "RubricaRiferimento", val: "00025/2016" },
        { name: "SigillatoElettronicamente", val: "false" },
        { name: "Societa", val: "ITF" },
        { name: "StatoDocumento", val: "0" },
        { name: "StrutturaOrganizzativa", val: "Dir.AA1 Acquisti Centrali" },
        { name: "TempoConservazione", val: "9999" },
        { name: "TipoDocumContrattuale", val: "documentodiblocco" },
        { name: "TipoFlusso", val: "U" },
        { name: "TipoRegistro", val: "Nessuno" },
        { name: "VersioneDocumento", val: "1" },
      ],
    },
  };
}

module.exports = {
  isValidPdf,
  convertPdfTextToXml,
  convertXmlToBase64,
  tryParsePdf,
  extractZip,
  readCsvFile,
  createDirectoriesIfNeeded,
  setDocumentGo2Doc
};
