const { randomizeCharacters } = require('../random.js');

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
