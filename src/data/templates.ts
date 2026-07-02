import { ServiceTemplate } from '../types';

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'volunteer-onboarding',
    title: 'Volunteer Onboarding & Engagement',
    category: 'Volunteers',
    description:
      'Onboard volunteers with orientation, role assignments, and shift scheduling.',
    popularity: 94,
    tablesCount: 4,
    tags: ['Volunteers', 'Onboarding', 'Shifts', 'Engagement'],
  },
  {
    id: 'donor-stewardship',
    title: 'Donor Inquiry & Stewardship',
    category: 'Fundraising',
    description:
      'Track donor questions, pledges, and follow-ups in one place.',
    popularity: 98,
    tablesCount: 3,
    tags: ['Donors', 'Fundraising', 'Stewardship', 'Pledges'],
  },
  {
    id: 'beneficiary-intake',
    title: 'Beneficiary Intake & Case Support',
    category: 'Programs',
    description:
      'Intake beneficiaries, assign case workers, and coordinate program services.',
    popularity: 87,
    tablesCount: 3,
    tags: ['Programs', 'Case Management', 'Intake', 'Referrals'],
  },
  {
    id: 'grant-compliance',
    title: 'Grant Tracking & Compliance',
    category: 'Grants',
    description:
      'Monitor grant milestones, reporting deadlines, and funder requirements.',
    popularity: 76,
    tablesCount: 2,
    tags: ['Grants', 'Compliance', 'Reporting', 'Funders'],
  },
  {
    id: 'resource-inventory',
    title: 'Equipment & Supply Inventory',
    category: 'Operations',
    description:
      'Track donated goods, supplies, and equipment across your sites.',
    popularity: 81,
    tablesCount: 4,
    tags: ['Inventory', 'Supplies', 'Donations in-kind', 'Logistics'],
  },
  {
    id: 'event-booking',
    title: 'Community Event & Space Booking',
    category: 'Programs',
    description:
      'Reserve meeting rooms, event halls, and community outreach sites.',
    popularity: 69,
    tablesCount: 2,
    tags: ['Events', 'Facilities', 'Community', 'Scheduling'],
  },
];
