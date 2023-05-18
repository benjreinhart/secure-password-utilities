import { getRandomBytes } from 'secure-password-utilities/csprng';

function getRandomByte(): number {
  return getRandomBytes(1)[0]!;
}

/**
 * Get a random value greater than or equal to `start` and less than `until`.
 *
 * Notes:
 *
 *     * Max value is 256.
 *     * This is inefficient if the range covers a small percentage of possible byte values.
 *     * The range must contain at least two elements, otherwise there would be no randomness.
 *
 * Example:
 *
 *     getRandomValueInRange(0, 64); // Returns a byte with numeric value GTE 0 and LT 64.
 *
 * @private
 */
function getRandomValueInRange(start: number, until: number): number {
  if (start < 0) {
    throw new Error('Invalid byte range: range start must be at least 0');
  }

  if (until - start < 2) {
    throw new Error('Invalid byte range: range must contain at least two values');
  }

  if (until > 256) {
    throw new Error('Invalid byte range: range until must be at most 256');
  }

  // Number of elements in the range
  const rangeSize = until - start;

  // We are going to calculate the maximum numeric value that fits within a single
  // byte and is *evenly divisible* by the range size. By only considering random bytes
  // GTE zero and LT this value, we give each number in the requested range an equal
  // probability of being chosen when using the modulo operator and thus avoiding
  // modulo bias.
  //
  // The reason for choosing the maximum value, as opposed to the requested range max
  // itself, is efficiency. For example, let's say the range is [0, 10). If we naively
  // filter out any bytes from the RNG that are not between 0 and 10, then we would be
  // rejecting > 95% of the bytes returned from the RNG. Instead we can do much better
  // by selecting bytes in the range [0, 250) mod 10, which only rejects < 5% of bytes
  // from the RNG.
  const byteRangeMax = rangeSize * Math.floor(256 / rangeSize);

  while (true) {
    const byte = getRandomByte();

    // Be careful that bytes selected are strictly LESS THAN the range max.
    if (byte < byteRangeMax) {
      return start + (byte % rangeSize);
    }
  }
}

/**
 * Get random values between 0 and `rangeMax` (at most, 256 exclusive) from a CSPRNG.
 *
 * This is a helper function to safely filter random byte values into a desired range.
 * "safely" here meaning careful use of the modulo operator to avoid modulo bias.
 *
 * Examples:
 *
 *     getRandomValues(6, 10); // Returns a Uint8Array of length 6 with values between 0-9 inclusive.
 *
 *     getRandomValues(12, 52); // Returns a Uint8Array of length 12 with values between 0-51 inclusive.
 *
 * @param numValues The number of random values to return.
 * @param rangeMax Values returned must be strictly less than this value.
 * @returns A random set of values between 0 (inclusive) and rangeMax (exclusive).
 */
export function getRandomValues(numValues: number, rangeMax = 256): Uint8Array {
  if (numValues < 0) {
    throw new Error('Invalid number of values: number of values to return must be at least 0');
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
    values[i] = getRandomValueInRange(0, rangeMax);
  }

  return values;
}

/**
 * Randomize the ordering of the characters in the given string.
 *
 * Uses a CSPRNG for randomness.
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
  const swapIndices = getRandomValues(charactersLength, charactersLength);

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
