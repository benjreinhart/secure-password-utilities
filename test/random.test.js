const { getRandomNumbersInRange, randomizeCharacters } = require('../random.js');

describe('getRandomNumbersInRange', () => {
  it('rejects invalid length argument', () => {
    expect(() => getRandomNumbersInRange(-1, 0, 10)).toThrowError(
      'Invalid argument: length must be a number greater than or equal to 1'
    );

    expect(() => getRandomNumbersInRange(0, 0, 10)).toThrowError(
      'Invalid argument: length must be a number greater than or equal to 1'
    );

    expect(() => getRandomNumbersInRange('5', 0, 10)).toThrowError(
      'Invalid argument: length must be a number greater than or equal to 1'
    );
  });

  it('rejects invalid start argument', () => {
    expect(() => getRandomNumbersInRange(6, -1, 10)).toThrowError(
      'Invalid argument: start must be a number greater than or equal to 0'
    );

    expect(() => getRandomNumbersInRange(6, '0', 10)).toThrowError(
      'Invalid argument: start must be a number greater than or equal to 0'
    );
  });

  it('rejects invalid end argument', () => {
    expect(() => getRandomNumbersInRange(6, 0, '10')).toThrowError(
      'Invalid argument: end must be a number less than or equal to 65536'
    );

    expect(() => getRandomNumbersInRange(6, 0, 2 ** 16 + 1)).toThrowError(
      'Invalid argument: end must be a number less than or equal to 65536'
    );
  });

  it('rejects invalid ranges', () => {
    expect(() => getRandomNumbersInRange(6, 0, 0)).toThrowError(
      'Invalid range: range must contain at least two values'
    );

    expect(() => getRandomNumbersInRange(6, 0, 1)).toThrowError(
      'Invalid range: range must contain at least two values'
    );

    expect(() => getRandomNumbersInRange(6, 100, 101)).toThrowError(
      'Invalid range: range must contain at least two values'
    );
  });

  it('can get random numbers in a range', () => {
    for (let i = 0; i < 20; i++) {
      const result = getRandomNumbersInRange(6, 0, 10);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(6);
      expect(result.every(Number.isInteger)).toBe(true);
      expect(result.every((n) => n >= 0 && n < 10)).toBe(true);
    }
  });

  it('can get random numbers in a range with a higher range start', () => {
    for (let i = 0; i < 20; i++) {
      const result = getRandomNumbersInRange(6, 1000, 1010);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(6);
      expect(result.every(Number.isInteger)).toBe(true);
      expect(result.every((n) => n >= 1000 && n < 1010)).toBe(true);
    }
  });

  it('can get random numbers in a large range', () => {
    for (let i = 0; i < 20; i++) {
      const result = getRandomNumbersInRange(3, 11, 50000);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result.every(Number.isInteger)).toBe(true);
      expect(result.every((n) => n >= 11 && n < 50000)).toBe(true);
    }
  });
});

describe('randomizeCharacters', () => {
  it('rejects invalid argument', () => {
    expect(() => randomizeCharacters(10)).toThrowError(
      'Invalid argument: characters argument must be a string'
    );
  });

  it('is a no-op for strings with 1 character or less', () => {
    expect(randomizeCharacters('')).toEqual('');
    expect(randomizeCharacters('#')).toEqual('#');
  });

  it('can randomize a string of characters', () => {
    const originalString = 'A string to randomize';

    const charCounts = {};
    for (const char of originalString) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      const randomizedString = randomizeCharacters(originalString);
      expect(randomizedString).toHaveLength(originalString.length);

      // Ensure the same characters from original string are present the same number of times.
      for (const [char, expectedCharCount] of Object.entries(charCounts)) {
        const actualCharCount = Array.from(randomizedString).reduce(
          (count, c) => count + Number(char === c),
          0
        );
        expect(actualCharCount).toEqual(expectedCharCount);
      }
    }
  });
});
