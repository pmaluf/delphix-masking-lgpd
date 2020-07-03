// sm_shift_uni : version 1.5
// cpf_cnpj : version 1.2 -- created by: david.wells@delphix.com | original cpf/cnpj js code: daniel.stolf@delphix.com | updated by: rafael@delphix.com 

const initialNumStr = "0918273645";
const charSetNumArr = (initialNumStr + initialNumStr).split("");
// const CharShift_NumKey  = 1
// var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
const numShiftMax = 10

// position specific mapping
function myShift( a1, a2, a3) {
	return ((a1 + a2) % a3) + 1;
}

function padLeft(str, n) {
    pad = Array(n+1).join("0")
    ans = pad.substring(0, pad.length - str.length) + str
    return ans
}

CPF_REGEX = /\d{3}\.?\d{3}\.?\d{3}(?:\-|\.)?\d{2}/i
CNPJ_REGEX = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}/i
const BLACKLIST_CPF = "00000000000,11111111111,22222222222,33333333333,44444444444,55555555555,66666666666,77777777777,88888888888,99999999999";
const BLACKLIST_CNPJ ="00000000000000,11111111111111,22222222222222,33333333333333,44444444444444,55555555555555,66666666666666,77777777777777,88888888888888,99999999999999"


function isValidCNPJ (inputValue)  {

  // stripped value to just numbers 
  var cnpj = inputValue.replace(/\D/g,'');
  var maskedCnpj = inputValue;
  // A stripped CNPJ cannot have more than 14 characters
  if (cnpj.length > 14 ) return false;
  // pad original value with 0s
  maskedCnpj=padLeft(maskedCnpj, maskedCnpj.length + 14 - cnpj.length);
  cnpj = padLeft(cnpj, 14);
  // if padded original value doesn't fit the cnpj regex, return false
  if(!CNPJ_REGEX.test(maskedCnpj)) return false;
  
  // CNPJ can't be blacklisted
  if (-1 != BLACKLIST_CNPJ.indexOf(cnpj)) { return false; }

  // check verifier digit and return result
  numbers = cnpj.substr(0, 12);
  numbers += verifierDigitCNPJ(numbers);
  numbers += verifierDigitCNPJ(numbers);

  return numbers.substr(-2) === cnpj.substr(-2);
}

function isValidCPF (inputValue) {
  // stripped value to just numbers 
  var cpf = inputValue.replace(/\D/g,'');
  var maskedCpf = inputValue;
  // CPF cannot have more than 11 characters
  if (cpf.length > 11) { return false; }
  // pad original value with 0s
  maskedCpf=padLeft(maskedCpf, maskedCpf.length + 11 - cpf.length);
  cpf = padLeft(cpf, 11)
  // if padded original value doesn't fit the cpf regex, return false
  if(!CPF_REGEX.test(maskedCpf)) return false;

  // CPF can't be blacklisted
  if (-1 != BLACKLIST_CPF.indexOf(cpf)) { return false; }

  // check verifier digit and return result
  numbers = cpf.substr(0, 9);
  numbers += verifierDigitCPF(numbers);
  numbers += verifierDigitCPF(numbers);
  return numbers.substr(-2) === cpf.substr(-2);
}

/**
 * Compute the Verifier Digit (or "Dígito Verificador (DV)" in PT-BR).
 *
 * You can learn more about the algorithm on [wikipedia (pt-br)](https://pt.wikipedia.org/wiki/D%C3%ADgito_verificador)
 *
 * @param {string} numbers a string with only numbers.
 * @returns {number} the verifier digit.
 */
function verifierDigitCPF (numbers) {
    numbers = numbers.split("").map(function(number){ return parseInt(number, 10); });
  
    const modulus = numbers.length + 1;
  
    const multiplied = numbers.map(function(number, index) {
      return number * (modulus - index);
    });
  
    const mod = multiplied.reduce(function(buffer, number){
      return buffer + number;
    }) % 11;
  
    return (mod < 2 ? 0 : 11 - mod);
}

