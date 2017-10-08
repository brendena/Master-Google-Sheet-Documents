// array for document ids
function getDocumentIdsArray(){
    var documentIdString =  getUserProperties().getProperty("documentId");
    Logger.log(documentIdString);
    // string array looks like values, value2
    // all you have to do is remove the , and your good.
    var documentIds = ((documentIdString == null) ? [] : documentIdString.split(","));
    if(documentIds == 'undefined' || documentIds.constructor !== Array, documentIds[0] == ""){
      documentIds = [];
    }
    return documentIds;
  }
function saveDocumentInfo(id){
    try {
      var documentIds = this.getDocumentIdsArray();
      if(documentIds.indexOf(id) == -1){
        if(id != undefined)
          documentIds.push(id);
        getUserProperties().setProperty("documentId", documentIds.toString());
      }
      
    } catch (f) {
      Logger.log(f.toString());
    }
  }

function removeDocumentId(id){
  var documentIds = this.getDocumentIdsArray();
  var positionOfRemovedId = documentIds.indexOf(id);
  if(positionOfRemovedId != -1){
    documentIds.splice(positionOfRemovedId,1); 
    getUserProperties().setProperty("documentId", documentIds.toString());
  }
}


function resetDocumentInfo() {
   getUserProperties().setProperty("documentId", "");
}

 

function getUserProperties(){
  return  PropertiesService.getUserProperties();
}