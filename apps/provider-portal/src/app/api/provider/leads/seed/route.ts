import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

    // Find or create a test org
    let org = await prisma.org.findFirst({
      where: { name: { contains: 'Test' } },
    });

    if (!org) {
      org = await prisma.org.create({
        data: {
          id: 'org_test_leads_' + Date.now(),
          name: 'Test Organization for Leads',
          slug: 'test-org-leads',
          tier: 'PROFESSIONAL',
        },
      });
      console.log('✅ Created test org:', org.name);
    } else {
      console.log('✅ Using existing org:', org.name);
    }

    // Create sample leads with different statuses
    const leadsData = [
      {
        orgId: org.id,
        status: 'NEW',
        company: 'Acme Corp',
        contactName: 'John Doe',
        email: 'john@acme.com',
        phoneE164: '+15550101',
        sourceType: 'REFERRAL',
        disputeStatus: 'PENDING',
        disputeReason: 'Lead quality is poor - not in target market',
      },
      {
        orgId: org.id,
        status: 'CONTACTED',
        company: 'TechStart Inc',
        contactName: 'Jane Smith',
        email: 'jane@techstart.com',
        phoneE164: '+15550102',
        sourceType: 'WEBSITE',
        disputeStatus: 'NONE',
      },
      {
        orgId: org.id,
        status: 'QUALIFIED',
        company: 'Global Solutions',
        contactName: 'Bob Johnson',
        email: 'bob@globalsolutions.com',
        phoneE164: '+15550103',
        sourceType: 'COLD',
        qualityScore: 8,
        qualityNotes: 'High-quality lead, good fit for our services',
      },
      {
        orgId: org.id,
        status: 'CONVERTED',
        company: 'Enterprise LLC',
        contactName: 'Alice Williams',
        email: 'alice@enterprise.com',
        phoneE164: '+15550104',
        sourceType: 'REFERRAL',
        convertedAt: new Date(),
        qualityScore: 9,
        qualityNotes: 'Excellent lead, converted quickly',
      },
      {
        orgId: org.id,
        status: 'DISQUALIFIED',
        company: 'Small Biz',
        contactName: 'Charlie Brown',
        email: 'charlie@smallbiz.com',
        phoneE164: '+15550105',
        sourceType: 'COLD',
        classificationType: 'OUT_OF_SERVICE_AREA',
        classificationReason: 'Located outside our service area',
        classifiedAt: new Date(),
      },
      {
        orgId: org.id,
        status: 'NEW',
        company: 'Duplicate Test',
        contactName: 'David Lee',
        email: 'david@duplicate.com',
        phoneE164: '+15550106',
        sourceType: 'WEBSITE',
        disputeStatus: 'PENDING',
        disputeReason: 'This is a duplicate lead',
      },
      {
        orgId: org.id,
        status: 'CONTACTED',
        company: 'Quality Test Co',
        contactName: 'Emma Davis',
        email: 'emma@qualitytest.com',
        phoneE164: '+15550107',
        sourceType: 'REFERRAL',
        qualityScore: 7,
        qualityNotes: 'Good potential, needs follow-up',
      },
      {
        orgId: org.id,
        status: 'NEW',
        company: 'Spam Example',
        contactName: 'Fake Name',
        email: 'spam@example.com',
        phoneE164: '+15550108',
        sourceType: 'COLD',
        disputeStatus: 'PENDING',
        disputeReason: 'Suspected spam lead',
      },
    ];

    const createdLeads = [];
    for (const leadData of leadsData) {
      const lead = await prisma.lead.create({
        data: {
          ...leadData,
          identityHash: `hash_${leadData.email}`,
          publicId: `LEAD_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        },
      });
      createdLeads.push(lead);
      console.log(`✅ Created lead: ${lead.company} (${lead.status})`);
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

