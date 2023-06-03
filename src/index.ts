import {
  getRandomValues,
  getRandomNumbersInRange,
  randomizeCharacters,
} from 'secure-password-utilities/random';
import {
  DIGIT_CHARSET,
  LOWERCASE_CHARSET,
  UPPERCASE_CHARSET,
  SYMBOL_CHARSET,
} from 'secure-password-utilities/constants';

export type PasswordOptionType =
  // `true` means include [character type], `false` means exclude [character type]
  | boolean
  // <number> means include exactly <number> [character type]s
  | number
  // { min: <number> } means include at least <number> [character type]s
  | { min: number };

export type PasswordOptionsType = {
  digits?: PasswordOptionType;
  symbols?: PasswordOptionType;
  lowercase?: PasswordOptionType;
  uppercase?: PasswordOptionType;
  charset?: {
    digits?: string;
    symbols?: string;
    lowercase?: string;
    uppercase?: string;
  };
};

/**
 * Generate a random password.
 *
 * Examples:
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
 * @param options.charset
 * @param options.charset.digits Override the character set for digits.
 * @param options.charset.symbols Override the character set for symbols.
 * @param options.charset.lowercase Override the character set for lowercase.
 * @param options.charset.uppercase Override the character set for uppercase.
 * @returns A random password.
 */
export function generatePassword(length: number, options?: PasswordOptionsType): string {
  options = options || {};

  return createPassword(
    length,
    {
      digits: options.digits ?? true,
      symbols: options.symbols ?? true,
      lowercase: options.lowercase ?? true,
      uppercase: options.uppercase ?? true,
    },
    {
      digits: options.charset?.digits ?? DIGIT_CHARSET,
      symbols: options.charset?.symbols ?? SYMBOL_CHARSET,
      lowercase: options.charset?.lowercase ?? LOWERCASE_CHARSET,
      uppercase: options.charset?.uppercase ?? UPPERCASE_CHARSET,
    }
  );
}

type PasswordOptionsTypeRequired = {
  digits: PasswordOptionType;
  symbols: PasswordOptionType;
  lowercase: PasswordOptionType;
  uppercase: PasswordOptionType;
};

type CharsetType = {
  digits: string;
  symbols: string;
  lowercase: string;
  uppercase: string;
};

function createPassword(
  passwordLength: number,
  options: PasswordOptionsTypeRequired,
  charset: CharsetType
) {
  validatePasswordOptions(passwordLength, options);
  validateCharsetOptions(charset);

  const [initDigitLength, moreDigits] = getInitialLengthForOption(options.digits);
  const [initSymbolLength, moreSymbols] = getInitialLengthForOption(options.symbols);
  const [initLowercaseLength, moreLowercase] = getInitialLengthForOption(options.lowercase);
  const [initUppercaseLength, moreUppercase] = getInitialLengthForOption(options.uppercase);

  // Construct the initial response based on the exact or minimum characters
  // specified for digits, symbols, lowercase and uppercase character sets.
  let result =
    generateCharacters(initDigitLength, charset.digits) +
    generateCharacters(initSymbolLength, charset.symbols) +
    generateCharacters(initLowercaseLength, charset.lowercase) +
    generateCharacters(initUppercaseLength, charset.uppercase);

  let remainingCharset = '';

  if (moreDigits) {
    remainingCharset += charset.digits;
  }

  if (moreSymbols) {
    remainingCharset += charset.symbols;
  }

  if (moreLowercase) {
    remainingCharset += charset.lowercase;
  }

  if (moreUppercase) {
    remainingCharset += charset.uppercase;
  }

  result += generateCharacters(passwordLength - result.length, remainingCharset);

  return randomizeCharacters(result);
}

function validatePasswordOptions(length: number, options: PasswordOptionsTypeRequired) {
  if (typeof length !== 'number' || length < 1) {
    throw new Error('Invalid option: length option must be a number greater than or equal to 1');
  }

  validatePasswordOption('digits', options.digits);
  validatePasswordOption('symbols', options.symbols);
  validatePasswordOption('lowercase', options.lowercase);
  validatePasswordOption('uppercase', options.uppercase);

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

function validateCharsetOptions(charsets: CharsetType) {
  validateCharsetOption('digits', charsets.digits);
  validateCharsetOption('symbols', charsets.symbols);
  validateCharsetOption('lowercase', charsets.lowercase);
  validateCharsetOption('uppercase', charsets.uppercase);
}

function validateCharsetOption(name: string, charset: string) {
  if (typeof charset !== 'string') {
    throw new Error(`Invalid charset option: ${name} charset must be a string`);
  }

  if (charset.length !== new Set(charset).size) {
    throw new Error(`Invalid charset option: ${name} charset contains duplicate characters`);
  }
}

/**
 * Generate a random digit pin.
 *
 * Examples:
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
 * Examples:
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
 * Generate a memorable passphrase comprised of words chosen randomly from the given `wordlist`.
 *
 * There are wordlists available in the wordlists module, or you can provide your own.
 *
 * The word separator defaults to a dash (`-`), but you can customize this behavior using the third argument. "-"
 *
 * Examples:
 *
 *     generatePassphrase(6, DEFAULT_WORDLIST); // canopener-uncanny-hatchet-murky-agony-traitor
 *     generatePassphrase(6, DEFAULT_WORDLIST); // backpack-craftwork-sweat-postcard-imaging-litter
 *     generatePassphrase(6, DEFAULT_WORDLIST, '_'); // goldfish_scorpion_antiviral_pursuit_demanding_motto
 *
 * @param length The number of words selected at random.
 * @param wordlist The list of words to sample from.
 * @param sep The separator to use when joining the words in the passphrase. Defaults to '-'.
 * @returns A memorable passphrase.
 */
export function generatePassphrase(length: number, wordlist: readonly string[], sep = '-') {
  if (typeof length !== 'number' || length < 1) {
    throw new Error(
      'Invalid argument: length argument must be a number greater than or equal to 1'
    );
  }

  if (!Array.isArray(wordlist) || wordlist.length < 2) {
    throw new Error(
      'Invalid argument: wordlist argument must be an array with length greater than or equal to 2'
    );
  }

  if (typeof sep !== 'string') {
    throw new Error('Invalid argument: sep argument must be a string');
  }

  return getRandomNumbersInRange(length, 0, wordlist.length).reduce((passphrase, value, i) => {
    const word = wordlist[value];
    return passphrase + (i === 0 ? word : sep + word);
  }, '');
}
