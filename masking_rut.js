// sm_shift_uni : version 1.5
// cpf_cnpj : version 1.2 -- created by: david.wells@delphix.com | original cpf/cnpj js code: daniel.stolf@delphix.com | updated by: rafael@delphix.com 

// const CharShift_NumKey  = 1
// var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
const numShiftMax = 10

const initialNumStr = "0918273645";
const charSetNumArr = (initialNumStr + initialNumStr).split("");


const STRICT_STRIP_REGEX_RUT = /[.-]/g;
const LOOSE_STRIP_REGEX_RUT = /[^\d]/g;
const keep_first=0;
const leading0 = true



// position specific mapping
function myShift( a1, a2, a3) {
	return ((a1 + a2) % a3) + 1;
}

function padLeft(str, n) {
    pad = Array(n).join("0")
    ans = pad.substring(0, pad.length - str.length) + str
    return ans
}

const BLACKLIST_RUT = "000000000,111111111,222222222,333333333,444444444,555555555,666666666,777777777,888888888,999999999,123456785";


function verifierDigitRUT(inputValue)    //digito verificador
{  
      var T=parseInt(inputValue)
      var M=0,S=1;
	  for(;T;T=Math.floor(T/10))
      S=(S+T%10*(9-M++%6))%11;
	  return S?S-1:'k';
      
}

// const RUT_REGEX = /^\d{1,2}\.?\d{1,3}\.?\d{1,3}(?:\-?(?:\d{1}|k|K))?$/i
// /^.*(?<!\d|-|\/|\.)\b(\d{1,2}\.?\d{1,3}\.?\d{1,3}(?:\-?(?:\d{1}|k|K))?)(?!\d|-|\/|\.)\b.*$
const RUT_REGEX = /\b(\d{1,2}\.?\d{1,3}\.?\d{1,3}(?:\-?(?:\d{1}|k|K))?)(?!\d|-|\/|\.)\b/gi

var regex = RUT_REGEX

regex.x = {
	gRegex: /\b(\d{1,2}\.?\d{1,3}\.?\d{1,3}(?:\-?(?:\d{1}|k|K))?)(?!\d|-|\/|\.)\b/gi,
	startLb: {
		regex: /(\d|-|\/|\.)$/,
		type: false
	}
};


function lookbehind (data, regex, match) {
	return (
		(regex.x.startLb ? (regex.x.startLb.regex.test(data.substring(0, match.index)) === regex.x.startLb.type) : true) &&
		(regex.x.endLb ? (regex.x.endLb.regex.test(data.substring(0, regex.x.gRegex.lastIndex)) === regex.x.endLb.type) : true)
	);
}


function isValidRUT (fullRUT) {
   // if it doesn't fit the RUT regex, return false
   if(!RUT_REGEX.test(fullRUT)) return false;
   var tmp = fullRUT.replace(/\D/g,'');
   var dgv = tmp[tmp.length - 1];
   var rut = tmp.slice(0, -1)
   return verifierDigitRUT(rut)==dgv
}






function maskDocument (inputValue, shiftValNum) {
    // if input is not a valit RUT RegEx, does nothing
    // if(!RUT_REGEX.test(inputValue)) return inputValue;

    var shiftVal = (shiftValNum==9)? shiftValNum + parseInt(inputValue[0]) : shiftValNum ;


    var inputArray = inputValue.split("");
    for (var i = 0; i < inputArray.length; i++) {
        if ( /^\d+$/.test(inputArray[i]) ) inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])) , numShiftMax)];
    }

    if (isValidRUT(inputValue)){
        rut = inputArray.slice(0, -1).join("");
        strippedRut = rut.replace(/\D/g,'');
        dgv=verifierDigitRUT(strippedRut);
        outputValue=rut+dgv
    } else {
        outputValue = inputArray.join("");
    }
    return outputValue;
}

function maskValue(inputValue, shiftValNum){
    var result = '',
        match,
        lastLastIndex = 0;
    while (match = regex.x.gRegex.exec(inputValue)) {
        /* If the match is preceded/not by start lookbehind, and the end of the match is preceded/not by end lookbehind */
        if (lookbehind(inputValue, regex, match)) {
            /* replacement can be a function */
            result += inputValue.substring(lastLastIndex, match.index) + match[0].replace(regex, maskDocument(match[0], shiftValNum));
            if(!regex.global){
                lastLastIndex = regex.gRegex.lastIndex;
                break;
            }
        /* If the inner pattern matched, but the leading or trailing lookbehind failed */
        } else {
            result += match[0].charAt(0);
            /* Set the regex to try again one character after the failed position, rather than at the end of the last match */
            regex.x.gRegex.lastIndex = match.index + 1;
        }
        lastLastIndex = regex.x.gRegex.lastIndex;
    }
    result += inputValue.substring(lastLastIndex);
    return result;
}


// inputValue="026.056.718-42"


inputArray=[
    "34567890-5",
    "12345678-5",
    "01234567-4",
    "o rut do cristian é esse aqui 01234567-4 né?"
]

for (CharShift_NumKey = 0; CharShift_NumKey < 10; CharShift_NumKey++){ 
    console.log(`====== numShiftVal ${CharShift_NumKey} ======`)
    resultArr = []
    for (j = 0; j < inputArray.length; j++){
        var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
        inputValue = inputArray[j]
        outputValue = maskValue(inputValue, shiftValNum)
        if (typeof resultArr[outputValue] == 'undefined'){
            resultArr[outputValue] = inputValue;
            console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
        }
        else {
            console.log(`ERR - ${shiftValNum} - ${inputValue} : ${outputValue}`);
        }
    }
};