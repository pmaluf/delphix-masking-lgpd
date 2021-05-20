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

// Choose true to mask invalid numbers (even if both (CPF/CNPJ) validations fail).
// Note: When masking invalid, the verifying digits won't be generated
const maskInvalid = false

// Choose true to mask leading 0s, or false to ignore leading 0s.
const maskLeading0=false;

// choose missing digit tolerance, leave just on DOCTO_REGEX declaration
// higher tolerance = worse performance
// low tolerance non-multiline DOCTO_REGEX 
// const DOCTO_REGEX = /^\b((\d{1,2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})|(\d{2,3}\.?\d{3}\.?\d{3}(?:\-|\.)?\d{2}))\b(?!\d|-|\/|\.)$/g

// ultra high tolerance non-multiline DOCTO_REGEX 
const DOCTO_REGEX = /^\b((\d{1,3}\.?\d{1,3}\.?\d{1,3}(?:\-|\.)?\d{2})|(\d{0,2}\.?\d{0,3}\.?\d{0,3}\/?\d{1,4}\-?\d{2}))\b(?!\d|-|\/|\.)$/g

// zero tolerance DOCTO_REGEX - 1 missing digit tolerance
// const DOCTO_REGEX = /^\b((\d{3}\.?\d{3}\.?\d{3}(?:\-|\.)?\d{2})|(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}))\b(?!\d|-|\/|\.)$/g
// negative look behind /(?<!\d|-|\/|\.)((\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})|(\d{3}\.?\d{3}\.?\d{3}(?:\-|\.)?\d{2}))(?!\d|-|\/|\.)/g

// low tolerance DOCTO_REGEX - 1 missing digit tolerance
// const DOCTO_REGEX = /^\b((\d{1,3}\.?\d{3}\.?\d{3}(?:\-|\.)?\d{2})|(\d{1,2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}))\b(?!\d|-|\/|\.)$/g

// medium tolerance DOCTO_REGEX - 2 missing digit tolerance
// const DOCTO_REGEX = /^\b((\d{2,3}\.?\d{2,3}\.?\d{3}(?:\-|\.)?\d{2})|(\d{1,2}\.?\d{2,3}\.?\d{3}\/?\d{4}\-?\d{2}))\b(?!\d|-|\/|\.)$/g

// high tolerance DOCTO_REGEX - up to 6 missing digit tolerance
// const DOCTO_REGEX = /(?<!\d|-|\/|\.)((\d{1,2}\.?\d{1,3}\.?\d{1,3}\/?\d{4}\-?\d{2})|(\d{1,3}\.?\d{1,3}\.?\d{1,3}(?:\-|\.)?\d{2}))(?!\d|-|\/|\.)/g

const BLACKLIST_CPF = "00000000000,11111111111,22222222222,33333333333,44444444444,55555555555,66666666666,77777777777,88888888888,99999999999";
const BLACKLIST_CNPJ ="00000000000000,11111111111111,22222222222222,33333333333333,44444444444444,55555555555555,66666666666666,77777777777777,88888888888888,99999999999999"


