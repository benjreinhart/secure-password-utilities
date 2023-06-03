# secure-password-utilities ![Github CI](https://github.com/benjreinhart/secure-password-utilities/workflows/Github%20CI/badge.svg)

Secure, zero-dependency utilities for generating passwords, passphrases, pins, and more.

* 0️⃣ Zero dependencies
* 💯 Works in browsers (using _webcrypto_) and node 12.x+ (using _node:crypto_)
* ✅ Supports both CJS and ESM formats
* 🪶 Lightweight package, e.g., importing `generatePin` is less than a kilobyte gzipped

## Usage

```
npm install secure-password-utilities
```

Basic usage:

```ts
import {generatePassword, generatePin} from 'secure-password-utilities';

// Defaults include all uppercase/lowercase characters, digits, and symbols.
const password = generatePassword(12);
console.log(password); // l[Nz8UfU.o4g

const pin = generatePin(6);
console.log(pin); // 036919
```

## API

- [secure-password-utilities](#secure-password-utilities)
  - [generatePassword](#generatepassword)
  - [generatePassphrase](#generatepassphrase)
  - [generatePin](#generatepin)
  - [generateCharacters](#generatecharacters)
- [secure-password-utilities/constants](#secure-password-utilitiesconstants)
  - [DIGIT_CHARSET](#digit_charset)
  - [LOWERCASE_CHARSET](#lowercase_charset)
  - [UPPERCASE_CHARSET](#uppercase_charset)
  - [SYMBOL_CHARSET](#symbol_charset)
- [secure-password-utilities/csprng](#secure-password-utilitiescsprng)
  - [getRandomBytes](#getrandombytes)
- [secure-password-utilities/random](#secure-password-utilitiesrandom)
  - [getRandomNumbersInRange](#getrandomnumbersinrange)
  - [getRandomValues](#getrandomvalues)
  - [randomizeCharacters](#randomizecharacters)
- [secure-password-utilities/wordlists](#secure-password-utilitieswordlists)
  - [DEFAULT_WORDLIST](#default_wordlist)
  - [EFF_LONG_WORDLIST](#eff_long_wordlist)

### secure-password-utilities

```ts
import {generatePassword, generatePassphrase, generatePin, generateCharacters} from 'secure-password-utilities'
```

#### generatePassword

```ts
function generatePassword(length: number, options?: PasswordOptionsType): string
```

Generates a random password.

`PasswordOptionsType` is defined as:

```ts
type PasswordOptionType =
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
```

Examples:

```ts
// Contains only letters (upper and lowercase) and digits.
const alphanumericPassword = generatePassword(10, { symbols: false });
console.log(alphanumericPassword); // 49Faqzd8jx

const password = generatePassword(12, {
  symbols: 2,               // Resulting password must contain exactly two symbols.
  uppercase: { min: 1 },    // Resulting password must contain a minimum of 1 upperase character.
});
console.log(password); // b1yT6$jO`kvf

const uppercasePassword = generatePassword(10, {
  digits: false,            // Resulting password must NOT contain any digits.
  symbols: false,           // Resulting password must NOT contain any symbols.
  lowercase: false,         // Resulting password must NOT contain any lowercase characters.
});
console.log(uppercasePassword); // IHDPPZRNPS
```

You can override the character set used for each option using the `charset` option, e.g.:

```ts
// Ensure exactly three symbols are present in the resulting
// password using the following values for 'symbols':
//
//     ! @ # $ %
//
const password = generatePassword(12, {
  symbols: 3,
  charset: { symbols: '!@#$%' },
});
console.log(password); // A@D#tkG!ymFE

// Generate a 12-character password with at least 3 digits and no symbols.
// For the digits, only use even digits, i.e., 0, 2, 4, 6, 8.
const evenDigitPassword = generatePassword(12, {
  digits: { min: 3 },
  symbols: false,
  charset: { digits: '02468' }
});
console.log(evenDigitPassword); // e6V8zy0kfTAN
```

#### generatePassphrase

```ts
function generatePassphrase(length: number, wordlist: readonly string[], sep?: string): string
```

Generate a memorable passphrase comprised of words chosen randomly from the given wordlist.

There are wordlists available in the [wordlist module](#secure-password-utilitieswordlists), or you can provide your own.

```ts
import {DEFAULT_WORDLIST} from 'secure-password-utilities/wordlists';

generatePassphrase(6, DEFAULT_WORDLIST); // canopener-uncanny-hatchet-murky-agony-traitor
generatePassphrase(6, DEFAULT_WORDLIST); // backpack-craftwork-sweat-postcard-imaging-litter
```

The word separator defaults to a dash (`-`), but you can customize this behavior using the third argument.

```ts
generatePassphrase(6, DEFAULT_WORDLIST, '_'); // goldfish_scorpion_antiviral_pursuit_demanding_motto
```

#### generatePin

```ts
function generatePin(length: number): string
```

Generate a random digit pin.

```ts
generatePin(6); // 036919
generatePin(8); // 45958396
```

#### generateCharacters

```ts
function generateCharacters(length: number, charset: string): string
```

Generate a string of `length` characters chosen randomly from the given `charset`.

```ts
generateCharacters(4, '$%^&');                          // &$&^
generateCharacters(6, '0123456789');                    // 947682
generateCharacters(6, 'abcdefghijklmnopqrstuvwxyz');    // ihdrnn
```

### secure-password-utilities/constants

```ts
import {DIGIT_CHARSET, LOWERCASE_CHARSET, UPPERCASE_CHARSET, SYMBOL_CHARSET} from 'secure-password-utilities/constants'
```

#### DIGIT_CHARSET

```ts
const DIGIT_CHARSET = "0123456789";
```

#### LOWERCASE_CHARSET

```ts
const LOWERCASE_CHARSET = "abcdefghijklmnopqrstuvwxyz";
```

#### UPPERCASE_CHARSET

```ts
const UPPERCASE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
```

#### SYMBOL_CHARSET

```ts
// OWASP password special characters except space and backslash.
//
//     See https://owasp.org/www-community/password-special-characters
//
const SYMBOL_CHARSET = "!\"#$%&'()*+,-./:;<=>?@[]{}^_`|~";
```

### secure-password-utilities/csprng

```ts
import {getRandomBytes} from 'secure-password-utilities/csprng'
```

#### getRandomBytes

```ts
function getRandomBytes(numBytes: number): Uint8Array;
```

Generates random bytes. This is a wrapper around the platform's native CSPRNG. In node, this will be `randomBytes` from the standard library. In the browser, this will be `crypto.getRandomValues`.

### secure-password-utilities/random

```ts
import {getRandomNumbersInRange, getRandomValues, randomizeCharacters} from 'secure-password-utilities/random'
```

#### getRandomNumbersInRange

```ts
function getRandomNumbersInRange(length: number, start: number, end: number): number[]
```

Get a list of random numbers where each number is greater than or equal to `start` and less than `end`.

The `end` of the range must be less than or equal to 2^16.

```ts
getRandomNumbersInRange(6, 0, 10) // [8, 2, 1, 3, 5, 0]
getRandomNumbersInRange(6, 10, 20); // [ 18, 10, 13, 12, 12, 19 ]
getRandomNumbersInRange(6, 0, 1000); // [111, 752, 41, 420, 360, 630]
```

#### getRandomValues

*Note: This is deprecated, use `getRandomNumbersInRange` instead.*

```ts
function getRandomValues(numValues: number, rangeMax?: number): Uint8Array
```

Get random values between 0 and `rangeMax` (at most, 256 exclusive) from a CSPRNG.

This is a helper function to safely filter random byte values into a desired range. "safely" here meaning careful use of the modulo operator to avoid modulo bias.

#### randomizeCharacters

```ts
function randomizeCharacters(characters: string): string
```

Randomize the ordering of the characters in the given string.

```ts
randomizeCharacters('randomize me');     // e znmaedimro
randomizeCharacters('randomize me');     // arndimz moee
randomizeCharacters('randomize me');     // ai emdonmrze
```

### secure-password-utilities/wordlists

```ts
import {DEFAULT_WORDLIST, EFF_LONG_WORDLIST} from 'secure-password-utilities/wordlists'
```

#### DEFAULT_WORDLIST

```ts
const DEFAULT_WORDLIST = Object.freeze([/* EFF long wordlist minus a few entries (see below) */]);
```

This is the "default" wordlist for use with this library. It is the same as the EFF long wordlist but with the following entries removed:

* drop-down
* flet-tip
* t-shirt
* yo-yo

The reason for this is that a frequent passphrase separator is the "-" which can then result in ambiguous word separations. This keeps the resulting passphrase prettier (in the case where it's joined by dashes) with an unambiguous and deterministic number of dashes.

#### EFF_LONG_WORDLIST

```ts
const EFF_LONG_WORDLIST = Object.freeze([/* EFF long wordlist, see https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt */]);
```

The [EFF recommended wordlist](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases) for passphrases.

## License

The MIT License (MIT). See [LICENSE file](LICENSE).
