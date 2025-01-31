@Capabilities.BatchSupported: false

service MainService @(path: '/main-service') {
  define type DataInteger {
    value : Integer;
  }

  @Core.Description: 'toInteger'
  function toInteger(value : String) returns DataInteger;
}
