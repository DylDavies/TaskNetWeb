import { paypalClient, getAccessToken } from '@/app/paypalClient';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// Mock the @paypal/checkout-server-sdk
jest.mock('@paypal/checkout-server-sdk', () => ({
  core: {
    SandboxEnvironment: jest.fn().mockImplementation(() => ({ type: 'sandbox' })),
    LiveEnvironment: jest.fn().mockImplementation(() => ({ type: 'live' })),
    PayPalHttpClient: jest.fn().mockImplementation(environment => ({
      execute: jest.fn(),
      environment: environment,
    })),
  },
}));

// Mock process.env
const originalEnv = process.env;

describe('paypalClient Module', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset modules to clear process.env cache
    process.env = { ...originalEnv };
    fetchMock.resetMocks();
    // Clear mock implementation details too
    (checkoutNodeJssdk.core.SandboxEnvironment as jest.Mock).mockClear();
    (checkoutNodeJssdk.core.LiveEnvironment as jest.Mock).mockClear();
    (checkoutNodeJssdk.core.PayPalHttpClient as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original environment
  });

  describe('paypalClient() function (environment selection)', () => {
    it('should use SandboxEnvironment when PAYPAL_ENV is not "live"', () => {
      process.env.PAYPAL_CLIENT_ID = 'test-sandbox-id';
      process.env.PAYPAL_CLIENT_SECRET = 'test-sandbox-secret';
      process.env.PAYPAL_ENV = 'sandbox';

      const client = paypalClient();
      expect(checkoutNodeJssdk.core.SandboxEnvironment).toHaveBeenCalledWith('test-sandbox-id', 'test-sandbox-secret');
      expect(checkoutNodeJssdk.core.LiveEnvironment).not.toHaveBeenCalled();
      expect(client.environment).toEqual({ type: 'sandbox' }); // Check the mocked environment type
    });

    it('should use LiveEnvironment when PAYPAL_ENV is "live"', () => {
      process.env.PAYPAL_CLIENT_ID = 'test-live-id';
      process.env.PAYPAL_CLIENT_SECRET = 'test-live-secret';
      process.env.PAYPAL_ENV = 'live';

      const client = paypalClient();
      expect(checkoutNodeJssdk.core.LiveEnvironment).toHaveBeenCalledWith('test-live-id', 'test-live-secret');
      expect(checkoutNodeJssdk.core.SandboxEnvironment).not.toHaveBeenCalled();
      expect(client.environment).toEqual({ type: 'live' }); // Check the mocked environment type
    });

     it('should default to SandboxEnvironment if PAYPAL_ENV is undefined', () => {
      process.env.PAYPAL_CLIENT_ID = 'default-id';
      process.env.PAYPAL_CLIENT_SECRET = 'default-secret';
      delete process.env.PAYPAL_ENV;

      const client = paypalClient();
      expect(checkoutNodeJssdk.core.SandboxEnvironment).toHaveBeenCalledWith('default-id', 'default-secret');
      expect(client.environment).toEqual({ type: 'sandbox' });
    });
  });

  describe('getAccessToken() function', () => {
    it('should fetch access token successfully for sandbox environment', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test-client-id';
      process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
      process.env.PAYPAL_ENV = 'sandbox';

      fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'sandbox_token_123' }));

      const token = await getAccessToken();
      expect(token).toBe('sandbox_token_123');
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toBe('https://api-m.sandbox.paypal.com/v1/oauth2/token');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
        Authorization: `Basic ${Buffer.from('test-client-id:test-client-secret').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      });
      expect(fetchMock.mock.calls[0][1]?.body).toBe('grant_type=client_credentials');
    });

    it('should fetch access token successfully for live environment', async () => {
      process.env.PAYPAL_CLIENT_ID = 'live-client-id';
      process.env.PAYPAL_CLIENT_SECRET = 'live-client-secret';
      process.env.PAYPAL_ENV = 'live';

      fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'live_token_456' }));

      const token = await getAccessToken();
      expect(token).toBe('live_token_456');
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toBe('https://api-m.paypal.com/v1/oauth2/token');
    });

    it('should throw an error if fetching token fails', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test-client-id';
      process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
      process.env.PAYPAL_ENV = 'sandbox';

      fetchMock.mockResponseOnce(JSON.stringify({ error_description: 'Authentication failed' }), { status: 401 });

      await expect(getAccessToken()).rejects.toThrow('Failed to get PayPal token: Authentication failed');
    });

     it('should throw an error if response is not ok and no error_description', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test-client-id';
      process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
      process.env.PAYPAL_ENV = 'sandbox';

      fetchMock.mockResponseOnce(JSON.stringify({ message: 'Some error' }), { status: 500 });
      // Note: The error message will include 'undefined' if error_description is missing from the response.
      // This is consistent with the current implementation: `Failed to get PayPal token: ${data.error_description}`
      await expect(getAccessToken()).rejects.toThrow('Failed to get PayPal token: undefined');
    });
  });
});