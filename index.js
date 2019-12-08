const fs = require('fs');
const input = fs.readFileSync('./input.txt').toString();
let arrayinput = input.split(',').map(str => Number(str));

const arraySettingsPart1 = [0, 1, 2, 3, 4];
const arraySettingsPart2 = [9, 8, 7, 6, 5];

const runAmplifierSoftware = (
  array,
  arrayInputNumber,
  isPart2 = false,
  indexSaved = 0
) => {
  let arrayProgram = [...array];
  let index = 0;
  let count = 0;
  let result = null;

  if (isPart2) {
    index = indexSaved;
    if (index !== 0) count++; //no more phased setting
  }

  while (index < array.length) {
    const opcode = calcOpcode(arrayProgram[index]);
    let listParamModes = calcListParamModes(arrayProgram[index]);
    let param1 = calcParam(arrayProgram, index, 1, listParamModes[1]);
    let param2 = calcParam(arrayProgram, index, 2, listParamModes[0]);
    let param3 = calcParam(arrayProgram, index, 3, 0);

    switch (opcode) {
      case '01':
        arrayProgram[param3] = arrayProgram[param1] + arrayProgram[param2];
        index += 4;
        break;
      case '02':
        arrayProgram[param3] = arrayProgram[param1] * arrayProgram[param2];
        index += 4;
        break;
      case '03':
        if (count === 0) {
          arrayProgram[param1] = arrayInputNumber[0];
        } else {
          arrayProgram[param1] = arrayInputNumber[1];
        }
        count++;
        index += 2;
        break;
      case '04':
        result = arrayProgram[param1];
        index += 2;
        if (isPart2) {
          return {
            output: result,
            halted: false,
            index: index,
            program: arrayProgram
          };
        }
        break;
      case '05':
        if (arrayProgram[param1] !== 0) {
          index = arrayProgram[param2];
        } else {
          index += 3;
        }
        break;
      case '06':
        if (arrayProgram[param1] === 0) {
          index = arrayProgram[param2];
        } else {
          index += 3;
        }
        break;
      case '07':
        if (arrayProgram[param1] < arrayProgram[param2]) {
          arrayProgram[param3] = 1;
        } else {
          arrayProgram[param3] = 0;
        }
        index += 4;
        break;
      case '08':
        if (arrayProgram[param1] === arrayProgram[param2]) {
          arrayProgram[param3] = 1;
        } else {
          arrayProgram[param3] = 0;
        }
        index += 4;
        break;
      case '99':
        if (isPart2) {
          return {
            output: result,
            halted: true,
            index: 0,
            program: arrayProgram
          };
        } else {
          return result;
        }
      default:
        return console.log(`ERROR: opcode: ${opcode}`);
    }
  }
};

const bruteForce = (arrayProgram, arrayPhaseSettings, isPart2 = false) => {
  let result = 0;
  let output = 0;
  let listArraySettings = permutator(arrayPhaseSettings);

  for (const arraySettings of listArraySettings) {
    isPart2
      ? (output = runSequenceLoop(arrayProgram, arraySettings))
      : (output = runSequence(arrayProgram, arraySettings));

    if (output > result) {
      result = output;
      myArraySettings = [...arraySettings];
    }
  }
  return result;
};

const permutator = inputArr => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(inputArr);

  return result;
};

const runSequence = (arrayProgram, arraySettings) => {
  let output = 0;

  for (let index = 0; index < arraySettings.length; index++) {
    output = runAmplifierSoftware(arrayProgram, [arraySettings[index], output]);
  }

  return output;
};

const runSequenceLoop = (arrayProgram, arraySettings) => {
  let output = 0;
  let activeProgram = [...arrayProgram];
  let listAmps = [];

  for (const phaseSetting of arraySettings) {
    listAmps.push({
      output: null,
      halted: false,
      index: 0,
      program: arrayProgram
    });
  }

  let numHalted = 0;
  let object = {
    output: null,
    halted: false,
    index: 0,
    program: arrayProgram
  };

  while (numHalted !== arraySettings.length) {
    for (let index = 0; index < arraySettings.length; index++) {
      activeProgram = listAmps[index].program;

      object = runAmplifierSoftware(
        activeProgram,
        [arraySettings[index], output],
        true,
        listAmps[index].index
      );
      if (object.output !== null) {
        output = object.output;
      }
      //console.log(object.output, object.halted, object.index);
      if (object.halted) {
        numHalted++;
      }
      //bring modified program
      activeProgram = object.program;
      //update programs
      listAmps[index] = { ...object };
    }
  }

  return output;
};

const calcOpcode = int => {
  let opcode = int.toString();
  opcode = opcode.padStart(4, '0');
  return opcode[2] + opcode[3];
};

const calcListParamModes = int => {
  let listParamModes = [];
  let str = int.toString();
  const completeOpcode = str.padStart(4, '0');

  for (let index = 0; index < completeOpcode.length - 2; index++) {
    listParamModes.push(Number(completeOpcode[index]));
  }
  return listParamModes;
};

const calcParam = (arrayProgram, index, param, paramMode) => {
  let result = 0;

  if (paramMode === 0) {
    result = arrayProgram[index + param];
  } else {
    result = index + param;
  }
  return result;
};

console.time('time part1');
console.log(bruteForce(arrayinput, arraySettingsPart1));
console.timeEnd('time part1');

console.time('time part2');
console.log(bruteForce(arrayinput, arraySettingsPart2, true));
console.timeEnd('time part2');
