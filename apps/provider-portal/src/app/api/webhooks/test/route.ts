import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/test
 * Test a webhook by sending a test payload
 */
export async function POST(req: NextRequest) {
  try {
    const { url, payload } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Send test webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Test': 'true',
      },
      body: JSON.stringify(payload || {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook' },
      }),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}

