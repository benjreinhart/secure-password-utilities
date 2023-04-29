import { getRandomValues } from 'secure-password-utilities/crypto';

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
  digits: PasswordOptionType;
  symbols: PasswordOptionType;
  lowercase: PasswordOptionType;
  uppercase: PasswordOptionType;
};

/**
 * Generate a random password.
 *
 * Uses a CSPRNG for randomness.
 *
 *     generatePassword(12); // l[Nz8UfU.o4g
 *     generatePassword(8, { symbols: false, digits: 2 }); // k9WTkaP6
 *     generatePassword(8, { digits: {min: 2} }); // 0(c67+.f
 *
 * @param length The length of the resulting password.
 * @param options
 * @param options.digits Include or exclude digits.
 * @param options.symbols Include or exclude symbols.
 * @param options.lowercase Include or exclude lowercase.
 * @param options.uppercase Include or exclude uppercase.
 * @returns A random password.
 */
export function generatePassword(length: number, options?: Partial<PasswordOptionsType>): string {
  const defaults: PasswordOptionsType = {
    digits: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  };

  options = options || {};

  return createPassword(length, {
    digits: options.digits === undefined ? defaults.digits : options.digits,
    symbols: options.symbols === undefined ? defaults.symbols : options.symbols,
    lowercase: options.lowercase === undefined ? defaults.lowercase : options.lowercase,
    uppercase: options.uppercase === undefined ? defaults.uppercase : options.uppercase,
  });
}

function createPassword(passwordLength: number, options: PasswordOptionsType) {
  validatePasswordOptions(passwordLength, options);

  const [initDigitLength, moreDigits] = getInitialLengthForOption(options.digits);
  const [initSymbolLength, moreSymbols] = getInitialLengthForOption(options.symbols);
  const [initLowercaseLength, moreLowercase] = getInitialLengthForOption(options.lowercase);
  const [initUppercaseLength, moreUppercase] = getInitialLengthForOption(options.uppercase);

  // Construct the initial response based on the exact or minimum characters
  // specified for digits, symbols, lowercase and uppercase character sets.
  let result =
    generateCharacters(initDigitLength, DIGIT_CHARSET) +
    generateCharacters(initSymbolLength, SYMBOL_CHARSET) +
    generateCharacters(initLowercaseLength, LOWERCASE_CHARSET) +
    generateCharacters(initUppercaseLength, UPPERCASE_CHARSET);

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

  result += generateCharacters(passwordLength - result.length, remainingCharset);

  return randomizeCharacters(result);
}

function validatePasswordOptions(length: number, options: PasswordOptionsType) {
  if (typeof length !== 'number' || length < 1) {
    throw new Error('Invalid option: length option must be a number greater than or equal to 1');
  }

  validatePasswordOption('lowercase', options.lowercase);
  validatePasswordOption('uppercase', options.uppercase);
  validatePasswordOption('digits', options.digits);
  validatePasswordOption('symbols', options.symbols);

  const [initDigitLength, moreDigits] = getInitialLengthForOption(options.digits);
  const [initSymbolLength, moreSymbols] = getInitialLengthForOption(options.symbols);
  const [initLowercaseLength, moreLowercase] = getInitialLengthForOption(options.lowercase);
  const [initUppercaseLength, moreUppercase] = getInitialLengthForOption(options.uppercase);

  const sum = initDigitLength + initSymbolLength + initLowercaseLength + initUppercaseLength;

  const allExact = !moreDigits && !moreSymbols && !moreLowercase && !moreUppercase;

  if (sum > length) {
    throw new Error('Invalid option: Requested characters exceeds expected length');
  }

  if (allExact && sum !== length) {
    throw new Error('Invalid option: Requested less characters than expected length');
  }
}

// This assumes that any missing options were filled in with a default, i.e., no `undefined` options.
function validatePasswordOption(name: string, option: PasswordOptionType) {
  if (typeof option === 'boolean') {
    return;
  }

  if (typeof option === 'number') {
    if (option < 0) {
      throw new Error(`Invalid option: ${name} option cannot be a negative number`);
    }
    return;
  }

  if (option !== null && typeof option === 'object') {
    if (typeof option.min !== 'number' || option.min < 0) {
      throw new Error(
        `Invalid option: ${name} option 'min' property must be a non-negative integer`
      );
    }
    return;
  }

  throw new Error(`Invalid option: ${name} option must be a boolean, number, or object`);
}

// Assumes option has already been validated, populated with defaults, and is thus well-formed.
function getInitialLengthForOption(option: PasswordOptionType): [number, boolean] {
  switch (typeof option) {
    case 'boolean':
      return [0, option];
    case 'number':
      return [option, false];
    default:
      return [option.min, true];
  }
}

/**
 * Generate a random digit pin.
 *
 * Uses a CSPRNG for randomness.
 *
 *     generatePin(6); // 036919
 *     generatePin(8); // 45958396
 *
 * @param length The length of the resulting pin.
 * @returns A random digit pin.
 */
export function generatePin(length: number) {
  if (typeof length !== 'number' || length < 1) {
    throw new Error(
      'Invalid argument: length argument must be a number greater than or equal to 1'
    );
  }

  return generateCharacters(length, DIGIT_CHARSET);
}

/**
 * Generate a string of `length` characters chosen randomly from the given `charset`.
 *
 * Uses a CSPRNG for randomness.
 *
 *     generateCharacters(4, '$%^&');                          // &$&^
 *     generateCharacters(6, '0123456789');                    // 947682
 *     generateCharacters(6, 'abcdefghijklmnopqrstuvwxyz');    // ihdrnn
 *
 * @param length The number of random characters to generate.
 * @param charset The set of characters to randomly sample from.
 * @returns A random string of `length` characters from `charset`.
 */
export function generateCharacters(length: number, charset: string) {
  if (typeof length !== 'number' || length < 0) {
    throw new Error(
      'Invalid argument: length argument must be a number greater than or equal to 0'
    );
  }

  if (typeof charset !== 'string' || charset.length < 2) {
    throw new Error(
      'Invalid argument: charset argument must be a string with length greater than or equal to 2'
    );
  }

  return getRandomValues(length, charset.length).reduce((characters, i) => {
    return characters + charset[i];
  }, '');
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
