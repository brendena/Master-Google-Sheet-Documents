
/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
 */
function PropertiesTypes(){
  return {
     "documentId":[]
   }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Master Sheet')
      .addItem('Configer', 'showPicker')
      .addItem('refresh SpreadSheets', 'combineAllFileIntoOne')
      .addToUi();
   Logger.log("started");
}


function onInstall(){
  onOpen();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~Functions used by Page.html~~~~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService
      .createTemplateFromFile('Page')
      .evaluate().setWidth(600).setHeight(425);
  SpreadsheetApp.getUi().showModalDialog(html, 'Master Google Sheet Documents - Config Menu');
}


function getActiveDocuments(){
  var documentIds = getSpecificSavedProperties("documentId");
  Logger.log(documentIds);
  var documentIdsObjectArray = [];
  if(documentIds != undefined){
    documentIdsObjectArray = documentIds.map(function(documentId){
      return {"name": DriveApp.getFileById(documentId).getName(), "id":documentId}
    });
  }
  
  return documentIdsObjectArray;
}
                             

function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}


function selectedSpreadSheetFile(id){
  //var id = "1_kfz4aLHaWDVuYfDt5ZY6nhRjWMTjfFWxTt_D5opYTo";
  ///*
  try{
    convertObjectToSpreadSheet(id);
  }
  catch (e){
    throw "Please select a valid spreadSheet Document";
  }
  //*/
  var documentId = getSpecificSavedProperties("documentId");
  Logger.log(documentId);
  if(documentId.indexOf(id) != -1)
    throw "Error you can't have duplicate files"
  documentId.push(id)
  
  savePropertie("documentId", documentId);
  
  combineAllFileIntoOne();  
}

function checkValid(id){
  var file = DriveApp.getFileById(id)
  if (checkIfValidFile(file) == false && checkSpreedSheet(file) == false){
    throw "Please select a valid spreadSheet Document"
  }
}



function removeDocumentId(id){
  var documentId = getSpecificSavedProperties("documentId");
  var i = documentId.indexOf(id);
  if(i != -1) {
      documentId.splice(i, 1);
  }
  saveProperties(documentId);
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*~~~~End of Functions used by Page.html~~~~~~~~~~~~~~~~~ */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



