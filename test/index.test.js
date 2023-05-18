const { generatePassword, generatePin, generateCharacters } = require('../');
const {
  DIGIT_CHARSET,
  SYMBOL_CHARSET,
  LOWERCASE_CHARSET,
  UPPERCASE_CHARSET,
} = require('../constants');

function containsAtLeast(value, charset, n) {
  if (n < 1 || n > value.length) {
    throw new Error('invalid number argument');
  }

  let matches = 0;

  for (let i = 0; i < value.length; i++) {
    if (charset.includes(value[i])) {
      matches += 1;
      if (matches === n) {
        return true;
      }
    }
  }

  return false;
}

function containsExact(value, charset, n) {
  if (n < 1 || n > value.length) {
    throw new Error('invalid number argument');
  }

  let matches = 0;

  for (let i = 0; i < value.length; i++) {
    if (charset.includes(value[i])) {
      matches += 1;
    }
  }

  return matches === n;
}

const PASSWORD_REGEX = /^[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@\[\]{}^_`|~]+$/;
const PASSWORD_WITHOUT_DIGITS_REGEX = /^[a-zA-Z!"#$%&'()*+,-./:;<=>?@\[\]{}^_`|~]+$/;
const PASSWORD_WITHOUT_SYMBOLS_REGEX = /^[a-zA-Z0-9]+$/;
const PASSWORD_WITHOUT_LOWERCASE_REGEX = /^[A-Z0-9!"#$%&'()*+,-./:;<=>?@\[\]{}^_`|~]+$/;
const PASSWORD_WITHOUT_UPPERCASE_REGEX = /^[a-z0-9!"#$%&'()*+,-./:;<=>?@\[\]{}^_`|~]+$/;

describe('secure-password-utilities', () => {
  describe('generatePassword', () => {
    it('rejects invalid length property', () => {
      expect(() => generatePassword(-1)).toThrowError(
        'Invalid option: length option must be a number greater than or equal to 1'
      );

      expect(() => generatePassword(0)).toThrowError(
        'Invalid option: length option must be a number greater than or equal to 1'
      );

      expect(() => generatePassword('3')).toThrowError(
        'Invalid option: length option must be a number greater than or equal to 1'
      );
    });

    it('rejects invalid digits option', () => {
      expect(() => generatePassword(8, { digits: '%@' })).toThrowError(
        'Invalid option: digits option must be a boolean, number, or object'
      );
      expect(() => generatePassword(8, { digits: -1 })).toThrowError(
        'Invalid option: digits option cannot be a negative number'
      );
      expect(() => generatePassword(8, { digits: { min: -1 } })).toThrowError(
        "Invalid option: digits option 'min' property must be a non-negative integer"
      );
    });

    it('rejects invalid symbols option', () => {
      expect(() => generatePassword(8, { symbols: '%@' })).toThrowError(
        'Invalid option: symbols option must be a boolean, number, or object'
      );
      expect(() => generatePassword(8, { symbols: -1 })).toThrowError(
        'Invalid option: symbols option cannot be a negative number'
      );
      expect(() => generatePassword(8, { symbols: { min: -1 } })).toThrowError(
        "Invalid option: symbols option 'min' property must be a non-negative integer"
      );
    });

    it('rejects invalid lowercase option', () => {
      expect(() => generatePassword(8, { lowercase: '%@' })).toThrowError(
        'Invalid option: lowercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword(8, { lowercase: -1 })).toThrowError(
        'Invalid option: lowercase option cannot be a negative number'
      );
      expect(() => generatePassword(8, { lowercase: { min: -1 } })).toThrowError(
        "Invalid option: lowercase option 'min' property must be a non-negative integer"
      );
    });

    it('rejects invalid uppercase option', () => {
      expect(() => generatePassword(8, { uppercase: '%@' })).toThrowError(
        'Invalid option: uppercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword(8, { uppercase: -1 })).toThrowError(
        'Invalid option: uppercase option cannot be a negative number'
      );
      expect(() => generatePassword(8, { uppercase: { min: -1 } })).toThrowError(
        "Invalid option: uppercase option 'min' property must be a non-negative integer"
      );
    });

    it('rejects invalid charset options', () => {
      expect(() => generatePassword(8, { charset: { digits: {} } })).toThrowError(
        'Invalid charset option: digits charset must be a string'
      );
      expect(() => generatePassword(8, { charset: { digits: 'abc123a' } })).toThrowError(
        'Invalid charset option: digits charset contains duplicate characters'
      );

      expect(() => generatePassword(8, { charset: { symbols: {} } })).toThrowError(
        'Invalid charset option: symbols charset must be a string'
      );
      expect(() => generatePassword(8, { charset: { symbols: 'abc123a' } })).toThrowError(
        'Invalid charset option: symbols charset contains duplicate characters'
      );

      expect(() => generatePassword(8, { charset: { lowercase: {} } })).toThrowError(
        'Invalid charset option: lowercase charset must be a string'
      );
      expect(() => generatePassword(8, { charset: { lowercase: 'abc123a' } })).toThrowError(
        'Invalid charset option: lowercase charset contains duplicate characters'
      );

      expect(() => generatePassword(8, { charset: { uppercase: {} } })).toThrowError(
        'Invalid charset option: uppercase charset must be a string'
      );
      expect(() => generatePassword(8, { charset: { uppercase: 'abc123a' } })).toThrowError(
        'Invalid charset option: uppercase charset contains duplicate characters'
      );
    });

    it('rejects length / requested character mismatch', () => {
      expect(() =>
        generatePassword(8, {
          digits: 2,
          symbols: 2,
          lowercase: { min: 3 },
          uppercase: 2,
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword(6, {
          digits: 8,
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword(6, {
          lowercase: { min: 8 },
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword(6, {
          digits: false,
          symbols: false,
          lowercase: 2,
          uppercase: 2,
        })
      ).toThrowError('Invalid option: Requested less characters than expected length');
    });

    it('can generate a secure password', () => {
      const password1 = generatePassword(12);
      const password2 = generatePassword(12);
      const password3 = generatePassword(12);

      expect(password1).toHaveLength(12);
      expect(password1).toMatch(PASSWORD_REGEX);

      expect(password2).toHaveLength(12);
      expect(password2).toMatch(PASSWORD_REGEX);

      expect(password3).toHaveLength(12);
      expect(password3).toMatch(PASSWORD_REGEX);

      expect(password1).not.toEqual(password2);
      expect(password2).not.toEqual(password3);
    });

    it('can disable digits', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_DIGITS_REGEX);
      }
    });

    it('can disable symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          symbols: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_SYMBOLS_REGEX);
      }
    });

    it('can disable lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          lowercase: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_LOWERCASE_REGEX);
      }
    });

    it('can disable uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          uppercase: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_UPPERCASE_REGEX);
      }
    });

    it('can require an exact number of digits', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, DIGIT_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          symbols: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, SYMBOL_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          lowercase: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, LOWERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          uppercase: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, UPPERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of digits', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, DIGIT_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          symbols: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, SYMBOL_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          lowercase: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, LOWERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword(i, {
          uppercase: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, UPPERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a mix of exact and minimum', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: { min: 2 },
          symbols: 2,
          uppercase: { min: 1 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, DIGIT_CHARSET.split(''), 2)).toBeTruthy();
        expect(containsExact(password, SYMBOL_CHARSET.split(''), 2)).toBeTruthy();
        expect(containsAtLeast(password, UPPERCASE_CHARSET.split(''), 1)).toBeTruthy();
      }
    });

    it('can override the digits charset', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword(i, {
          symbols: false,
          lowercase: false,
          uppercase: false,
          charset: { digits: '12345' },
        });
        expect(password).toHaveLength(i);
        expect(password).toMatch(/^[12345]+$/);
      }
    });

    it('can override the symbols charset', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: false,
          lowercase: false,
          uppercase: false,
          charset: { symbols: '!@#$%' },
        });
        expect(password).toHaveLength(i);
        expect(password).toMatch(/^[!@#$%]+$/);
      }
    });

    it('can override the lowercase charset', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: false,
          symbols: false,
          uppercase: false,
          charset: { lowercase: 'abcdef' },
        });
        expect(password).toHaveLength(i);
        expect(password).toMatch(/^[abcdef]+$/);
      }
    });

    it('can override the uppercase charset', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword(i, {
          digits: false,
          symbols: false,
          lowercase: false,
          charset: { uppercase: 'ABCDEF' },
        });
        expect(password).toHaveLength(i);
        expect(password).toMatch(/^[ABCDEF]+$/);
      }
    });
  });

  describe('generatePin', () => {
    it('rejects invalid length argument', () => {
      expect(() => generatePin(-1)).toThrowError(
        'Invalid argument: length argument must be a number greater than or equal to 1'
      );

      expect(() => generatePin(0)).toThrowError(
        'Invalid argument: length argument must be a number greater than or equal to 1'
      );

      expect(() => generatePin('5')).toThrowError(
        'Invalid argument: length argument must be a number greater than or equal to 1'
      );
    });

    it('can generate a random pin', () => {
      for (let i = 4; i <= 12; i++) {
        const pin = generatePin(i);
        expect(pin).toHaveLength(i);
        expect(pin).toMatch(/^\d+$/);
      }
    });
  });

  describe('generateCharacters', () => {
    it('rejects invalid length argument', () => {
      expect(() => generateCharacters(-1, 'abcdef')).toThrowError(
        'Invalid argument: length argument must be a number greater than or equal to 0'
      );

      expect(() => generateCharacters('0', 'abcdef')).toThrowError(
        'Invalid argument: length argument must be a number greater than or equal to 0'
      );
    });

    it('rejects invalid charset argument', () => {
      expect(() => generateCharacters(5, ['a', 'b'])).toThrowError(
        'Invalid argument: charset argument must be a string with length greater than or equal to 2'
      );

      expect(() => generateCharacters(5, 'a')).toThrowError(
        'Invalid argument: charset argument must be a string with length greater than or equal to 2'
      );
    });

    it('can generate a string of random characters from charset argument', () => {
      for (let i = 4; i <= 12; i++) {
        const str = generateCharacters(i, 'abcdef');
        expect(str).toHaveLength(i);
        expect(str).toMatch(/^[abcdef]+$/);
      }

      for (let i = 4; i <= 12; i++) {
        const str = generateCharacters(i, '&1#@45;BC');
        expect(str).toHaveLength(i);
        expect(str).toMatch(/^[&1#@45;BC]+$/);
      }
    });
  });
});
