import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

function environment() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV } = process.env;
  if (PAYPAL_ENV === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(
      PAYPAL_CLIENT_ID!,
      PAYPAL_CLIENT_SECRET!,
    );
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(
    PAYPAL_CLIENT_ID!,
    PAYPAL_CLIENT_SECRET!
  );
}
  
export function paypalClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

export async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const endpoint =
    process.env.PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get PayPal token: ${data.error_description}`);
  }

  return data.access_token;
}