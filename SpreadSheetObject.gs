/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/  This will become the javascript 
/  library object
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// take a file object and returns
// the File object Created file
// its also will Delete the original 
// file
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//https://gist.github.com/azadisaryev/ab57e95096203edc2741
//Link to converting other documents to google spreadSheet
function convertDocument(originalSpreadSheet){
  Logger.log("converting");
  var parentFolder = originalSpreadSheet.getParents().next();
  var createdSpreadSheetFile = Drive.Files.insert({
    title:  originalSpreadSheet.getName(),
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [{id:parentFolder.getId()}]
  },  originalSpreadSheet.getBlob(),{
    convert: true,
  });
  parentFolder.removeFile(originalSpreadSheet)
  return DriveApp.getFileById(createdSpreadSheetFile.id);
}

//var supportedFiles = ["xls","csv","ods","xlsx"];
function checkIfValidFile (file, throwError){
    console.log(file);
    var name = file.getName();
    var mimeType = file.getMimeType();
    var matchExtension = new RegExp('(.*?)\.(xls|csv|ods|xlsx)$');
    if(matchExtension.test(name.toLowerCase()) == true && (
       mimeType == "text/csv" || 
       mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
       mimeType == "application/vnd.oasis.opendocument.spreadsheet" ||
       mimeType == "application/vnd.ms-excel"))
       return true;
    else if(throwError == true){
      throw "please choose a proper file type xls,csv,ods,xlsx"
    }
    return false;
}

function checkSpreedSheet(file){
  if(file.getMimeType() == "application/vnd.google-apps.spreadsheet" ){
    return true;
  }
  return false;
}
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/    accept 
/    File Id
/    File Object
/    SpreadSheet File
/    If its a file it must be a supported file type
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function convertObjectToSpreadSheet(file){
  var returnSpreadSheet = undefined;
  
  if(typeof file =="object"){
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Check to see if its a spreadsheet
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var mimeType = file.getMimeType();
    if(mimeType == "application/vnd.google-apps.spreadsheet"){
      returnSpreadSheet = SpreadsheetApp.open(file);
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Supported Mime Types
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    else if(checkIfValidFile(file)){
      var convertedDocument = convertDocument(file)
      returnSpreadSheet = convertObjectToSpreadSheet(convertedDocument)  
    }
    else {
      throw "wrong file type";
    }
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Else assume its a id if it 
  // break then its not a valid id
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  else{
    try{
      var actuallyFile = DriveApp.getFileById(file);
    }
    catch (e){
      throw "not a valid file"
    }
    returnSpreadSheet = convertObjectToSpreadSheet(actuallyFile)
    
  }

  return returnSpreadSheet;
}

function spreadSheetObjectFactory(spreadSheet){
  /*going to convert it if its not a normal document*/
  //var spreadSheet = "0B4tMuwAXRoO4YUhkZEREOUFoQTA"
  //Logger.log(spreadSheet)
  //create spreadSheet with id
  var objectSpreadSheet = convertObjectToSpreadSheet(spreadSheet)
   
  return createSpreadSheetObject(objectSpreadSheet);
}
function createSpreadSheetObject(spreadSheet){

  return {
    "spreadSheetObject" : spreadSheet,
    "activeSpreadSheet": spreadSheet.getSheets()[0],
    "getSpreadSheet": function(){
      return this["spreadSheetObject"];
    },
    "getId": function(){
      return this["spreadSheetObject"].getId()
    },
    "getFile": function(){
      return DriveApp.getFileById(this["spreadSheetObject"].getId())
    },
    "append":function(data){
      var lastRow =  this["activeSpreadSheet"].getLastRow() + 1;
      this["activeSpreadSheet"].getRange(lastRow, 1, 
                                         data.length, 
                                         data[0].length).setValues(data);
    },
    "getAllValues":function(){
      return this["activeSpreadSheet"].getRange(2,1,this["activeSpreadSheet"].getLastRow(),this["activeSpreadSheet"].getLastColumn()).getValues()
    },
    "clearSheet": function(){
      this["activeSpreadSheet"].clear();
    },
    "clearAllSheets": function(){
      var allCreatedSheets = this["spreadSheetObject"].getSheets();
      allCreatedSheets.forEach(function(sheet){
        sheet.clear();
      }.bind(this));
    },
    "getCellValue": function(row,column){
      if(row == -1){
        row = this["activeSpreadSheet"].getLastRow()
      }
      if(row == 0)
        return "";
      else
        return this["activeSpreadSheet"].getRange(row,column).getValues()[0][0];
    },
    "checkAndCreateSheets": function(listSheetsNeeded){
    //getSheetByName(name)
      var allCreatedSheets = this["spreadSheetObject"].getSheets();
      var allCreatedSheetsNames = [];
      
      for(var i = 0; i < allCreatedSheets.length; i++){
        allCreatedSheetsNames.push(allCreatedSheets[i].getName())
      }
      for(i = 0; i < listSheetsNeeded.length; i++){
        if(allCreatedSheetsNames.indexOf(listSheetsNeeded[i]) == -1){
          this["spreadSheetObject"].insertSheet(listSheetsNeeded[i]);
        }
      }
    },
    "setActiveSheet": function(name){
      this["activeSpreadSheet"] = this["spreadSheetObject"].getSheetByName(name);
    },
    "headerPresent": function(){
      this["activeSpreadSheet"].getRange(1, 1);
      if(this["activeSpreadSheet"].getRange(1, 1).getValues()[0][0] == "")
        return false;
      return true;
    },
    "headerValues": function(header){
        this["activeSpreadSheet"].getRange(1, 1, 1, header.length).setValues([header]);
    }
  }
}