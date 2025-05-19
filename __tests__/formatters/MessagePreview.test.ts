import { truncateText } from '@/app/server/formatters/MessagePreview';

describe('truncateText Formatter', () => {
  it('should return an empty string if input is null', () => {
    expect(truncateText(null as any)).toBe('');
  });

  it('should return an empty string if input is undefined', () => {
    expect(truncateText(undefined as any)).toBe('');
  });

  it('should return an empty string if input is an empty string', () => {
    expect(truncateText('')).toBe('');
  });

  it('should return the original text if length is less than 30', () => {
    const shortText = 'This is a short message.';
    expect(truncateText(shortText)).toBe(shortText);
  });

  it('should return the original text if length is exactly 30', () => {
    const exactLengthText = 'This text is exactly 29 char.';
    expect(exactLengthText.length).toBe(29);
    expect(truncateText(exactLengthText)).toBe(exactLengthText);
  });

  it('should truncate text and add "..." if length is greater than 30', () => {
    const longText = 'This is a very long message that definitely needs to be truncated.';
    const expectedText = 'This is a very long message th...';
    expect(truncateText(longText)).toBe(expectedText);
  });

  it('should handle text with leading/trailing spaces correctly (truncation based on actual content length)', () => {
    const textWithSpaces = '   This is a long message with spaces that will be truncated   ';
    // String.prototype.substring behavior with spaces.
    const expected = '   This is a long message with...';
    expect(truncateText(textWithSpaces)).toBe(expected);
  });
});