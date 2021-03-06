/**
 * LS-8 v2.0 emulator skeleton code
 */
let SP = 0x07;
const HLT = 0b00000001;
const LDI = 0b10011001;
const PRN = 0b01000011;
const MUL = 0b10101010;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const RET = 0b00001001;
const ADD = 0b10101000;
const JMP = 0b01010000;
const JEQ = 0b01010001;
const JNE = 0b01010010;
const CMP = 0b10100000;
/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.PC = 0; // Program Counter
    this.FL = 0b00000000;

    this.reg[SP] = 0xf4;
  }

  setFlag(flag) {
    const flags = {
      EQF: 0b00000001,
      GTF: 0b00000010,
      LTF: 0b00000100
    };
    this.FL = 0b00000000;
    this.FL = this.FL | flags[flag];
    // console.log("FLAG: ", this.FL);
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    this.clock = setInterval(() => {
      this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    switch (op) {
      case 'MUL':
        // !!! IMPLEMENT ME
        this.reg[regA] = this.reg[regA] * this.reg[regB];
        break;
      case 'ADD':
        this.reg[regA] = this.reg[regA] + this.reg[regB];
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)

    // !!! IMPLEMENT ME
    let IR = this.ram.read(this.PC);

    // Debugging output
    // console.log(`${this.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    // !!! IMPLEMENT ME
    let operandA = this.ram.read(this.PC + 1);
    let operandB = this.ram.read(this.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    // !!! IMPLEMENT ME
    // switch (IR) {
    //   case HLT:
    //     this.stopClock();
    //     break;
    //   case LDI:
    //     this.reg[operandA] = operandB;
    //     break;
    //   case MUL:
    //     this.alu('MUL', operandA, operandB);
    //     break;
    //   case PRN:
    //     console.log(this.reg[operandA]);
    //     break;
    // }

    const handle_LDI = (operandA, operandB) => {
      this.reg[operandA] = operandB;
    };
    const handle_MUL = (operandA, operandB) => {
      this.alu('MUL', operandA, operandB);
    };
    const handle_PRN = operandA => {
      console.log(this.reg[operandA]);
    };
    const handle_HLT = () => {
      this.stopClock();
    };
    const handle_POP = operA => {
      this.reg[operA] = this.ram.read(this.reg[SP]);
      this.reg[SP]++;
    };
    const handle_PUSH = operA => {
      this.reg[SP] = this.reg[SP] - 1;
      this.ram.write(this.reg[SP], this.reg[operA]);
    };
    const handle_ADD = (operandA, operandB) => {
      this.alu('ADD', operandA, operandB);
    };
    const handle_CALL = operA => {
      this.reg[SP] = this.reg[SP] - 1;
      this.ram.write(this.reg[SP], this.PC + 2);
      return this.reg[operA];
    };
    const handle_RET = () => {
      const value = this.ram.read(this.reg[SP]);
      this.reg[SP]++;
      return value;
    };
    const handle_CMP = () => {
      this.setFlag("EQF", this.reg[operandA] === this.reg[operandB]);
      this.setFlag("GTF", this.reg[operandA] > this.reg[operandB]);
      this.setFlag("LTF", this.reg[operandA] < this.reg[operandB]);
    };
    const handle_JMP = () => {
      this.PC = this.ram.read(this.PC + 1);
    };
    const handle_JEQ = () => {
      if (this.FL === 0b00000001) {
        return (this.PC = this.reg[operandA]);
      }
    };
    const handle_JNE = () => {
      if (this.FL !== 0b00000001) {
        return (this.PC = this.reg[operandA]);
      }
    };

    const branchTable = {
      [LDI]: handle_LDI,
      [MUL]: handle_MUL,
      [PRN]: handle_PRN,
      [HLT]: handle_HLT,
      [POP]: handle_POP,
      [PUSH]: handle_PUSH,
      [ADD]: handle_ADD,
      [CALL]: handle_CALL,
      [RET]: handle_RET,
      [CMP]: handle_CMP,
      [JMP]: handle_JMP,
      [JEQ]: handle_JEQ,
      [JNE]: handle_JNE
    };

    const returnHandler = branchTable[IR](operandA, operandB);
    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    // !!! IMPLEMENT ME
    if (returnHandler === undefined) {
      this.PC += (IR >>> 6) + 1;
    } else {
      this.PC = returnHandler;
    }
  }
}

module.exports = CPU;