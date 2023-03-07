import { getRandomValues } from './crypto';

export const DIGIT_CHARSET = '0123456789';
export const LOWERCASE_CHARSET = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// OWASP password special characters except space and backslash. Has the benefit of evenly dividing 256.
//
//     See https://owasp.org/www-community/password-special-characters
//
export const SYMBOL_CHARSET = '!"#$%&\'()*+,-./:;<=>?@[]{}^_`|~';

export type PasswordOptionType =
  // `true` means include [character type], `false` means exclude [character type]
  | boolean
  // <number> means include exactly <number> [character type]s
  | number
  // { min: <number> } means include at least <number> [character type]s
  | { min: number };

export type PasswordOptionsType = {
  length: number;
  digits: PasswordOptionType;
  symbols: PasswordOptionType;
  lowercase: PasswordOptionType;
  uppercase: PasswordOptionType;
};

/**
 * Generate a random password.
 *
 * @param options
 * @param options.length The length of the resulting password. Defaults to 12.
 * @param options.digits Include or exclude digits.
 * @param options.symbols Include or exclude symbols.
 * @param options.lowercase Include or exclude lowercase.
 * @param options.uppercase Include or exclude uppercase.
 * @returns A random password.
 */
export function generatePassword(options?: Partial<PasswordOptionsType>): string {
  const defaults: PasswordOptionsType = {
    length: 12,
    digits: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  };

  options = options || {};

  return createPassword({
    length: options.length === undefined ? defaults.length : options.length,
    digits: options.digits === undefined ? defaults.digits : options.digits,
    symbols: options.symbols === undefined ? defaults.symbols : options.symbols,
    lowercase: options.lowercase === undefined ? defaults.lowercase : options.lowercase,
    uppercase: options.uppercase === undefined ? defaults.uppercase : options.uppercase,
  });
}

function createPassword(options: PasswordOptionsType) {
  validatePasswordOptions(options);

  const passwordLength = options.length;

  const [initDigitLength, moreDigits] = getLengthForOption(options.digits);
  const [initSymbolLength, moreSymbols] = getLengthForOption(options.symbols);
  const [initLowercaseLength, moreLowercase] = getLengthForOption(options.lowercase);
  const [initUppercaseLength, moreUppercase] = getLengthForOption(options.uppercase);

  // Construct the initial response based on the exact or minimum characters
  // specified for digits, symbols, lowercase and uppercase character sets.
  let result =
    getRandomCharacters(initDigitLength!, DIGIT_CHARSET) +
    getRandomCharacters(initSymbolLength!, SYMBOL_CHARSET) +
    getRandomCharacters(initLowercaseLength!, LOWERCASE_CHARSET) +
    getRandomCharacters(initUppercaseLength!, UPPERCASE_CHARSET);

  let remainingCharset = '';

  if (moreDigits) {
    remainingCharset += DIGIT_CHARSET;
  }

  if (moreSymbols) {
    remainingCharset += SYMBOL_CHARSET;
  }

  if (moreLowercase) {
    remainingCharset += LOWERCASE_CHARSET;
  }

  if (moreUppercase) {
    remainingCharset += UPPERCASE_CHARSET;
  }

  result += getRandomCharacters(passwordLength - result.length, remainingCharset);

  return shuffle(result);
}

function validatePasswordOptions(options: PasswordOptionsType) {
  const { length } = options;

  if (typeof length !== 'number' || length < 1) {
    throw new Error('Invalid option: length option must be at least 1');
  }

  const [initDigitLength, moreDigits] = getLengthForOption(options.digits);
  if (typeof initDigitLength !== 'number' || initDigitLength < 0) {
    throw new Error('Invalid option: digits option must be a boolean, number, or object');
  }

  const [initSymbolLength, moreSymbols] = getLengthForOption(options.symbols);
  if (typeof initSymbolLength !== 'number' || initSymbolLength < 0) {
    throw new Error('Invalid option: symbols option must be a boolean, number, or object');
  }

  const [initLowercaseLength, moreLowercase] = getLengthForOption(options.lowercase);
  if (typeof initLowercaseLength !== 'number' || initLowercaseLength < 0) {
    throw new Error('Invalid option: lowercase option must be a boolean, number, or object');
  }

  const [initUppercaseLength, moreUppercase] = getLengthForOption(options.uppercase);
  if (typeof initUppercaseLength !== 'number' || initUppercaseLength < 0) {
    throw new Error('Invalid option: uppercase option must be a boolean, number, or object');
  }

  const sum = initDigitLength + initSymbolLength + initLowercaseLength + initUppercaseLength;

  const allExact = !moreDigits && !moreSymbols && !moreLowercase && !moreUppercase;

  if (sum > length) {
    throw new Error('Invalid option: Requested characters exceeds expected length');
  }

  if (allExact && sum !== length) {
    throw new Error('Invalid option: Requested less characters than expected length');
  }
}

function getLengthForOption(option: PasswordOptionType): [number?, boolean?] {
  switch (typeof option) {
    case 'boolean':
      return [0, option];
    case 'number':
      return [option, false];
    case 'object':
      return [option.min, true];
    default:
      // Shouldn't happen normally given compile-time typing,
      // but may happen at run-time while validating input.
      return [undefined, undefined];
  }
}

/**
 * Get `length` random characters from a character set (`charset`) using a CSPRNG.
 *
 *     getRandomCharacters(6, '0123456789');                    // e.g.: "947682"
 *     getRandomCharacters(6, 'abcdefghijklmnopqrstuvwxyz');    // e.g.: "ihdrnn"
 *
 * @private
 */
function getRandomCharacters(length: number, charset: string) {
  return getRandomValues(length, charset.length).reduce((characters, i) => {
    return characters + charset[i];
  }, '');
}

/**
 * Take a string of characters and "shuffle" it (randomize it) using
 * random indices from a CSPRNG.
 *
 * @private
 */
function shuffle(characters: string) {
  const charactersLength = characters.length;

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
