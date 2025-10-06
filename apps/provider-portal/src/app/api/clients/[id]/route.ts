import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

/**
 * GET /api/provider/clients/[id]
 * Get detailed information about a specific client
 */
const getHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const org = await prisma.org.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            lastSuccessfulLogin: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            plan: true,
            priceCents: true,
            startedAt: true,
            canceledAt: true,
            renewsAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        activities: {
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      }
    });

    if (!org) {
      return jsonError(404, 'not_found', 'Client not found');
    }

    // Get owner user
    const owner = org.users.find(u => u.role === 'OWNER') || org.users[0];

    // Calculate usage metrics
    const activeUsers30d = org.users.filter(u => {
      if (!u.lastSuccessfulLogin) return false;
      const daysSinceLogin = (Date.now() - u.lastSuccessfulLogin.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 30;
    }).length;

    const apiCalls30d = org.activities.filter(a => a.action === 'api_call').length;

    // Get subscription details
    const subscription = org.subscriptions[0];

    // Get billing history (mock for now - would need Invoice model)
    const totalRevenue = 0; // Would calculate from invoices

    // Format response
    const response = {
      id: org.id,
      name: org.name,
      createdAt: org.createdAt.toISOString(),
      status: org.subscriptionStatus || 'active',
      owner: owner ? {
        email: owner.email,
        name: owner.name || owner.email.split('@')[0]
      } : null,
      users: org.users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || u.email.split('@')[0],
        role: u.role,
        lastActive: u.lastSuccessfulLogin?.toISOString() || null
      })),
      subscription: subscription ? {
        plan: subscription.plan,
        price: `$${(subscription.priceCents / 100).toFixed(2)}/month`,
        status: subscription.status,
        nextBillingDate: subscription.renewsAt?.toISOString() || null,
        startedAt: subscription.startedAt.toISOString()
      } : null,
      usage: {
        activeUsers30d,
        apiCalls30d,
        storageUsedMB: 0, // Would need to calculate from actual storage
        aiCreditsUsed: org.aiCreditBalance || 0
      },
      billing: {
        totalRevenue,
        invoices: [] // Would need Invoice model
      }
    };

    return jsonOk(response);
  } catch (error) {
    console.error('Error getting client details:', error);
    return jsonError(500, 'internal_error', 'Failed to get client details');
  }
};

/**
 * PATCH /api/provider/clients/[id]
 * Update client organization
 */
const patchHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, status } = body;

    // Validate input
    if (!name && !status) {
      return jsonError(400, 'invalid_request', 'At least one field (name or status) is required');
    }

    // Update organization
    const updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.subscriptionStatus = status;

    const org = await prisma.org.update({
      where: { id },
      data: updateData
    });

    return jsonOk({
      id: org.id,
      name: org.name,
      status: org.subscriptionStatus
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return jsonError(500, 'internal_error', 'Failed to update client');
  }
};

/**
 * DELETE /api/provider/clients/[id]
 * Delete client organization (soft delete by setting status to 'deleted')
 */
const deleteHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    // Soft delete by updating status
    const org = await prisma.org.update({
      where: { id },
      data: { subscriptionStatus: 'deleted' }
    });

    return jsonOk({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return jsonError(500, 'internal_error', 'Failed to delete client');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const PATCH = compose(withProviderAuth())(patchHandler);
export const DELETE = compose(withProviderAuth())(deleteHandler);

