import { POST } from '@/app/api/paypal/payout/route';
import * as paypalClientModule from '@/app/paypalClient'; // Import as a module
import { NextRequest, NextResponse as NextServerResponse } from 'next/server'; // Alias to avoid conflict

// Mock the entire paypalClient module
jest.mock('../../../../../src/app/paypalClient', () => ({
  getAccessToken: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn((data, options) => ({ // Simulate the NextResponse.json static method
        json: () => Promise.resolve(data),
        status: options?.status || 200,
        headers: new Headers(),
        ok: (options?.status || 200) < 300,
        redirect: jest.fn(),
        clone: jest.fn(),
        statusText: 'OK', // Simplified
        type: 'basic',
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
      })),
    },
  };
});


const mockedGetAccessToken = paypalClientModule.getAccessToken as jest.Mock;
const originalEnv = process.env;
const originalDateNow = Date.now;

describe('POST /api/paypal/payout', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    process.env = { ...originalEnv }; // Reset env for each test

    // Mock Date.now for predictable batchId
    global.Date.now = jest.fn(() => new Date('2023-10-27T10:20:30Z').getTime());
  });

   afterAll(() => {
    process.env = originalEnv; // Restore original environment
    global.Date.now = originalDateNow; // Restore original Date.now
  });

  const requestBody = {
    email: 'receiver@example.com',
    amount: '50.00',
    note: 'Payout for services',
    milestoneId: 'milestone-payout-123',
  };

  it('should process payout successfully in sandbox environment', async () => {
    process.env.PAYPAL_ENV = 'sandbox';
    mockedGetAccessToken.mockResolvedValue('test-access-token');
    fetchMock.mockResponseOnce(JSON.stringify({ batch_header: { payout_batch_id: 'batch-sandbox-123' } }), { status: 201 });

    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    await POST(mockRequest);

    expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api-m.sandbox.paypal.com/v1/payments/payouts');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
      Authorization: 'Bearer test-access-token',
      'Content-Type': 'application/json',
    });
    const expectedBatchId = `batch-${requestBody.milestoneId}-${new Date('2023-10-27T10:20:30Z').getTime()}`;
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
      sender_batch_header: {
        sender_batch_id: expectedBatchId,
        email_subject: 'You have a payment from TaskNet',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: '50.00', currency: "USD" },
          note: 'Payout for services',
          receiver: 'receiver@example.com',
          sender_item_id: `ms-milestone-payout-123`,
        },
      ],
    });

    expect(NextServerResponse.json).toHaveBeenCalledWith({ success: true, batch: { batch_header: { payout_batch_id: 'batch-sandbox-123' } } });
  });

  it('should process payout successfully in live environment', async () => {
    process.env.PAYPAL_ENV = 'live';
    mockedGetAccessToken.mockResolvedValue('live-access-token');
    fetchMock.mockResponseOnce(JSON.stringify({ batch_header: { payout_batch_id: 'batch-live-456' } }), { status: 201 });

    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    await POST(mockRequest);

    expect(fetchMock.mock.calls[0][0]).toBe('https://api-m.paypal.com/v1/payments/payouts');
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).items[0].amount.value).toBe('50.00');
    expect(NextServerResponse.json).toHaveBeenCalledWith({ success: true, batch: { batch_header: { payout_batch_id: 'batch-live-456' } } });
  });

  it('should return error if getAccessToken fails', async () => {
    mockedGetAccessToken.mockRejectedValue(new Error('Token fetch error'));
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    // The error from getAccessToken will propagate
    await expect(POST(mockRequest)).rejects.toThrow('Token fetch error');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(NextServerResponse.json).not.toHaveBeenCalled();
  });

  it('should return error if PayPal payout API call fails', async () => {
    process.env.PAYPAL_ENV = 'sandbox';
    mockedGetAccessToken.mockResolvedValue('test-access-token');
    const errorResponse = { error: 'payout_failed', message: 'Insufficient funds' };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 });
     mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;
    console.error = jest.fn(); // Mock console.error

    await POST(mockRequest);

    expect(console.error).toHaveBeenCalledWith('PayPal payout error', errorResponse);
    expect(NextServerResponse.json).toHaveBeenCalledWith({ error: errorResponse }, { status: 500 });
  });

   it('should handle missing fields in request body by relying on PayPal API validation', async () => {
    process.env.PAYPAL_ENV = 'sandbox';
    mockedGetAccessToken.mockResolvedValue('test-access-token');
    // Simulate PayPal API returning an error due to missing fields
    const errorResponse = { name: 'VALIDATION_ERROR', details: [{ field: 'items[0].receiver', issue: 'Required field'}]};
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 }); // Typically a 400 or 422 for validation

    const incompleteBody = {
        // email: 'receiver@example.com', // Missing email
        amount: '50.00',
        note: 'Payout for services',
        milestoneId: 'milestone-incomplete-payout',
    };
    mockRequest = {
      json: jest.fn().mockResolvedValue(incompleteBody),
    } as unknown as NextRequest;
    console.error = jest.fn();


    await POST(mockRequest);

    expect(fetchMock.mock.calls.length).toEqual(1); // fetch should still be called
    // The body sent to PayPal would be what we constructed, PayPal would reject it
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(sentBody.items[0].receiver).toBeUndefined(); // Check that the problematic field is indeed missing

    expect(console.error).toHaveBeenCalledWith('PayPal payout error', errorResponse);
    expect(NextServerResponse.json).toHaveBeenCalledWith({ error: errorResponse }, { status: 500 });
  });
});