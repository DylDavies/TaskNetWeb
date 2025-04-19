const mockTransporter = {
    sendMail: jest.fn((mailOptions, callback) => {
      callback(null, { response: '250 OK' }); // Default success
    })
  };
  
  module.exports = {
    createTransport: jest.fn(() => mockTransporter),
    __mockTransporter: mockTransporter // Expose for test manipulation
  };