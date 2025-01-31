@Capabilities.BatchSupported: false

service MainService @(path: '/main-service') {
  define type DataInteger {
    value : Integer;
  }

  @Core.Description: 'toInteger'
  function toInteger(value : String) returns DataInteger;

  // Definisci l'azione per caricare una singola fattura
   @Core.Description: 'Carica una fattura'
  action uploadSingleFattura(file: Binary) returns String;
}
