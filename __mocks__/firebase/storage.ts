export const ref = jest.fn().mockImplementation((_, path) => ({ fullPath: path }));
export const uploadBytesResumable = jest.fn().mockReturnValue({
  on: jest.fn(),
  snapshot: { ref: {} }
});
export const getDownloadURL = jest.fn();
export const getStorage = jest.fn();