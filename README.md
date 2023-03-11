# secure-password-utilities

Zero-dependency utilities for generating secure passwords and pins.

## Usage

```
npm install secure-password-utilities
```

Basic usage:

```ts
import {generatePassword, generatePin} from 'secure-password-utilities';

// Default length is 12.
// Defaults include all uppercase/lowercase characters, digits, and symbols.
const password = generatePassword();
console.log(password); // l[Nz8UfU.o4g

const pin = generatePin(6);
console.log(pin); // 036919
```

## API

#### `generatePassword(options: PasswordOptionsType): string`

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

type PasswordOptionsType = {
  length: number;
  digits: PasswordOptionType;
  symbols: PasswordOptionType;
  lowercase: PasswordOptionType;
  uppercase: PasswordOptionType;
};
```

Examples:

```ts
const password = generatePassword({
  symbols: 2,               // Resulting password must contain exactly two symbols.
  uppercase: { min: 1 },    // Resulting password must contain a minimum of 1 upperase character.
});
console.log(password); // b1yT6$jO`kvf

const uppercasePassword = generatePassword({
  length: 10,               // Length of the resulting password.
  digits: false,            // Resulting password must NOT contain any digits.
  symbols: false,           // Resulting password must NOT contain any symbols.
  lowercase: false,         // Resulting password must NOT contain any lowercase characters.
});
console.log(uppercasePassword); // IHDPPZRNPS
```

#### `generatePin(length: number): string`

Generate a random digit pin.

Examples:

```ts
generatePin(6); // 036919
generatePin(8); // 45958396
```

## License

The MIT License (MIT). See [LICENSE file](LICENSE).
