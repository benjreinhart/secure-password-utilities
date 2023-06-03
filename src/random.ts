import { getRandomBytes } from 'secure-password-utilities/csprng';

const MAXIMUM_ONE_BYTE_VALUE = 256;
const MAXIMUM_TWO_BYTE_VALUE = 65536;

function getOneByteRandomInteger() {
  const [byte] = getRandomBytes(1);
  return byte;
}

function getTwoByteRandomInteger() {
  const [byte1, byte2] = getRandomBytes(2);
  return (byte1 << 8) + byte2;
}

function getRandomNumberLessThan(number: number) {
  if (typeof number !== 'number' || number < 2 || number > MAXIMUM_TWO_BYTE_VALUE) {
    throw new Error(
      `Invalid number: number must be at least two and at most ${MAXIMUM_TWO_BYTE_VALUE}`
    );
  }

  const needsTwoBytes = number > 256;
  const maxValue = needsTwoBytes ? MAXIMUM_TWO_BYTE_VALUE : MAXIMUM_ONE_BYTE_VALUE;
  const getRandomNumber = needsTwoBytes ? getTwoByteRandomInteger : getOneByteRandomInteger;

  // We are going to calculate the maximum numeric value that is *evenly divisible* by
  // the number argument. By only considering random values GTE zero and LT this value,
  // we give each number in the requested range an equal probability of being chosen when
  // using the modulo operator and thus avoiding modulo bias.
  //
  // The reason for choosing the maximum value, as opposed to the requested number argument
  // itself, is efficiency. For example, let's say the number argument is 10. If we naively
  // filter out any bytes from the RNG that are not between 0 and 10, then we would be
  // rejecting > 95% of the bytes returned from the RNG. Instead we can do much better
  // by selecting bytes in the range [0, 250) mod 10, which only rejects < 5% of bytes
  // from the RNG. This is especially important when dealing with two-byte numbers.
  const randomNumberMax = number * Math.floor(maxValue / number);

  while (true) {
    const randomNumber = getRandomNumber();

    // Be careful that the random number is strictly LESS THAN the random number max.
    if (randomNumber < randomNumberMax) {
      return randomNumber % number;
    }
  }
}

/**
 * Get a list of random numbers where each number is greater than or equal to `start` and less than `end`.
 *
 * The `end` of the range must be less than or equal to 2^16.
 *
 * Examples:
 *
 *     getRandomNumbersInRange(6, 0, 10) // [8, 2, 1, 3, 5, 0]
 *
 *     getRandomNumbersInRange(6, 10, 1000); // [111, 752, 41, 420, 360, 630]
 *
 * @param length The length of the resulting list of random numbers.
 * @param start The start of the range (inclusive).
 * @param end The end of the range (exclusive). Cannot exceed 2^16.
 * @returns A list of `length` random numbers in the desired range.
 */
export function getRandomNumbersInRange(length: number, start: number, end: number): number[] {
  if (typeof length !== 'number' || length < 1) {
    throw new Error('Invalid argument: length must be a number greater than or equal to 1');
  }

  if (typeof start !== 'number' || start < 0) {
    throw new Error('Invalid argument: start must be a number greater than or equal to 0');
  }

  if (typeof end !== 'number' || end > MAXIMUM_TWO_BYTE_VALUE) {
    throw new Error(
      `Invalid argument: end must be a number less than or equal to ${MAXIMUM_TWO_BYTE_VALUE}`
    );
  }

  if (end - start < 2) {
    throw new Error('Invalid range: range must contain at least two values');
  }

  const values = [];

  for (let i = 0; i < length; i++) {
    values[i] = start + getRandomNumberLessThan(end - start);
  }

  return values;
}

/**
 * Randomize the ordering of the characters in the given string.
 *
 * Examples:
 *
 *     randomizeCharacters('randomize me');     // e znmaedimro
 *     randomizeCharacters('randomize me');     // arndimz moee
 *     randomizeCharacters('randomize me');     // ai emdonmrze
 *
 * @param characters A string of characters to randomize.
 * @returns A random ordering of the `characters` argument.
 */
export function randomizeCharacters(characters: string) {
  if (typeof characters !== 'string') {
    throw new Error('Invalid argument: characters argument must be a string');
  }

  const charactersLength = characters.length;

  if (charactersLength < 2) {
    return characters;
  }

  // Get random values within the index range of our input characters.
  // We will use these values to swap elements from the input.
  //
  // NOTE: This can contain duplicates, which is desired (random), but it does
  // mean that we cannot construct the resulting string solely from these values
  // as they may contain duplicates and be missing some indices in the input string.
  //
  // For example:
  //
  //     * Let's say `characters` here is the string "M9bz"
  //     * `charactersLength` is the number 4
  //     * We'll then call getRandomValues(4, 4)
  //     * This might return `UInt8Array([3, 2, 3, 0])`
  //     * Then we'll iterate over the characters and at each position `i` we'll
  //       swap `character[i]` with the one at `characters[swapIndices[i]]`.
  //
  const swapIndices = getRandomNumbersInRange(charactersLength, 0, charactersLength);

  // We start with the input as a list because strings
  // are immutable and we need to swap elements.
  const result = Array.from(characters);

  for (let i = 0; i < charactersLength; i++) {
    const j = swapIndices[i];

    // Swap elements at i and j
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result.join('');
}

/**
 * Get random values between 0 and `rangeMax` (at most, 256 exclusive) from a CSPRNG.
 *
 * This is a helper function to safely filter random byte values into a desired range.
 * "safely" here meaning careful use of the modulo operator to avoid modulo bias.
 *
 * This is deprecated. Use `getRandomNumbersInRange` instead.
 *
 * Examples:
 *
 *     getRandomValues(6, 10); // Returns a Uint8Array of length 6 with values between 0-9 inclusive.
 *
 *     getRandomValues(12, 52); // Returns a Uint8Array of length 12 with values between 0-51 inclusive.
 *
 * @deprecated
 * @param numValues The number of random values to return.
 * @param rangeMax Values returned must be strictly less than this value.
 * @returns A random set of values between 0 (inclusive) and rangeMax (exclusive).
 */
export function getRandomValues(numValues: number, rangeMax = 256): Uint8Array {
  if (numValues < 0) {
    throw new Error('Invalid number of values: number of values to return must be at least 0');
  }

  if (typeof rangeMax !== 'number' || rangeMax > 256) {
    throw new Error('Invalid range max: range max must be a number that is at most 256');
  }

  if (numValues === 0) {
    return new Uint8Array(0);
  }

  // Any byte values will work just fine in this case.
  if (rangeMax === 256) {
    return getRandomBytes(numValues);
  }

  const values = new Uint8Array(numValues);

  for (let i = 0; i < numValues; i++) {
    values[i] = getRandomNumberLessThan(rangeMax);
  }

  return values;
}
