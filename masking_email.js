//declare variables here - not in the main script... set initial values needed
var outputValue="";
const maskInvalid = false;
const keep_domain = true;


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
var upperSpecMax=33;
var lowerSpecMax=32;
var lowerCyrMax=32;
var upperCyrMax=32;

var ArbitraryStringNum	= "Delphix delivers data at the speed of business";
var ArbitraryStringLower	= "Really love time off as I can do fancy things!";
var ArbitraryStringUpper	= "That's a simple attempt to do masking of chars";
var ArbitraryStringSpecUpper = "Accented chars look indeed extremly funny";
var ArbitraryStringSpecLower = "Lower case accents are often used in weird words";
var ArbitraryStringCyrUpper = "Cyrilic looks funny but is mostly like Latin";
var ArbitraryStringCyrLower = "Lower case cyrilic looks like uppercase but is different";

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

function padLeft(str, n) {
    pad = Array(n+1).join("0");
    ans = pad.substring(0, pad.length - str.length) + str;
    return ans;
}

/** E-mail address regular expression
* https://emailregex.com/
* there's no perfect email regex, this one validates 99.99% of the time
*/
const EMAIL_REGEX=/(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g ;

/**
* This function shifts each character and digit in a phone number 
*
* @param {string} username the phone number
* @returns {number} the masked phone number
*/
function maskUsername (username, shiftValNum, shiftValUpperCase, shiftValLowerCase) {
    var inputArray = username.split("");
    var maskedUsername = "";

    for (var i = 0; i < inputArray.length; i++) {
        if ( /\d+/.test(inputArray[i]) ) {
            inputArray[i] = charSetNumArr[myShift(shiftValNum, (charSetNumArr.indexOf(inputArray[i])) , numShiftMax)];
        } else if (/[a-z]+/.test(inputArray[i]) ){
            inputArray[i] = charSetStrArr[(charSetStrArr.indexOf(inputArray[i]))+shiftValLowerCase];
        } else if (/[A-Z]+/.test(inputArray[i]) ){
            inputArray[i] = charSetStrCapsArr[(charSetStrCapsArr.indexOf(inputArray[i]))+shiftValUpperCase];
        }
        maskedUsername+=inputArray[i]
    }
    return maskedUsername;
}

/**
* This is a place holder function to mask email domain
*
* @param {string} domain the domain address
* @returns {string} masked domain
*/
function maskDomain (domain, shiftValNum, shiftValUpperCase, shiftValLowerCase) {
    return domain;
}

function maskValue (inputValue, shiftValNum, shiftValUpperCase, shiftValLowerCase) {
    var fullEmail = inputValue[0];
    var username = inputValue[1];
    var domain = inputValue[5];

    var maskedEmail="";

    maskedEmail+= (username)? maskUsername(username, shiftValNum, shiftValUpperCase, shiftValLowerCase) : "";
    maskedEmail+= "@";
    maskedEmail+= (domain)? maskDomain(domain, shiftValNum, shiftValUpperCase, shiftValLowerCase) : "";

    return maskedEmail;
    
}

// maskDocument("00050053965", 0)
// maskDocument("50053965", 0)
var teste_null; 
inputArray= [
    'demo@delphix.com',
    'o username daniel.stolf tem email daniel.stolf@delphix.com, mas também dstolf@gmail.com',
    'o meu e-mail é daniel.stolf@delphix.com, mas também daniel-stolf_123@gmail.com',
    'o username daniel.stolf@ é daniel.stolf@delphix.com, mas também daniel-stolf_123@gmail.com',
    // 'o telefone do daniel é +55 (21) 99719-2223',
    // 'o telefone do daniel é 55 (28) 99719-2223',
    // 'o telefone do daniel é 11997192223',
    // 'o telefone do daniel é 11-997192223',
    // 'o telefone de campinas é 19 32070760',
    // 'o telefone de campinas é 11 40141111',
    // 'o telefone de campinas é 11 50141111',
    // 'o telefone de campinas é 11 70141111'
]

for (CharShift_NumKey = 1; CharShift_NumKey < 9; CharShift_NumKey++){ 
    console.log(`====== numShiftVal ${CharShift_NumKey} ======`)
    var CharShift_LowerCaseKey=CharShift_UpperCaseKey=CharShift_NumKey;
    var shiftValLowerCase = parseInt(CharShift_LowerCaseKey, 10)+1;
    var shiftValUpperCase = parseInt(CharShift_UpperCaseKey, 10)+1;
    for (var j = 0; j < inputArray.length; j++){

        var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
        var inputValue = inputArray[j]
        // outputValue = maskDocument(inputValue, shiftValNum)
        var outputValue = (inputValue)? inputValue.replace(EMAIL_REGEX,function($1,$2,$3,$4, $5, $6){ return maskValue([$1, $2, $3, $4, $5, $6], shiftValNum, shiftValLowerCase, shiftValUpperCase) ;}) : inputValue;
        console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
    }
};