/**
* Compute the Verifier Digit ("Dígito Verificador (DV)" in portuguese) for CNPJ.
*
* [wikipedia (pt-br)](https://pt.wikipedia.org/wiki/D%C3%ADgito_verificador)
*
* @param {string} numbers the CNPJ string (only numbers)
* @returns {number} the verifier digit.
*/
function verifierDigitCNPJ (numbers) {
    index = 2;
    const reverse = numbers.split("").reduce(function(buffer, number) {
      return [parseInt(number, 10)].concat(buffer);
    }, []);
  
    const sum = reverse.reduce(function(buffer, number) {
      buffer += number * index;
      index = (index === 9 ? 2 : index + 1);
      return buffer;
    }, 0);
  
    const mod = sum % 11;
    return (mod < 2 ? 0 : 11 - mod);
}


function maskDocument (docValue, shift) {
    var N=S=0
    var shiftVal = (shift==9)? shift - 1 : shift ;
    if (! docValue) return docValue;
    // N number of digits in each document
    // S is the stop condition to shift the values
    // For CPF, we want to mask the whole value
    // FOR CNPJ OTOH, we just want to shift the first 8 digits (root) 
    //      and leave the branches alone
    if (isValidCPF(docValue)) {
        N=S=11
    } else if (isValidCNPJ(docValue)) {
        N=14
        S=8
    }
    else {
        return docValue
    }

    // pad string with 0s
    var tmp = docValue.replace(/\D/g,'');
    var numbers=padLeft(docValue, docValue.length + N - tmp.length);
    var inputArray = numbers.split("");
    var maskedNumbers = ""
    var cnt = 0;
    for (var i = 0; i < inputArray.length; i++) {
        if ( /^\d+$/.test(inputArray[i]) ) {
            if (cnt < S) {
                inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])) , numShiftMax)];
                cnt+=1
            }
            maskedNumbers+=inputArray[i]
        }
    }

    // if original value is a CPF
    if (N == 11){
        maskedNumbers = maskedNumbers.substr(0, maskedNumbers.length-2);
        maskedNumbers += verifierDigitCPF(maskedNumbers);
        inputArray[inputArray.length -2] = maskedNumbers[maskedNumbers.length -1]
        maskedNumbers += verifierDigitCPF(maskedNumbers);
        inputArray[inputArray.length - 1] = maskedNumbers[maskedNumbers.length -1]
    } 
    // else it's a CNPJ
    else {
        maskedNumbers = maskedNumbers.substr(0, maskedNumbers.length-2);
        maskedNumbers += verifierDigitCNPJ(maskedNumbers);
        inputArray[inputArray.length -2] = maskedNumbers[maskedNumbers.length -1]
        maskedNumbers += verifierDigitCNPJ(maskedNumbers);
        inputArray[inputArray.length - 1] = maskedNumbers[maskedNumbers.length -1]
    }
    return inputArray.join("");
    
}

// maskDocument("00050053965", 0)
// maskDocument("50053965", 0)
var teste_null; 
inputArray=[
    teste_null,
    "",
    "4444816309",
    "123.456.789-09",
    "123456789-09",
    "12345678909",
    "000.500.539-65", 
    "000500539-65", 
    "50053965",
    "016.500.539-40",
    "12.345.678/0001-95",
    "12345678/0001-95",
    "123456780001-95",
    "12345678000195",
    "85.153.764/0001-70", 
    "85153764000170", 
    "851537640001-70", 
    "00.153.764/0001-17", 
    "001537640001-17", 
    "153764000117",
    "DANIEL", // NOK
    "00050053967", // NOK
    "50053967", // NOK 
    "85153764000171", // NOK
]

for (CharShift_NumKey = 0; CharShift_NumKey < 9; CharShift_NumKey++){ 
    console.log(`====== numShiftVal ${CharShift_NumKey} ======`)
    resultArr = []
    for (j = 0; j < inputArray.length; j++){
        var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
        inputValue = inputArray[j]
        outputValue = maskDocument(inputValue, shiftValNum)
        if (typeof resultArr[outputValue] == 'undefined'){
            resultArr[outputValue] = inputValue;
            console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
        }
        else {
            console.log(`ERR - ${shiftValNum} - ${inputValue} : ${outputValue}`);
        }
    }
};