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

/** [2,3]\d{3}-?\d{4} - número fixo (8 dígitos)
* 4[0-9][1-9]\d-?\d{4} - número fixo (8 dígitos)
* 5[0-9]\d{2}-?\d{4} - número fíxo (8 dígitos)
*                      57 fixo rural
* 9\d{4}-?\d{4} - número móvel (9 dígitos)
* 7[0,7,8,9]\d{2}-?\d{4} - móvel rádio (8 dígitos)
* https://www.anatel.gov.br/setorregulado/plano-de-numeracao-brasileiro
* https://pt.wikipedia.org/wiki/N%C3%BAmeros_de_telefone_no_Brasil
*/
const TEL_REGEX=/(\+?55 ?)?\(?(1[1-9]|2[1,2,4,7,8]|3[1-5,7,8]|4[1-9]|5[1,3,4,5]|6[1-9]|7[1,3,4,5,7,9]|8[1-9]|9[1-9])?\)?[ -]?([2,3]\d{3}-?\d{4}|4[0-9][1-9]\d-?\d{4}|5[0-9]\d{2}-?\d{4}|9\d{4}-?\d{4}|7[0,7,8,9]\d{2}-?\d{4})/g

/**
* This function shifts each digit in a phone number 
*
* @param {string} numbers the phone number
* @returns {number} the masked phone number
*/
function maskPhoneNumber (numbers, shiftVal) {
    var inputArray = numbers.split("");
    var maskedNumbers = ""
    var s=0;
    if (/[2,3]\d{3}-?\d{4}/.test(numbers)) {
        maskedNumbers+=numbers.substring(0,1);
        s=1;
    } else if (/4[0-9][1-9]\d-?\d{4}/.test(numbers)) {
        maskedNumbers+=numbers.substring(0,2);
        s=3;
    } else if (/5[0-9]\d{2}-?\d{4}/.test(numbers)) {
        maskedNumbers+=numbers.substring(0,1);
        s=1;
    } else if (/9\d{4}-?\d{4}/.test(numbers)) {
        maskedNumbers+=numbers.substring(0,1);
        s=1;
    } else if (/7[0,7,8,9]\d{2}-?\d{4}/.test(numbers)) {
        maskedNumbers+=numbers.substring(0,2);
        s=2;
    }

    for (var i = s; i < inputArray.length; i++) {
        if ( /^\d+$/.test(inputArray[i]) ) {
            inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])) , numShiftMax)];
        }
        maskedNumbers+=inputArray[i]
    }
    return maskedNumbers
}


// 1[1-9]|2[1,2,4,7,8]|3[1-5,7,8]|4[1-9]|5[1,3,4,5]|6[1-9]|7[1,3,4,5,7,9]|8[1-9]|9[1-9]
const VALID_LOCAL_CODES = [
    [],
    ['1','2','3','4','5','6','7','8','9'],
    ['1','2','4','7','8'],
    ['1','2','3','4','5','7','8'],
    ['1','2','3','4','5','6','7','8','9'],
    ['1','3','4','5'],
    ['1','2','3','4','5','6','7','8','9'],
    ['1','3','4','5','7','9'],
    ['1','2','3','4','5','6','7','8','9'],
    ['1','2','3','4','5','6','7','8','9'],
    ['1','2','3','4','5','6','7','8','9']
]
/**
* This function will return a valid brazilian local area code
* The first digit will be shifted, while the second will be picked from a list of valid options
*
* @param {string} numbers the local area code
* @returns {number} the local area code
*/
function maskLocalAreaCode (numbers, shiftval) {
    var inputArray = numbers.split("");
    firstDigit = charSetNumArr[myShift(shiftval, (charSetNumArr.indexOf(inputArray[0])) , numShiftMax)];
    firstDigit = (firstDigit=="0")? 1 : firstDigit;
    tmp = VALID_LOCAL_CODES[firstDigit]
    pos = tmp.length%parseInt(firstDigit)
    secondDigit = tmp[(tmp.length-1)%parseInt(firstDigit)]
    result=firstDigit+secondDigit;
    return result
}

/**
* This is a place holder function to mask country code
*
* @param {string} numbers the country code
* @returns {number} the country code
*/
function maskCountryCode (numbers, shiftVal) {
    return numbers
}


function maskValue (inputValue, shift) {
    // inputValue array = 0 - fullPhoneNo, 1 - countryCode, 2 - localCode, 3 - phoneNo
    var fullPhoneNo = inputValue[0];
    var countryCode = inputValue[1];
    var localCode = inputValue[2];
    var phoneNo = inputValue[3];

    var shiftVal = (shift==9)? shift - 1 : shift ;

    var maskedNumbers="";
    // console .log("countryCode "+countryCode+" localCode "+ localCode+ " phoneNo "+phoneNo)
    maskedNumbers+= (countryCode)? maskCountryCode(countryCode, shiftVal) : "";
    maskedNumbers+= (localCode)? maskLocalAreaCode(localCode, shiftVal) : "";
    maskedNumbers+= (phoneNo)? maskPhoneNumber(phoneNo, shiftVal) : "";

    maskedNumbers=maskedNumbers.replace(/\D/g,'');
    var j=0
    var result=fullPhoneNo;
    for (var i = 0;i<maskedNumbers.length;i++){
        while (/\D/.test(result[j])) {
            j+=1 ;
        }
        result=result.replaceAt(j, maskedNumbers[i]);
        j+=1;
    }


    return result;
    
}
// maskDocument("00050053965", 0)
// maskDocument("50053965", 0)
var teste_null; 
inputArray= [
    '(011) 38530855',
    '11 2132-3122',
    // '+55(021)2132-5252',
    // '+55(21)2132-5252',
    // '+55 21 2132-5252',
    '21 2132-5252',
    '21 3423-9397',
    // '+55 21 3423-9397',
    // '(21) 3423-9397',
    // '021 3423-9397',
]

// 1, 3, 5, 9
for (CharShift_NumKey = 0; CharShift_NumKey < 10; CharShift_NumKey++){ 
    console.log(`====== numShiftVal ${CharShift_NumKey} ======`)
    for (var j = 0; j < inputArray.length; j++){
        var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
        var inputValue = inputArray[j]
        // outputValue = maskDocument(inputValue, shiftValNum)
        var outputValue = (inputValue)? inputValue.replace(TEL_REGEX,function($1,$2,$3,$4){ return maskValue([$1, $2, $3, $4], shiftValNum) ;}) : inputValue;
        console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
    }
};
