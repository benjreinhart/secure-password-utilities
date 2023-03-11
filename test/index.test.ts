import {
  generatePassword,
  generatePin,
  DIGIT_CHARSET,
  SYMBOL_CHARSET,
  LOWERCASE_CHARSET,
  UPPERCASE_CHARSET,
} from '../src';

// TODO: Can we handle this better?
if (typeof crypto === 'undefined') {
  globalThis.crypto = require('node:crypto').webcrypto;
}

function containsAtLeast(value: string, charset: Array<string>, n: number) {
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

function containsExact(value: string, charset: Array<string>, n: number) {
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
      expect(() => generatePassword({ length: -1 })).toThrowError(
        'Invalid option: length option must be at least 1'
      );

      expect(() => generatePassword({ length: 0 })).toThrowError(
        'Invalid option: length option must be at least 1'
      );
    });

    it('rejects invalid digits option', () => {
      // @ts-ignore
      expect(() => generatePassword({ digits: '%@' })).toThrowError(
        'Invalid option: digits option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ digits: -1 })).toThrowError(
        'Invalid option: digits option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ digits: { min: -1 } })).toThrowError(
        'Invalid option: digits option must be a boolean, number, or object'
      );
    });

    it('rejects invalid symbols option', () => {
      // @ts-ignore
      expect(() => generatePassword({ symbols: '%@' })).toThrowError(
        'Invalid option: symbols option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ symbols: -1 })).toThrowError(
        'Invalid option: symbols option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ symbols: { min: -1 } })).toThrowError(
        'Invalid option: symbols option must be a boolean, number, or object'
      );
    });

    it('rejects invalid lowercase option', () => {
      // @ts-ignore
      expect(() => generatePassword({ lowercase: '%@' })).toThrowError(
        'Invalid option: lowercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ lowercase: -1 })).toThrowError(
        'Invalid option: lowercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ lowercase: { min: -1 } })).toThrowError(
        'Invalid option: lowercase option must be a boolean, number, or object'
      );
    });

    it('rejects invalid uppercase option', () => {
      // @ts-ignore
      expect(() => generatePassword({ uppercase: '%@' })).toThrowError(
        'Invalid option: uppercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ uppercase: -1 })).toThrowError(
        'Invalid option: uppercase option must be a boolean, number, or object'
      );
      expect(() => generatePassword({ uppercase: { min: -1 } })).toThrowError(
        'Invalid option: uppercase option must be a boolean, number, or object'
      );
    });

    it('rejects length / requested character mismatch', () => {
      expect(() =>
        generatePassword({
          length: 8,
          digits: 2,
          symbols: 2,
          lowercase: { min: 3 },
          uppercase: 2,
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword({
          length: 6,
          digits: 8,
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword({
          length: 6,
          lowercase: { min: 8 },
        })
      ).toThrowError('Invalid option: Requested characters exceeds expected length');

      expect(() =>
        generatePassword({
          length: 6,
          digits: false,
          symbols: false,
          lowercase: 2,
          uppercase: 2,
        })
      ).toThrowError('Invalid option: Requested less characters than expected length');
    });

    it('can generate a secure password', () => {
      const password1 = generatePassword();
      const password2 = generatePassword();
      const password3 = generatePassword();

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
        const password = generatePassword({
          length: i,
          digits: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_DIGITS_REGEX);
      }
    });

    it('can disable symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          symbols: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_SYMBOLS_REGEX);
      }
    });

    it('can disable lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          lowercase: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_LOWERCASE_REGEX);
      }
    });

    it('can disable uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          uppercase: false,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_WITHOUT_UPPERCASE_REGEX);
      }
    });

    it('can require an exact number of digits', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          digits: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, DIGIT_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          symbols: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, SYMBOL_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          lowercase: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, LOWERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require an exact number of uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          uppercase: 2,
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsExact(password, UPPERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of digits', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          digits: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, DIGIT_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of symbols', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          symbols: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, SYMBOL_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of lowercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          lowercase: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, LOWERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a minimum number of uppercase', () => {
      for (let i = 6; i <= 24; i++) {
        const password = generatePassword({
          length: i,
          uppercase: { min: 2 },
        });

        expect(password).toHaveLength(i);
        expect(password).toMatch(PASSWORD_REGEX);
        expect(containsAtLeast(password, UPPERCASE_CHARSET.split(''), 2)).toBeTruthy();
      }
    });

    it('can require a mix of exact and minimum', () => {
      for (let i = 8; i <= 24; i++) {
        const password = generatePassword({
          length: i,
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
  });

  describe('generatePin', () => {
    it('rejects invalid length property', () => {
      expect(() => generatePin(-1)).toThrowError(
        'Invalid option: length option must be at least 1'
      );

      expect(() => generatePin(0)).toThrowError('Invalid option: length option must be at least 1');
    });

    it('can generate a random pin', () => {
      for (let i = 4; i <= 12; i++) {
        const pin = generatePin(i);
        expect(pin).toHaveLength(i);
        expect(pin).toMatch(/^\d+$/);
      }
    });
  });
});
