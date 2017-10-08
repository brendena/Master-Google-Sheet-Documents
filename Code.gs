
/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
 */
var supportedFiles = ["xls","csv","ods","xlsx"];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Master Sheet')
      .addItem('Start', 'showPicker')
      .addToUi();
   Logger.log("started");
}


function onInstall(){
  ScriptApp.newTrigger('combineAllFileIntoOne')
      .timeBased()
      .everyHours(1)
      .create();
}


/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = doGet().setWidth(600).setHeight(425);
  SpreadsheetApp.getUi().showModalDialog(html, 'Compact SpreedSheet - Config Menu');
}


function doGet() {
  return HtmlService
      .createTemplateFromFile('Page')
      .evaluate();
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/*
Converts csv file to google spreedsheet
and delete original file
*/
function convertGenericDocument(name,id){
  var nameArray = name.split(".")
  var fileName = nameArray[0];
  var extension = nameArray[1];
  var extensionId = -1;
  if(supportedFiles.indexOf(extension) > -1){
    Logger.log("converting file")
    try {
      
      //Get generic document
      var genericSpreadSheet = DriveApp.getFileById(id);
      //get files parent 
      var parentDirectory = genericSpreadSheet.getParents().next();
      var createdSpreadSheetFile = convertDocument(genericSpreadSheet);
      
      //append to parent directory
      parentDirectory.addFile(createdSpreadSheetFile);
      
      //remove the spreedsheet from root but doesn't remove child.
      DriveApp.getRootFolder().removeFile(createdSpreadSheetFile);
      //remove original document
      //parentDirectory.removeFile(genericSpreadSheet)
      
      //return the newly created file id to be store persistant storage 
      extensionId =  createdSpreadSheetFile.getId()
      
    } catch (f) {
      Logger.log(f.toString());
    }
    
  }
  return extensionId;
}
/*
Will loop through a directory and concat 
all files into one google sheets page.
*/
function combineAllFileIntoOne(){
  try{
    Logger.log("combining stuff")
    var documentIds = getDocumentIdsArray();
    Logger.log(documentIds)
    documentIds.forEach(function(documentId){
      var concatSpreadSheetFile = DriveApp.getFileById(documentId);
      //get files parent 
      var parentDirectory = concatSpreadSheetFile.getParents().next();
      var searchParameter = createSearchParameters(); 
      
      Logger.log( searchParameter);
      var files = parentDirectory.searchFiles(searchParameter);
      if(files.hasNext()){
        var concatSpreadSheetObject = SpreadsheetApp.open(concatSpreadSheetFile);
        var firstSheet = concatSpreadSheetObject.getSheets()[0]
        var lastRow = firstSheet.getLastRow();
       
        while (files.hasNext()) {
          Logger.log("going through")
          var file = files.next();
          var createdSpreadSheetFile = convertDocument(file);
          
          var fileSpreadSheet = SpreadsheetApp.open(createdSpreadSheetFile).getSheets()[0];
          var pastingValue = fileSpreadSheet.getRange(2,1,fileSpreadSheet.getLastRow(),fileSpreadSheet.getLastColumn()).getValues();
          firstSheet.getRange(lastRow, 1, fileSpreadSheet.getLastRow(), fileSpreadSheet.getLastColumn()).setValues(pastingValue);
          
          lastRow += fileSpreadSheet.getLastRow() - 1;
          parentDirectory.removeFile(file);
          DriveApp.getRootFolder().removeFile(createdSpreadSheetFile);
        }
      }
    });
  } catch (f) {
    Logger.log(f.toString());
  }
}
         
                             
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~Functions used by Page.html~~~~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function selectedGenericSpreadSheet(name, id){
  
  var newId = convertGenericDocument(name,id);
  Logger.log(id);
  var newName = name.split(".")[0]
  selectedGoogleSpreadSheet(newName,newId);
}

function selectedGoogleSpreadSheet(name, id){
  saveDocumentInfo(id)
  combineAllFileIntoOne();  
}
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*~~~~End of Functions used by Page.html~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



