import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { LeadSource, LeadStatus, DisputeStatus, ClassificationType } from '@prisma/client-provider';

/**
 * POST /api/provider/leads/seed
 * Seed test data for Leads Management
 * 
 * TEMPORARY ENDPOINT - For testing only
 * Creates sample leads with various dispute/classification/quality scenarios
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const jar = await cookies();
    const session = jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Seeding Leads Management test data...');

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Find or create a test org
    let org = await prisma.org.findFirst({
      where: {
        name: { contains: 'Test' }
      },
    });

    if (!org) {
      // Get any existing org to use for testing
      org = await prisma.org.findFirst();

      if (!org) {
        // Create a new test org only if no orgs exist
        org = await prisma.org.create({
          data: {
            name: 'Test Organization for Leads',
          },
        });
        console.log('✅ Created test org:', org.name);
      } else {
        console.log('✅ Using existing org:', org.name);
      }
    } else {
      console.log('✅ Using existing test org:', org.name);
    }

    // Create sample leads with different statuses
    const leadsData = [
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Acme Corp',
        contactName: 'John Doe',
        email: 'john@acme.com',
        phoneE164: '+15550101',
        sourceType: LeadSource.MANUAL_EMPLOYEE_REFERRAL,
        disputeStatus: DisputeStatus.PENDING,
        disputeReason: 'Lead quality is poor - not in target market',
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'TechStart Inc',
        contactName: 'Jane Smith',
        email: 'jane@techstart.com',
        phoneE164: '+15550102',
        sourceType: LeadSource.MANUAL_NEW_CUSTOMER,
        disputeStatus: DisputeStatus.NONE,
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Global Solutions',
        contactName: 'Bob Johnson',
        email: 'bob@globalsolutions.com',
        phoneE164: '+15550103',
        sourceType: LeadSource.COLD,
        qualityScore: 8,
        qualityNotes: 'High-quality lead, good fit for our services',
      },
      {
        orgId: org.id,
        status: LeadStatus.CONVERTED,
        company: 'Enterprise LLC',
        contactName: 'Alice Williams',
        email: 'alice@enterprise.com',
        phoneE164: '+15550104',
        sourceType: LeadSource.MANUAL_EMPLOYEE_REFERRAL,
        convertedAt: new Date(),
        qualityScore: 9,
        qualityNotes: 'Excellent lead, converted quickly',
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Small Biz',
        contactName: 'Charlie Brown',
        email: 'charlie@smallbiz.com',
        phoneE164: '+15550105',
        sourceType: LeadSource.COLD,
        classificationType: ClassificationType.OUT_OF_SERVICE_AREA,
        classificationReason: 'Located outside our service area',
        classifiedAt: new Date(),
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Duplicate Test',
        contactName: 'David Lee',
        email: 'david@duplicate.com',
        phoneE164: '+15550106',
        sourceType: LeadSource.MANUAL_NEW_CUSTOMER,
        disputeStatus: DisputeStatus.PENDING,
        disputeReason: 'This is a duplicate lead',
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Quality Test Co',
        contactName: 'Emma Davis',
        email: 'emma@qualitytest.com',
        phoneE164: '+15550107',
        sourceType: LeadSource.MANUAL_EMPLOYEE_REFERRAL,
        qualityScore: 7,
        qualityNotes: 'Good potential, needs follow-up',
      },
      {
        orgId: org.id,
        status: LeadStatus.NEW,
        company: 'Spam Example',
        contactName: 'Fake Name',
        email: 'spam@example.com',
        phoneE164: '+15550108',
        sourceType: LeadSource.COLD,
        disputeStatus: DisputeStatus.PENDING,
        disputeReason: 'Suspected spam lead',
      },
    ];

    const createdLeads = [];
    for (const leadData of leadsData) {
      try {
        const lead = await prisma.lead.create({
          data: {
            ...leadData,
            identityHash: `hash_${leadData.email}`,
            publicId: `LEAD_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          },
        });
        createdLeads.push(lead);
        console.log(`✅ Created lead: ${lead.company} (${lead.status})`);
      } catch (leadError) {
        console.error(`❌ Failed to create lead ${leadData.company}:`, leadError);
        // Continue with other leads even if one fails
      }
    }

    console.log('\n🎉 Seed complete! Created', createdLeads.length, 'test leads');

    return NextResponse.json({
      success: true,
      message: 'Seed complete!',
      created: createdLeads.length,
      orgId: org.id,
      orgName: org.name,
      leads: createdLeads.map(l => ({
        id: l.id,
        company: l.company,
        status: l.status,
        disputeStatus: l.disputeStatus,
        classificationType: l.classificationType,
        qualityScore: l.qualityScore,
      })),
      scenarios: {
        pendingDisputes: 3,
        classified: 1,
        qualityScored: 3,
        statuses: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED'],
      },
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

