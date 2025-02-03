// Importa le librerie necessarie
const fs = require("fs");
const unzipper = require("unzipper");
const csvParser = require("csv-parser");
const {
  isValidPdf,
  convertPdfTextToXml,
  convertXmlToBase64,
  tryParsePdf,
  extractZip,
  readCsvFile,
  createDirectoriesIfNeeded,
  setDocumentGo2Doc,
} = require("./utils");

module.exports = (srv) => {
  srv.on("toInteger", (req) => {
    const { value } = req.data;

    return { value: parseInt(value) };
  });

  srv.on("uploadSingleFattura", async (req) => {
    try {
      // Ottieni la stringa Base64 del file dalla richiesta
      const fileBase64 = req.data.file;
      const fileName = req.data.fileName || "file_senza_nome.pdf";

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
      const pdfData = await tryParsePdf(buffer);

      console.log("[INFO] PDFDATA", pdfData);

      // Converti il testo del PDF in XML
      const xmlData = convertPdfTextToXml(pdfData.text);
      const xmlDataBase64 = convertXmlToBase64(xmlData);
      console.log("[INFO] xmlDataBase64", xmlDataBase64);

      // Creazione dell'oggetto da inviare a Go2Doc
      const fileObject = {
        base64: xmlDataBase64, // Usa il file originale in base64
        filename: fileName,
        token: "", // Se necessario, verrà richiesto un nuovo token
      };

      console.log("[INFO] fileObject", fileObject);

      // Chiamata a Go2Doc per l'invio del documento
      // const result = await setDocumentGo2Doc(fileObject);

      // console.log("[INFO] Documento caricato su Go2Doc con successo", result);

      // Restituisci il risultato dell'operazione
      return { value: "Fattura inviata correttamente a Go2Doc" };
    } catch (error) {
      console.error("Errore nell'upload della fattura: ", error);
      throw new Error("Errore durante la conversione del file: " + error.message);
    }
  });

  srv.on("uploadMassiveFattura", async (req) => {
    const { file } = req.data;

    // Controllo se il file è stato ricevuto
    if (!file) {
      console.error("[ERROR] Nessun file ricevuto");
      req.error(400, "File non valido");
      return;
    }

    try {
      // Converte il file da Base64 a Buffer
      const buffer = Buffer.from(file, "base64");

      // Definizione delle cartelle di lavoro
      const uploadPath = "./uploads";
      const processedPath = "./processed_files";
      const tempExtractPath = "./temp_extracted";

      // Creazione delle cartelle se non esistono
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      if (!fs.existsSync(processedPath)) fs.mkdirSync(processedPath, { recursive: true });
      if (!fs.existsSync(tempExtractPath)) fs.mkdirSync(tempExtractPath, { recursive: true });

      // Percorso del file ZIP salvato
      const zipPath = path.join(uploadPath, "uploaded.zip");
      fs.writeFileSync(zipPath, buffer);
      console.log("[INFO] ZIP salvato:", zipPath);

      // Estrazione del contenuto dello ZIP nella cartella temporanea
      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: tempExtractPath }))
        .promise();
      console.log("[INFO] ZIP estratto in:", tempExtractPath);

      // Verifica la presenza del file CSV
      const csvFilePath = path.join(tempExtractPath, "file_csv.csv");
      if (!fs.existsSync(csvFilePath)) {
        console.error('[ERROR] Il file CSV "file_csv.csv" non è presente nello ZIP');
        req.error(400, 'Il file CSV "file_csv.csv" non è presente nello ZIP');
        return;
      }
      console.log("[INFO] File CSV trovato:", csvFilePath);

      // Lettura del file CSV per estrarre i nomi dei file PDF
      let fileNames = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csvParser()) // Parsing del CSV
          .on("data", (row) => {
            const fileNameFromCsv = row[Object.keys(row)[1]]; // Prende il valore della seconda colonna
            fileNames.push(fileNameFromCsv);
          })
          .on("end", resolve) // Segnala il completamento della lettura
          .on("error", reject); // Gestisce eventuali errori
      });

      console.log("[INFO] File PDF da cercare:", fileNames);

      // Ciclo sui file PDF per creare l'oggetto e inviare la chiamata POST
      for (const fileName of fileNames) {
        const sourcePath = path.join(tempExtractPath, fileName);
        const destinationPath = path.join(processedPath, fileName);

        if (fs.existsSync(sourcePath)) {
          // Copia il file PDF nella cartella processed_files
          fs.copyFileSync(sourcePath, destinationPath);
          console.log("[SUCCESS] File copiato:", destinationPath);

          // Crea l'oggetto PDF
          // const pdfObject = createPdfObject(fileName, destinationPath);

          // console.log("[INFO] pdfObject", pdfObject);

          // // Esegui la chiamata POST
          // await sendPostRequest(pdfObject);
        } else {
          console.error("[ERROR] File", fileName, "non trovato nella cartella estratta.");
        }
      }

      return { value: "Upload ed elaborazione completati con successo!" };
    } catch (err) {
      console.error("[ERROR] Errore durante l'upload:", err);
      req.error(500, "Errore interno durante l'upload");
    }
  });

  srv.on("downloadSingleDispPag", async (req) => {});

  srv.on("downloadMassiveDispPag", async (req) => {});

  srv.on("downloadCU", async (req) => {});
};
