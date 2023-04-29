# secure-password-utilities ![Github CI](https://github.com/benjreinhart/secure-password-utilities/workflows/Github%20CI/badge.svg)

Secure, zero-dependency utilities for generating passwords, pins, and more.

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

#### Constants

```ts
import {
  DIGIT_CHARSET,
  LOWERCASE_CHARSET,
  UPPERCASE_CHARSET,
  SYMBOL_CHARSET
} from 'secure-password-utilities';

console.log(DIGIT_CHARSET);     // 0123456789
console.log(LOWERCASE_CHARSET); // abcdefghijklmnopqrstuvwxyz
console.log(UPPERCASE_CHARSET); // ABCDEFGHIJKLMNOPQRSTUVWXYZ
console.log(SYMBOL_CHARSET);    // !"#$%&\'()*+,-./:;<=>?@[]{}^_`|~
```

#### `generatePassword(length: number, options: PasswordOptionsType): string`

Generates a random password.

Uses a CSPRNG for randomness.

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

#### `generatePin(length: number): string`

Generate a random digit pin.

Uses a CSPRNG for randomness.

```ts
generatePin(6); // 036919
generatePin(8); // 45958396
```

#### `generateCharacters(length: number, charset: string): string`

Generate a string of `length` characters chosen randomly from the given `charset`.

Uses a CSPRNG for randomness.

```ts
generateCharacters(4, '$%^&');                          // &$&^
generateCharacters(6, '0123456789');                    // 947682
generateCharacters(6, 'abcdefghijklmnopqrstuvwxyz');    // ihdrnn
```

#### `randomizeCharacters(characters: string): string`

Randomize the ordering of the characters in the given string.

Uses a CSPRNG for randomness.

```ts
randomizeCharacters('randomize me');     // e znmaedimro
randomizeCharacters('randomize me');     // arndimz moee
randomizeCharacters('randomize me');     // ai emdonmrze
```

## License

The MIT License (MIT). See [LICENSE file](LICENSE).
