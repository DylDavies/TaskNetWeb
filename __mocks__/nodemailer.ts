module.exports = {
createTransport: jest.fn(() => ({
    sendMail: jest.fn((_, cb) => cb(null, "success"))
}))
};