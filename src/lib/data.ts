export type TransactionStatus = 'Complete' | 'Needs Info' | 'Pending Sync';

export type Transaction = {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  accountingCode: string | null;
  memo: string | null;
  jobName: string | null;
  jobPhase: string | null;
  jobCategory: string | null;
  receiptUrl: string | null;
  description: string;
};

export const transactions: Transaction[] = [
  {
    id: 'txn_1',
    vendor: 'Amazon Web Services',
    amount: 1250.75,
    date: '2024-07-22',
    status: 'Needs Info',
    accountingCode: null,
    memo: 'Monthly cloud hosting',
    jobName: 'Project Titan',
    jobPhase: 'Infrastructure',
    jobCategory: 'Cloud Services',
    receiptUrl: null,
    description: 'AWS monthly hosting fees for production servers.',
  },
  {
    id: 'txn_2',
    vendor: 'Figma',
    amount: 360.0,
    date: '2024-07-21',
    status: 'Complete',
    accountingCode: '7210 - Software & Subscriptions',
    memo: 'Annual license',
    jobName: 'Company-wide',
    jobPhase: 'Design',
    jobCategory: 'Software',
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Annual subscription for design team.',
  },
  {
    id: 'txn_3',
    vendor: 'The Home Depot',
    amount: 85.42,
    date: '2024-07-20',
    status: 'Needs Info',
    accountingCode: null,
    memo: 'Office supplies',
    jobName: 'HQ Maintenance',
    jobPhase: 'Q3',
    jobCategory: 'Facilities',
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Office maintenance supplies.',
  },
  {
    id: 'txn_4',
    vendor: 'Doordash',
    amount: 175.2,
    date: '2024-07-19',
    status: 'Pending Sync',
    accountingCode: '6450 - Meals & Entertainment',
    memo: 'Quarterly team lunch',
    jobName: 'Team Building',
    jobPhase: 'Q3',
    jobCategory: 'Employee Morale',
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Team lunch for quarterly meeting.',
  },
  {
    id: 'txn_5',
    vendor: 'Slack',
    amount: 150.0,
    date: '2024-07-18',
    status: 'Complete',
    accountingCode: '7210 - Software & Subscriptions',
    memo: null,
    jobName: 'Company-wide',
    jobPhase: 'Communications',
    jobCategory: 'Software',
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Monthly Slack subscription.',
  },
  {
    id: 'txn_6',
    vendor: 'United Airlines',
    amount: 734.55,
    date: '2024-07-17',
    status: 'Needs Info',
    accountingCode: null,
    memo: 'Flight for J. Doe',
    jobName: 'Client Visit SFO',
    jobPhase: 'Sales',
    jobCategory: 'Travel',
    receiptUrl: null,
    description: 'Flight for John Doe to client meeting in SFO.',
  },
  {
    id: 'txn_7',
    vendor: 'Github',
    amount: 210.0,
    date: '2024-07-15',
    status: 'Pending Sync',
    accountingCode: '7210 - Software & Subscriptions',
    memo: 'CI/CD services',
    jobName: 'Project Titan',
    jobPhase: 'Development',
    jobCategory: 'Software',
    receiptUrl: null,
    description: 'Github monthly bill for engineering team.',
  },
];

export const costCodes = [
  '7210 - Software & Subscriptions',
  '6450 - Meals & Entertainment',
  '6290 - Office Supplies',
  '7855 - Travel & Transportation',
  '6120 - Advertising & Marketing',
  '7100 - Rent & Lease',
  '8000 - Professional Services',
];

export const jobNames = [
    'Project Titan',
    'Company-wide',
    'HQ Maintenance',
    'Team Building',
    'Client Visit SFO',
];

export const jobPhases = [
    'Infrastructure',
    'Design',
    'Q3',
    'Communications',
    'Sales',
    'Development',
];

export const jobCategories = [
    'Cloud Services',
    'Software',
    'Facilities',
    'Employee Morale',
    'Travel',
];
