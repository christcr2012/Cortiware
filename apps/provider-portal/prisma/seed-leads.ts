/**
 * Seed script for Leads Management testing
 * Run with: npx tsx prisma/seed-leads.ts
 */

import { PrismaClient, LeadSource, LeadStatus, DisputeStatus, ClassificationType } from '@prisma/client-provider';

const prisma = new PrismaClient();

async function main() {
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
        // slug field removed - not in provider-portal schema
      },
    });
    console.log('✅ Created test org:', org.name);
  } else {
    console.log('✅ Using existing org:', org.name);
  }

  // Create sample leads with different statuses
  const leads = [
    {
      orgId: org.id,
      status: LeadStatus.NEW,
      company: 'Acme Corp',
      contactName: 'John Doe',
      email: 'john@acme.com',
      phone: '555-0101',
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
      phone: '555-0102',
      sourceType: LeadSource.MANUAL_NEW_CUSTOMER,
      disputeStatus: DisputeStatus.NONE,
    },
    {
      orgId: org.id,
      status: LeadStatus.NEW,
      company: 'Global Solutions',
      contactName: 'Bob Johnson',
      email: 'bob@globalsolutions.com',
      phone: '555-0103',
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
      phone: '555-0104',
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
      phone: '555-0105',
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
      phone: '555-0106',
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
      phone: '555-0107',
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
      phone: '555-0108',
      sourceType: LeadSource.COLD,
      disputeStatus: DisputeStatus.PENDING,
      disputeReason: 'Suspected spam lead',
    },
  ];

  for (let i = 0; i < leads.length; i++) {
    const leadData = leads[i];
    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        identityHash: `hash_${leadData.email}`,
        publicId: `lead_${Date.now()}_${i}`,  // Add required publicId field
      },
    });
    console.log(`✅ Created lead: ${lead.company} (${lead.status})`);
  }

  console.log('\n🎉 Seed complete! Created', leads.length, 'test leads');
  console.log('\nTest scenarios available:');
  console.log('- 3 leads with PENDING disputes (can approve/reject)');
  console.log('- 1 lead classified as OUT_OF_SERVICE_AREA');
  console.log('- 3 leads with quality scores');
  console.log('- Mix of statuses: NEW, CONTACTED, QUALIFIED, CONVERTED, DISQUALIFIED');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

