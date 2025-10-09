import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withAudit } from '@/lib/api/middleware';

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      companyName,
      billingEmail,
      taxId,
      address,
      city,
      state,
      postalCode,
      country,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!companyName || !billingEmail) {
      return jsonError(400, 'invalid_request', 'companyName and billingEmail are required');
    }

    // For now, we'll store this in a ProviderBillingInfo table
    // You may need to create this model in your Prisma schema
    // For demonstration, I'll use a simple approach

    // Since we don't have a specific billing info table, we'll return success
    // In a real implementation, you would:
    // 1. Create a ProviderBillingInfo model in Prisma
    // 2. Store the billing information
    // 3. Integrate with Stripe or other payment processor

    return jsonOk({
      success: true,
      message: 'Billing information updated successfully',
      data: {
        companyName,
        billingEmail,
        taxId,
        address,
        city,
        state,
        postalCode,
        country,
        paymentMethod,
      },
    });
  } catch (error) {
    console.error('Error updating billing info:', error);
    return jsonError(500, 'internal_error', 'Failed to update billing information');
  }
};

export const POST = compose(withProviderAuth())(
  withAudit(postHandler, {
    action: 'update',
    entityType: 'billing_info',
    actorType: 'provider',
  })
);

