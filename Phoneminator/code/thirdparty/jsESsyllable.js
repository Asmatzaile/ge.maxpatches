
var regexStep1 = [];
var cutPositionsStep1 = [];

var regexStep2 = [];
var cutPositionsStep2 = [];

//STEP 1
//^V+C => V+|C
regexStep1.push(/^[aeiouáéíóúü]+([^aeiouáéíóúü]|$)/);
cutPositionsStep1.push(0);

//^CV+C => CV+|C
regexStep1.push(/^[^aeiouáéíóúü][aeiouáéíóúü]+([^aeiouáéíóúü]|$)/);
cutPositionsStep1.push(0);

//^CCVC => C|CVC V|C[rlh]VC
regexStep1.push(/^[^aeiouáéíóúü][^aeiouáéíóúü][aeiouáéíóúü]+([^aeiouáéíóúü]|$)/);
cutPositionsStep1.push(1);

//^CCCV => VCC|CV VC|C[rl]V
regexStep1.push(/^[^aeiouáéíóúü][^aeiouáéíóúü][^aeiouáéíóúü][aeiouáéíóúü]+([^aeiouáéíóúü]|$)/);
cutPositionsStep1.push(2);

//VCCCCV => VCC|CCV
regexStep1.push(/^[^aeiouáéíóúü][^aeiouáéíóúü][^aeiouáéíóúü][^aeiouáéíóúü][aeiouáéíóúü]+([^aeiouáéíóúü]|$)/);
cutPositionsStep1.push(3);

//V+$ => END
regexStep1.push(/^[aeiouáéíóúü]+$/);
cutPositionsStep1.push(-1);

//C+$ => END
regexStep1.push(/^[^aeiouáéíóúü]+$/);
cutPositionsStep1.push(-1);

//STEP 2
regexStep2.push(/[aeoáéó][aeoáéó]/);
cutPositionsStep2.push(1);

regexStep2.push(/[íú][aeo]/);
cutPositionsStep2.push(1);

regexStep2.push(/[aeo][íú]/);
cutPositionsStep2.push(1);

regexStep2.push(/[iuüíú][aeoáéó][aeoáéó]/);
cutPositionsStep2.push(2);

regexStep2.push(/[aeoáéó][aeoáéó][iuüíú]/);
cutPositionsStep2.push(1);

//END
regexStep2.push(/.*/);
cutPositionsStep2.push(-1);

//divide a word in syllables
//word - Word to divide (string)
//return array of syllables (string)
function divide(word){
	
  word = word.toLowerCase().trim();    
  var cutPosition = 0;
  var syllables = [];
  var finalSyllables = [];
  var head = "";
  var securityBreak = 0;
  var end = false;

  //STEP 1
  while(!end){
    ++securityBreak;
    if(securityBreak > 20){//break infinite loop
      throw "Error processing word";
      return "";
    }
    for(var i = 0; i < regexStep1.length; ++i){
      var match = word.match(regexStep1[i]);
      if(match){
        var m = match[0];
        cutPosition = cutPositionsStep1[i];
        if(cutPosition < 0){//negative value means end
          syllables.push(head+m);
          end = true;
        } else {
          var cutChar = m[cutPosition];
          if((cutChar == 'r') || (cutChar == 'l') || (cutChar == 'h')){
            cutPosition--;
          }
          if(cutPosition < 0)
            cutPosition = 0;
          syllables.push(head+m.substring(0,cutPosition));
          head = m.substring(cutPosition,m.length-1);
        }

        word = word.substring(m.length-1);
        //console.log("regexStep1: "+i+"   m: "+m+"   head: "+head+"   word: "+word+"    cutPosition: "+cutPosition);
      }
    }
  }
  //console.log(syllables);

  //STEP 2
  for(var s = 0; s < syllables.length; ++s){
    var sillable = syllables[s];
    if(sillable == "")
      continue;

    for(var i = 0; i < regexStep2.length; ++i){
      var match = sillable.match(regexStep2[i]);
      if(match){
        if(cutPositionsStep2[i] < 0){
          finalSyllables.push(sillable);
        }else{
          var cutPosition = match.index + cutPositionsStep2[i];
          finalSyllables.push(sillable.substring(0,cutPosition));
          finalSyllables.push(sillable.substring(cutPosition));
        }
        //console.log("regexStep2: "+i+"   m: "+match[0]+"   sillable: "+sillable+"    cutPosition: "+cutPositionsStep2[i]);
        break;
      }
    }
  }
  //console.log(finalSyllables);  
	outlet(0,finalSyllables);
	return(finalSyllables);
}



//Calculate position of stress syllable
//syllables - array of syllables (string)
//return the position of stress syllable
function stress(syllables) {
	
  if(typeof syllables === 'string'){
    syllables = divide(syllables);
  }


  if(syllables.length == 1){
	outlet(0,0);
	return 0;
  }

  //accent mark?
  for(var i = 0; i < syllables.length; ++i){
    if(syllables[i].match(/[áéíóú]/)){
      //console.log("tilde: "+i);
	  outlet(0,i);
      return i;
    }
  }

  //no accent mark
  if(syllables[syllables.length-1].match(/.*[nsaeiou]$/)){
    //console.log("no tilde, end with 'nsaeiou'");
    outlet(0,syllables.length-2);
	return syllables.length-2;
  } else {
    //console.log("no tilde, no end with 'nsaeiou'");
    outlet(0,syllables.length-1);
	return syllables.length-1;
  }
}






function difficulty(syllables){
    if(typeof syllables === 'string'){
      syllables = divide(syllables);
    }

    var result = [];
    for(var i = 0; i < syllables.length; ++i){
        result.push(difficultySyllable(syllables[i]));
    };
    return result;
}

function difficultySyllable(text){
    var value = 0;

    text = text.replace("ll", "y");
    text = text.replace("rr", "r");
        
    text = text.replace("que", "qe");
    text = text.replace("qui", "qi");                    
    text = text.replace("qué", "qe");
    text = text.replace("quí", "qi");
    text = text.replace("gü", "g");

    if(text.match(/[bcdfghjklmnñpqrstvwxyz]l/g)){
        value += 1;
    }

    if(text.match(/[bcdfghjklmnñpqrstvwxyz]n/g)){
        dvalue += 1;
    }

    if(text.match(/[bcdfghjklmnñpqrstvwxyz]h/g)){
        value += 1;
    }

    if(text.match(/[bcdfghjklmnñpqrstvwxyz]s/g)){
        value += 1;
    }

    text = text.replace("h", "");

    //kñwx
    var consonantsHard = text.match(/[kñwxy]/g);    
    if(consonantsHard){
        value += consonantsHard.length*3;
    }
    
    //bcdfghjlmnpqrstvz
    var consonants = text.match(/[bcdfghjlmnpqrstvz]/g)
    if(consonants){
        value +=consonants.length*2;
    }
    
    var vowels = text.match(/[aeiouáéíóú]/g)
    if(vowels){
        value +=vowels.length;
    }

	return value;   
}
