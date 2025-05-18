import { POST } from '@/app/api/paypal/create-order/route';
// paypalClient is used by the route.ts, so its mock setup is important
// import { paypalClient } from '@/app/paypalClient'; // For TS context of the actual route
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

// Corrected path for jest.mock
jest.mock('../../../../../src/app/paypalClient', () => ({
  paypalClient: jest.fn(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn(data => ({
      json: () => Promise.resolve(data),
      status: 200, // Default status
      headers: new Headers(),
      ok: true,
      redirect: jest.fn(),
      clone: jest.fn(),
      statusText: 'OK',
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
}));

// Get the mock function correctly
const { paypalClient: mockedPaypalClientModule } = jest.requireMock('../../../../../src/app/paypalClient');
const mockPaypalClientExecute = (mockedPaypalClientModule() as any).execute as jest.Mock;


describe('POST /api/paypal/create-order', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation for each test if necessary
    // The execute function is on the object returned by paypalClient()
    mockPaypalClientExecute.mockReset();
    // Re-assign the client mock's execute function
    (mockedPaypalClientModule as jest.Mock).mockReturnValue({ execute: mockPaypalClientExecute });
  });

  it('should create an order and return orderID successfully', async () => {
    const requestBodyFromRoute = { amount: '100.00', milestoneId: 'milestone-123' };
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBodyFromRoute),
    } as unknown as NextRequest;

    const mockOrderResponse = {
      result: {
        id: 'test-order-id',
        status: 'CREATED',
      },
    };
    mockPaypalClientExecute.mockResolvedValue(mockOrderResponse);

    await POST(mockRequest);

    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockPaypalClientExecute).toHaveBeenCalledTimes(1);

    const executedRequest = mockPaypalClientExecute.mock.calls[0][0];
    expect(executedRequest).toBeInstanceOf(checkoutNodeJssdk.orders.OrdersCreateRequest);

    // Log the actual .body property that the test will use
    console.log('--- Test Log ---');
    console.log('executedRequest.body:', JSON.stringify(executedRequest.body, null, 2));
    console.log('typeof executedRequest.body:', typeof executedRequest.body);
    console.log('--- End Test Log ---');

    const expectedPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: "USD", value: '100.00' },
        custom_id: 'milestone-123',
      }],
    };

    expect(executedRequest.body).toEqual(expectedPayload);

    expect(NextResponse.json).toHaveBeenCalledWith({ orderID: 'test-order-id' });
  });

  // ... other tests (handle errors, missing amount) remain the same
  // but ensure they also use the correct mock path and access .body if checking the request payload

   it('should handle errors during order creation', async () => {
    const requestBody = { amount: '100.00', milestoneId: 'milestone-error' };
     mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    const error = new Error('PayPal API Error');
    mockPaypalClientExecute.mockRejectedValue(error);

    await expect(POST(mockRequest)).rejects.toThrow('PayPal API Error');
    expect(NextResponse.json).not.toHaveBeenCalled();
  });

   it('should handle missing amount in request body gracefully (or as PayPal SDK dictates)', async () => {
    const requestBody = { milestoneId: 'milestone-no-amount' } as any; // Amount is missing
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    mockPaypalClientExecute.mockImplementation((requestInstance: any) => {
      const actualBody = requestInstance.body; // The body set by the route
      if (!actualBody || !actualBody.purchase_units || !actualBody.purchase_units[0] || !actualBody.purchase_units[0].amount || !actualBody.purchase_units[0].amount.value) {
        throw new Error('Amount is required by PayPal SDK or request structure is invalid');
      }
      return Promise.resolve({ result: { id: 'some-id' }});
    });

    await expect(POST(mockRequest)).rejects.toThrow('Amount is required by PayPal SDK or request structure is invalid');
    expect(NextResponse.json).not.toHaveBeenCalled();
  });

});