@Capabilities.BatchSupported: false

service MainService @(path: '/main-service') {
  define type DataInteger {
    value : Integer;
  }

  @Core.Description: 'toInteger'
  function toInteger(value : String) returns DataInteger;

  // Definisci l'azione per caricare una singola fattura
  @Core.Description: 'Carica una fattura'
  action uploadSingleFattura(file: Binary, fileName: String) returns String;

  @Core.Description: 'Carica più fatture tramite uno zip'
  action uploadMassiveFattura(file: Binary) returns String;

  @Core.Description: 'Download una fattura'
  action downloadSingleDispPag(fileName: String) returns String;

  @Core.Description: 'Download più fatture'
  action downloadMassiveDispPag(fileName: String) returns String;

  @Core.Description: 'Download CU'
  action downloadCU(fileName: String) returns String;
}
