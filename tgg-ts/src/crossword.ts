import { extractCString } from "./utils";

export class CrosswordData {
  width: number;
  height: number;
  totalClues: number;
  horizontalClues: CrosswordClue[];
  verticalClues: CrosswordClue[];
  crosswordData: CrosswordBox[][];

  constructor(
    width: number,
    height: number,
    totalClues: number,
    horizontalClues: CrosswordClue[],
    verticalClues: CrosswordClue[],
    crosswordData: CrosswordBox[][],
  ) {
    if (width === 0 || height === 0) {
      throw new Error(
        "Invalid crossword dimensions: width and height must be non-zero",
      );
    }

    if (totalClues === 0) {
      throw new Error(
        "Invalid crossword: total clues must be greater than zero",
      );
    }

    this.width = width;
    this.height = height;
    this.totalClues = totalClues;
    this.horizontalClues = horizontalClues;
    this.verticalClues = verticalClues;
    this.crosswordData = crosswordData;

    this.validateClues();
  }

  static load(bytes: Uint8Array): CrosswordData {
    let offset = 0;

    if (bytes.length < 3)
      throw new Error("Unexpected end of file while parsing");

    const width = bytes[offset++];
    const height = bytes[offset++];
    const totalClues = bytes[offset++];

    const horizontalClues = this.parseClues(bytes, offset);
    offset += horizontalClues.byteLength;
    const verticalClues = this.parseClues(bytes, offset);
    offset += verticalClues.byteLength;

    const crosswordData = this.parseCrosswordBoxes(
      bytes,
      offset,
      width,
      height,
    );

    return new CrosswordData(
      width,
      height,
      totalClues,
      horizontalClues.clues,
      verticalClues.clues,
      crosswordData,
    );
  }

  toBytes(): Uint8Array {
    const bytes: number[] = [this.width, this.height, this.totalClues];

    this.horizontalClues.forEach((clue) => bytes.push(...clue.toBytes()));
    bytes.push(0); // Separator

    this.verticalClues.forEach((clue) => bytes.push(...clue.toBytes()));
    bytes.push(0); // Separator

    this.crosswordData.forEach((row) => {
      row.forEach((box) => bytes.push(...box.toBytes()));
    });

    return new Uint8Array(bytes);
  }

  private static parseClues(
    bytes: Uint8Array,
    offset: number,
  ): { clues: CrosswordClue[]; byteLength: number } {
    const clues: CrosswordClue[] = [];
    let index = offset;

    while (bytes[index] !== 0x00) {
      const number = bytes[index++];
      const { value, newIndex } = extractCString(bytes, index);
      clues.push(new CrosswordClue(number, value));
      index = newIndex;
    }

    return { clues, byteLength: index - offset + 1 }; // +1 to skip the separator
  }

  private static parseCrosswordBoxes(
    bytes: Uint8Array,
    offset: number,
    width: number,
    height: number,
  ): CrosswordBox[][] {
    const boxes: CrosswordBox[][] = [];
    let index = offset;

    for (let i = 0; i < height; i++) {
      const row: CrosswordBox[] = [];

      for (let j = 0; j < width; j++) {
        const number = bytes[index++];
        const value = CrosswordBoxValue.fromByte(bytes[index++]);
        row.push(new CrosswordBox(number, value));
      }

      boxes.push(row);
    }

    return boxes;
  }

  private validateClues() {
    const allNumbers = new Set<number>();

    for (const row of this.crosswordData) {
      for (const box of row) {
        if (box.number !== 0 && allNumbers.has(box.number)) {
          throw new Error("Crossword contains duplicate numbers");
        }
        allNumbers.add(box.number);
      }
    }

    const clueNumbers = new Set<number>();
    [...this.horizontalClues, ...this.verticalClues].forEach((clue) => {
      if (!allNumbers.has(clue.number)) {
        throw new Error(
          `Clue number ${clue.number} is not found in the crossword data`,
        );
      }

      if (clueNumbers.has(clue.number)) {
        throw new Error(`Duplicate clue number ${clue.number}`);
      }

      clueNumbers.add(clue.number);
    });
  }
}

export class CrosswordClue {
  number: number;
  value: string;

  constructor(number: number, value: string) {
    this.number = number;
    this.value = value;
  }

  toBytes(): Uint8Array {
    const bytes = [this.number, ...new TextEncoder().encode(this.value), 0];
    return new Uint8Array(bytes);
  }
}

export class CrosswordBox {
  number: number;
  value: CrosswordBoxValue;

  constructor(number: number, value: CrosswordBoxValue) {
    this.number = number;
    this.value = value;
  }

  toBytes(): Uint8Array {
    return new Uint8Array([this.number, this.value.toByte()]);
  }
}

export class CrosswordBoxValue {
  static EMPTY = new CrosswordBoxValue(0x20); // Space
  static SOLID = new CrosswordBoxValue(0x23); // #

  private byteValue: number;

  private constructor(byteValue: number) {
    this.byteValue = byteValue;
  }

  static fromByte(byte: number): CrosswordBoxValue {
    if (byte === 0x20) return CrosswordBoxValue.EMPTY;
    if (byte === 0x23) return CrosswordBoxValue.SOLID;
    if (byte >= 0x41 && byte <= 0x5a) return new CrosswordBoxValue(byte); // A-Z

    throw new Error(`Invalid byte for CrosswordBoxValue: ${byte}`);
  }

  toByte(): number {
    return this.byteValue;
  }

  toString(): string {
    if (this === CrosswordBoxValue.EMPTY) return " ";
    if (this === CrosswordBoxValue.SOLID) return "#";
    return String.fromCharCode(this.byteValue);
  }
}
