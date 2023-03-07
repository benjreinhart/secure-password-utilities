# secure-password-utilities

Zero-dependency utilities for generating secure passwords.

## Usage

```ts
import {generatePassword} from 'secure-password-utilities';

// Default length is 12.
// Defaults include all uppercase/lowercase characters, digits, and symbols.
const password = generatePassword();
console.log(password); // l[Nz8UfU.o4/

// Length of resulting password defaults to 12 characters.
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

## License

The MIT License (MIT). See [LICENSE file](LICENSE).
