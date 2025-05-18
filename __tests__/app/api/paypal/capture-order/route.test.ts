import { POST } from '@/app/api/paypal/capture-order/route';
// paypalClient is used by the route.ts, so its mock setup is important
import { paypalClient } from '@/app/paypalClient'; // Keep for TS context
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { NextRequest, NextResponse as NextServerResponse } from 'next/server';

// Mock paypalClient using the correct relative path
jest.mock('../../../../../src/app/paypalClient', () => ({ // Adjusted path
  paypalClient: jest.fn(() => ({
    execute: jest.fn(),
  })),
}));

// Mock NextResponse (remains the same)
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn(data => ({
        json: () => Promise.resolve(data),
        status: 200,
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
  };
});

// Get the mock function correctly
const mockPaypalClientExecute = (jest.requireMock('../../../../../src/app/paypalClient')
  .paypalClient() as any).execute as jest.Mock;

describe('POST /api/paypal/capture-order', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaypalClientExecute.mockReset();
     (require('../../../../../src/app/paypalClient').paypalClient as jest.Mock).mockReturnValue({ execute: mockPaypalClientExecute });

  });

  it('should capture an order and return capture details successfully', async () => {
    const orderIdToCapture = 'test-order-id-to-capture';
    const requestBody = { orderID: orderIdToCapture };
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    const mockCaptureResponse = {
      result: {
        id: 'capture-id-123',
        status: 'COMPLETED',
      },
    };
    mockPaypalClientExecute.mockResolvedValue(mockCaptureResponse);

    await POST(mockRequest);

    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockPaypalClientExecute).toHaveBeenCalledTimes(1);

    const executedRequest = mockPaypalClientExecute.mock.calls[0][0];
    expect(executedRequest).toBeInstanceOf(checkoutNodeJssdk.orders.OrdersCaptureRequest);

    // Corrected assertion: check the path for the orderID
    const expectedPath = `/v2/checkout/orders/${encodeURIComponent(orderIdToCapture)}/capture?`;
    expect(executedRequest.path).toBe(expectedPath);

    expect(NextServerResponse.json).toHaveBeenCalledWith({ capture: mockCaptureResponse.result });
  });

  it('should handle errors during order capture', async () => {
    const requestBody = { orderID: 'order-capture-error' };
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    const error = new Error('PayPal Capture API Error');
    mockPaypalClientExecute.mockRejectedValue(error);

    await expect(POST(mockRequest)).rejects.toThrow('PayPal Capture API Error');
    expect(NextServerResponse.json).not.toHaveBeenCalled();
  });

  it('should handle missing orderID in request body', async () => {
    const requestBody = {} as any; // orderID is missing
    mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    // The OrdersCaptureRequest constructor will be called with 'undefined'.
    // This will likely result in an error during path construction or later validation by the SDK.
    // The route itself doesn't have try-catch around `new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID)`
    // so the error from the SDK constructor (if it throws for undefined orderID) will propagate.
    // For example, encodeURIComponent(undefined) becomes "undefined", leading to a malformed path.

    // We expect POST to throw because the PayPal SDK's OrdersCaptureRequest
    // will likely fail or create an invalid request object if orderID is undefined.
    await expect(POST(mockRequest)).rejects.toThrowError();
    expect(NextServerResponse.json).not.toHaveBeenCalled();
  });
});