function createSearchParameters(){
  var searchParameter = "";
  for (var i = 0; i < supportedFiles.length; i++){
    searchParameter += "title contains " + "'" + supportedFiles[i] + "'";
    if(i != (supportedFiles.length - 1)){
      searchParameter += " or "
    }
  }
  searchParameter += " or mimeType = 'application/vnd.google-apps.spreadsheet'" 
  return searchParameter;
}








/*
Will loop through a directory and concat 
all files into one google sheets page.
*/
function combineAllFileIntoOne(){
  Logger.log("combining stuff")
  convertAllNoneGoogleSheetsFiles();
  var documentIds = getSpecificSavedProperties("documentId");
  //Logger.log(documentIds)
  documentIds.forEach(function(documentId){

    var concatSpreadSheetFile = spreadSheetObjectFactory(documentId)
    Logger.log( concatSpreadSheetFile.getSpreadSheet())
    var parentDirectory = concatSpreadSheetFile.getFile().getParents().next();
    /*so i just have to search for google spreadsheet files*/
    var files = parentDirectory.searchFiles("mimeType = 'application/vnd.google-apps.spreadsheet'");
    while (files.hasNext()) {
      var file = files.next();
      combineTwoSpreadSheets(concatSpreadSheetFile,spreadSheetObjectFactory(file))
    }
  });
}

function combineTwoSpreadSheets(concatSpreedSheet, deletingSpreedSheet){
  Logger.log("combining");
  Logger.log(deletingSpreedSheet.getFile().getName());
  Logger.log(concatSpreedSheet.getFile().getName());
  if(concatSpreedSheet.getId() != deletingSpreedSheet.getId()){
    concatSpreedSheet.append(deletingSpreedSheet.getAllValues());
    deletingSpreedSheet.getFile().setTrashed(true);
    //parentDirectory.removeFile(file);
    //DriveApp.getRootFolder().removeFile(createdSpreadSheetFile);
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Get all files with a valid
// file type
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function convertAllNoneGoogleSheetsFiles(){
  var documentIds = getSpecificSavedProperties("documentId");
 
  documentIds.forEach(function(documentId){
    var parent = DriveApp.getFileById(documentId).getParents().next();
    var files = parent.getFiles();
    while(files.hasNext()){
      var file = files.next();

      if( !checkSpreedSheet(file) || 
         checkIfValidFile(file)){
         convertObjectToSpreadSheet(file);
      }
    }
  });
}
/*search for all and get the */

      