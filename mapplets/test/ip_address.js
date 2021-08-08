//declare variables here - not in the main script... set initial values needed
var outputValue="";
const maskInvalid = false


//
var last = null;
var initialNumStr		= "0918273645";
var initialLowerCaseStr	= "abcdefghijklmnopqrstuvwxyz";
var initialUpperCaseStr  = "ZYXWVUTSRQPONMLKJIHGFEDCBA";
var initialUpperSpecStr  = "ÀÁÂÃÄÅÆÈÉÊËÇÌÍÎÏÑÐŠÒÓÔÕÖŐÙÚÛÜŰÝŸŽ"
var initialLowerSpecStr  = "àáâãäåæèéêëçìíîïñšòóôõöðùúûüűÿýž"
var initialUpperCyrStr  = "AБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
var initialLowerCyrStr  = "Aбвгдежзийклмнопрстуфхцчшщъыьэюя"

var numShiftMax = 10;
var lowerShiftMax=26;   //14;
var upperShiftMax=26;  //21;
var upperSpecMax=33
var lowerSpecMax=32
var lowerCyrMax=32
var upperCyrMax=32

var ArbitraryStringNum	= "Delphix delivers data at the speed of business"
var ArbitraryStringLower	= "Really love time off as I can do fancy things!"
var ArbitraryStringUpper	= "That's a simple attempt to do masking of chars"
var ArbitraryStringSpecUpper = "Accented chars look indeed extremly funny"
var ArbitraryStringSpecLower = "Lower case accents are often used in weird words"
var ArbitraryStringCyrUpper = "Cyrilic looks funny but is mostly like Latin"
var ArbitraryStringCyrLower = "Lower case cyrilic looks like uppercase but is different"

// Double the length of the lookup strings so we don't get overflows...cheap way to deal with that
var charSetNumArr  		= (initialNumStr + initialNumStr).split("");
var charSetStrArr	 	= (initialLowerCaseStr + initialLowerCaseStr).split("");
var charSetStrCapsArr 	= (initialUpperCaseStr + initialUpperCaseStr).split("");
var charSetUpperSpec 	= (initialUpperSpecStr + initialUpperSpecStr).split("");
var charSetLowerSpec 	= (initialLowerSpecStr + initialLowerSpecStr).split("");
var charSetUpperCyr 	= (initialUpperCyrStr + initialUpperCyrStr).split("");
var charSetLowerCyr 	= (initialLowerCyrStr + initialLowerCyrStr).split("");

// Use SL encyrption hash to create shift values
var CharShift_NumKey       = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringNum,numShiftMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_UpperCaseKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringUpper,upperShiftMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_LowerCaseKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringLower,lowerShiftMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_UpperSpecKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringSpecUpper,upperSpecMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_LowerSpecKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringSpecLower,lowerSpecMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_UpperCyrKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringCyrUpper,upperCyrMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");
var CharShift_LowerCyrKey = 5;//com.masking.encryption.Encryption.getLookupKey(ArbitraryStringCyrLower,lowerCyrMax,  "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/RawBytes.dat", "/var/delphix/dmsuite/resources/keys/Alias.dat");


//Add one to the hash since it can be zero - the ShiftMax values can't be more than the length of the inital string - 1
var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
var shiftValLowerCase = parseInt(CharShift_LowerCaseKey, 10)+1;
var shiftValUpperCase = parseInt(CharShift_UpperCaseKey, 10)+1;
var shiftValUpperSpec = parseInt(CharShift_UpperSpecKey, 10)+1;
var shiftValLowerSpec = parseInt(CharShift_LowerSpecKey, 10)+1;
var shiftValUpperCyr = parseInt(CharShift_UpperCyrKey, 10)+1;
var shiftValLowerCyr = parseInt(CharShift_LowerCyrKey, 10)+1;
  
const IP_REGEX=/^\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b$/g

// position specific mapping
function myShift( a1, a2, a3) {
	return ((a1 + a2) % a3) + 1;
}

// custom repleaceAt function to String prototype
// replace character by replacement at index
String.prototype.replaceAt = function(index, replacement){
    if (index >= this.length){
        return this.valueOf();
    }
    return this.substring(0, index) + replacement + this.substring(index+1);
}



function maskValue (inputValue, shift) {
    console.time("single-execution");
    // inputValue array = 0 - fullPhoneNo, 1 - countryCode, 2 - localCode, 3 - phoneNo
    var inputArray = inputValue.split("");

    var shiftVal = (shift==9)? shift - 1 : shift ;

    var maskValue = false ;
    for (var i = 0;i<inputArray.length;i++){

        if (!maskValue && inputArray[i]==".") maskValue = true
        if ( /^\d$/.test(inputArray[i]) && maskValue) {
           inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])) , numShiftMax)];
        }
    }

    var result = inputArray.join("");
    console.timeEnd("single-execution");
    return result;
    
}
// maskDocument("00050053965", 0)
// maskDocument("50053965", 0)
var teste_null; 
inputArray= [
    '169.254.213.182'
]

for (CharShift_NumKey = 4; CharShift_NumKey < 5; CharShift_NumKey++){ 
    console.log(`====== numShiftVal ${CharShift_NumKey} ======`)
    for (var j = 0; j < inputArray.length; j++){
        var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
        var inputValue = inputArray[j]
        // outputValue = maskDocument(inputValue, shiftValNum)
        var outputValue = (inputValue)? inputValue.replace(IP_REGEX,function($0){ return maskValue($0, shiftValNum) ;}) : inputValue;
        console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
    }
};