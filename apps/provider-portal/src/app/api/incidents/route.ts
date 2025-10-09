import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          org: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return jsonOk({
      incidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing incidents:', error);
    return jsonError(500, 'internal_error', 'Failed to list incidents');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orgId, severity, title, description, assigneeUserId, slaResponseHours, slaResolveHours } = body;

    if (!orgId || !severity || !title || !description) {
      return jsonError(400, 'invalid_request', 'orgId, severity, title, and description are required');
    }

    const now = new Date();
    const incident = await prisma.incident.create({
      data: {
        orgId,
        severity,
        title,
        description,
        assigneeUserId,
        slaResponseDeadline: slaResponseHours ? new Date(now.getTime() + slaResponseHours * 60 * 60 * 1000) : null,
        slaResolveDeadline: slaResolveHours ? new Date(now.getTime() + slaResolveHours * 60 * 60 * 1000) : null,
      },
      include: {
        org: {
          select: { id: true, name: true },
        },
      },
    });

    return jsonOk({ incident });
  } catch (error) {
    console.error('Error creating incident:', error);
    return jsonError(500, 'internal_error', 'Failed to create incident');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const POST = compose(withProviderAuth())(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'incident',
    actorType: 'provider',
  })
);

