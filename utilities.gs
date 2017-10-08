

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}





function convertDocument(genericSpreadSheet){
  //id of file picked
  
  var nameWithoutExtension = genericSpreadSheet.getName().split(".")[0]
  var createdSpreadSheetFile = Drive.Files.insert({
    title: nameWithoutExtension,
    mimeType: MimeType.GOOGLE_SHEETS
  },  genericSpreadSheet.getBlob(),{
    convert: true
  });
  
  return DriveApp.getFileById(createdSpreadSheetFile.id);
}

function createSearchParameters(){
  var searchParameter = "";
  for (var i = 0; i < supportedFiles.length; i++){
    searchParameter += "title contains " + "'" + supportedFiles[i] + "'";
    if(i != (supportedFiles.length - 1)){
      searchParameter += " or "
    }
  }
  return searchParameter;
}


function getActiveDocuments(){
  var documentIds = getDocumentIdsArray();
  var documentIdsObjectArray = documentIds.map(function(documentId){
    
    return {"name":DriveApp.getFileById(documentId).getName(), "id":documentId}
  });

  return documentIdsObjectArray;
}


function resetActiveDocuments(){
  resetDocumentInfo();
}


      