function isValidCNPJ (inputValue)  {

  // stripped value to just numbers 
  var cnpj = inputValue.replace(/\D/g,'');
  // A stripped CNPJ cannot have more than 14 characters
  if (cnpj.length > 14 ) return false;
  
  /** we don't test for CNPJ_REGEX anymore, as this is being validated in the input **/
  // // if padded original value doesn't fit the cnpj regex, return false
  // var formattedCnpj = inputValue;
  // if(!CNPJ_REGEX.test(formattedCnpj)) return false;
  // formattedCnpj=padLeft(formattedCnpj, formattedCnpj.length + 14 - cnpj.length);
  
  // pad original value with 0s
  cnpj = padLeft(cnpj, 14);

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
  // CPF cannot have more than 11 characters
  if (cpf.length > 11) { return false; }
  
  /** we don't test for CPF_REGEX anymore, as this is being validated in the input **/
  // var formattedCpf = inputValue;
  // formattedCpf=padLeft(formattedCpf, formattedCpf.length + 11 - cpf.length);
  // // if padded original value doesn't fit the cpf regex, return false
  // if(!CPF_REGEX.test(formattedCpf)) return false;

  // pad original value with 0s
  cpf = padLeft(cpf, 11);

  // CPF can't be blacklisted.
  // We also ignore srings that star with 8 consecutive 0s, as there's a relatively
  // high chance (1%) of random sring in this pattern being a valid CPF number
  var allZ=/^0{8}/i;
  if (allZ.test(cpf)) return false;
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
 * @param {string} input a string with only numbers.
 * @returns {number} the verifier digit.
 */
function verifierDigitCPF (input) {
    var numbers = input.toString();
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
function verifierDigitCNPJ (input) {
    var numbers = input.toString();
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


function maskValue (inputArray, shift) {
    var N=S=0
    var shiftVal = (shift==9)? shift - 1 : shift ;
    var inputDoc = inputArray[0];
    var cpf = inputArray[1];
    var cnpj = inputArray[2];
    var docValue
    var validatedDoc = false;
    /* CPF
     * N number of digits in each document
     * S is the stop condition to shift the values
     * For CPF, we want to mask the whole value
     */
    if ( cpf && isValidCPF(cpf) ){
        // console.log("CPF");
        docValue  =cpf;//.trim().replace(/\s+$/, '');
        validatedDoc=true
        N=11;
        S=9;
    /* CNPJ
     * FOR CNPJ OTOH, we just want to shift the first 8 digits (root) 
     * and leave the branches untouched
     */
    } else if (cnpj && isValidCNPJ(cnpj)){
        // console.log("CNPJ");
        docValue  =cnpj;//.trim().replace(/\s+$/, '');
        validatedDoc=true
        N=14;
        S=8;
    /* Invalid Document
     * shift everyhing
     */
    } else {
        // if the regex tolerance is too high, the capture groups might no help much
        // but SOMETHING was captured, so we give one last try with the main capture
        if (!cpf && isValidCPF(inputDoc)){
            // console.log("CPF");
            docValue  =inputDoc;//.trim().replace(/\s+$/, '');
            validatedDoc=true
            N=11;
            S=9;
        } else if(!cnpj && isValidCNPJ(inputDoc)){
            // console.log("CNPJ");
            docValue  =inputDoc;//.trim().replace(/\s+$/, '');
            validatedDoc=true
            N=14;
            S=8;
        }else {
            if (! maskInvalid) return inputDoc;
            docValue = inputDoc.trim().replace(/\s+$/, '');
            N=S=20;
        } 
    }
    // pad string with 0s
    var tmp = docValue.replace(/\D/g,'');
    if (tmp.length==0) return docValue;
    var numbers=padLeft(docValue, docValue.length + N - tmp.length);
    var diff = numbers.length - docValue.length;
    var inputArray = numbers.split("");
    var maskedNumbers = ""
    var cnt = 0;
    var i=0;
    var previous = "0"
    // while (!maskLeading0 && cnt < S){
    //     if (inputArray[i]=="0" ){
    //         cnt+=1;
    //         maskedNumbers+=inputArray[i];
    //     }
    //     else if (/\d/.test(inputArray[i])){
    //         previous = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(previous)) , numShiftMax)];
    //         // previous=inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])+charSetNumArr.indexOf(previous)) , numShiftMax)];
    //         // i+=1;
    //         // cnt+=1;
    //         break;
    //     }
    //     i+=1;
    // }

    // if (cnt == S) {
    //     cnt-=1;
    //     i-=1;
    //     diff = (diff >= S)? S-1 : diff ;
    // }

    // // cool implementation of the same logic in the loop above, but ultimately with the same performance.
    // // just couldn't erase it
    if (!maskLeading0){
        var zeroRegEx=/^(0\.?){1,8}/g
        segment=numbers.match(zeroRegEx);
        if (segment){
            i=segment[0].length;
            maskedNumbers=segment[0].replace(/\D/g,'');
            cnt=maskedNumbers.length;
        }
    }
    for (; i < inputArray.length; i++) {
        if ( /^\d+$/.test(inputArray[i]) ) {   
            if (cnt < S) {
                inputArray[i] = charSetNumArr[myShift(shiftVal, (charSetNumArr.indexOf(inputArray[i])+charSetNumArr.indexOf(previous)) , numShiftMax)];
                previous="0";

                cnt+=1
            }
            maskedNumbers+=inputArray[i]
        }
    }

    // if original value was a CPF
    if (N == 11 && validatedDoc){
        maskedNumbers = maskedNumbers.substr(0, maskedNumbers.length-2);
        maskedNumbers += verifierDigitCPF(maskedNumbers);
        inputArray[inputArray.length -2] = maskedNumbers[maskedNumbers.length -1]
        maskedNumbers += verifierDigitCPF(maskedNumbers);
        inputArray[inputArray.length - 1] = maskedNumbers[maskedNumbers.length -1]
    } 
    // if original value was a CNPJ
    else if (N==14 && validatedDoc) {
        maskedNumbers = maskedNumbers.substr(0, maskedNumbers.length-2);
        maskedNumbers += verifierDigitCNPJ(maskedNumbers);
        inputArray[inputArray.length -2] = maskedNumbers[maskedNumbers.length -1]
        maskedNumbers += verifierDigitCNPJ(maskedNumbers);
        inputArray[inputArray.length - 1] = maskedNumbers[maskedNumbers.length -1]
    }
    // else original value wasn't a valid document and there'se no VD calculation

    if (!maskLeading0) return inputArray.join("").slice(diff);
    return inputArray.join("");
}

var teste_null; 
inputArray=[
    // ALL ZEROES
    '441978533',
    '00441978533',
    '04541978539',
    '05856275926',
    '40856275972',
    "123.456.789-09",
    "012.345.678-90",
    // "531.042.910-71, 531042910-71 53104291071 531.042.91071 74143033900 741430339-00 74143033-900 42.583.107/0001-50;42.583.107/000150, 425831070001-50,42583107000150 42583107000-150 42583107/0001-50",
]

console.time("total-execution")
for (CharShift_NumKey = 0; CharShift_NumKey < 10; CharShift_NumKey++){ 
    resultArr = []
    var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
    console.log(`====== shiftValNum ${shiftValNum} ======`)
    for (j = 0; j < inputArray.length; j++){
        inputValue = inputArray[j]
        // outputValue = maskDocument(inputValue, shiftValNum)
        console.time("single-execution");
        outputValue = (inputValue)? inputValue.replace(DOCTO_REGEX,function($0, $1, $2, $3, $4, $5, $6){ return maskValue([$0, $2, $3], shiftValNum) ;}) : inputValue;
        console.timeEnd("single-execution");
        // outputValue = (inputValue)? inputValue.replace(DOCTO_REGEX,function($0, $1, $2, $3, $4, $5, $6){ console.log($6) ; return ""}) : inputValue;
        if (typeof resultArr[outputValue] == 'undefined'){
            resultArr[outputValue] = inputValue;
            if (inputValue == outputValue){
                if (isValidCPF(inputValue)){
                    console.log(`UNC - CPF - ${shiftValNum} - ${inputValue} : ${outputValue}`);
                }
                else if (isValidCNPJ(inputValue)){
                    console.log(`UNC - CNPJ - ${shiftValNum} - ${inputValue} : ${outputValue}`);
                }
                else{
                    console.log(`UNC - INV - ${shiftValNum} - ${inputValue} : ${outputValue}`);
                }
                
            } else {
                console.log(`OK  - ${shiftValNum} - ${inputValue} : ${outputValue}`);
            }
            // console.log(`OK  - ${shiftValNum} - ${outputValue}`);
        }
        else {
            console.log(`DUP - ${shiftValNum} - ${inputValue} : ${outputValue}`);
        }
    }
};
console.timeEnd("total-execution")

// // Reeeeeeally overly complicated test to validate all possible CPF documents and check for possible duplicated masked values
// // Took 1h to test 100M values for shiftVal=1, no duplicate found
// // Full test for 1 shift value (1B documents) would use up to 160GB of RAM (B-Tree) and last 1 day 
// Number.prototype.pad = function(size) {
//     var sign = Math.sign(this) === -1 ? '-' : '';
//     return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size).toString();
// }

// function reverseString (str) {
//     return str.split('').reduce((reversed, character) => character + reversed, '')
//   }

// class Node {
//     constructor(original, masked) {
//       this.masked = parseInt(reverseString(masked));
//       this.original = [original];
//       this.right = null;
//       this.left = null;
//       this.count = 0;
//     };

//     addOriginal (value){
//         this.original.push(value)
//     }
// };


// class BST {
//     constructor() {
//       this.root = null;
//     }
    
//     create(original, masked) {
//       const newNode = new Node(original, masked);
//       var value=parseInt(reverseString(masked));
//       if (!this.root) {
//         this.root = newNode;
//         return this;
//       };
//       let current = this.root;
  
//       const addSide = side => {
//         if (!current[side]) {
//           current[side] = newNode;
//           return this;
//         };
//         current = current[side];
//       };
  
//       while (true) {
//         if (value === current.masked) {
//           current.count++;
//           return this;
//         };
//         if (value < current.masked) addSide('left');
//         else addSide('right');
//       };
//     };

//     find(input) {
//         if (!this.root) return undefined;
//         let current = this.root,
//             found = false;
//         let value = parseInt(reverseString(input));
//         while (current && !found) {
//           if (value < current.masked) current = current.left;
//           else if (value > current.masked) current = current.right;
//           else found = true;
//         };
//         if (!found) return false;
//         return current;
//     };
//   };

// for (CharShift_NumKey = 0; CharShift_NumKey < 10; CharShift_NumKey++){ 
//     var resultTree = new BST();
//     var shiftValNum = parseInt(CharShift_NumKey, 10)+1;
//     console.log(`====== shiftValNum ${shiftValNum} ======`)
//     console.time("total-execution");
//     console.time("single-execution");
//     for (var baseCpfNum = 0; baseCpfNum <= 999999999; baseCpfNum++){
//         fullCpf = baseCpfNum.pad(9);
//         fullCpf = fullCpf + verifierDigitCPF(fullCpf);
//         fullCpf += verifierDigitCPF(fullCpf);
        
//         outputValue = (fullCpf)? fullCpf.replace(DOCTO_REGEX,function($0, $1, $2, $3, $4, $5, $6){ return maskValue([$0, $2, $3], shiftValNum) ;}) : fullCpf;
        
//         // console.time("search");
//         var found = resultTree.find(outputValue);
//         // console.timeEnd("search");
//         if (!found){
//             // console.time("create");
//             resultTree.create(fullCpf,outputValue)
//             // console.timeEnd("create");
//         } else {
//             console.log(`DUP - ${shiftValNum} - ${fullCpf} : ${found.original} :${outputValue}`);
//             console.log(found.original);
//             found.addOriginal(fullCpf);
//         }
//         if (baseCpfNum % 1000000 == 0 ){
//             console.timeEnd("single-execution");
//             console.time("single-execution");
//         }
//     }
//     console.timeEnd("total-execution");
// }