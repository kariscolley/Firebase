
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
    jobPhase: null,
    jobCategory: null,
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

export const costCodes: CostCode[] = [
  { id: '7210', account: '7210', name: 'Software & Subscriptions', status: 'Active' },
  { id: '6450', account: '6450', name: 'Meals & Entertainment', status: 'Active' },
  { id: '6290', account: '6290', name: 'Office Supplies', status: 'Active' },
  { id: '7855', account: '7855', name: 'Travel & Transportation', status: 'Active' },
  { id: '6120', account: '6120', name: 'Advertising & Marketing', status: 'Active' },
  { id: '7100', account: '7100', name: 'Rent & Lease', status: 'Active' },
  { id: '8000', account: '8000', name: 'Professional Services', status: 'Active' },
];

export type AccountingField = {
  jobId: string;
  jobName: string;
  phaseId: string;
  phaseName: string;
  categoryId: string;
  categoryName: string;
};

export const accountingFields: AccountingField[] = [
  // Project Titan
  { jobId: 'titan', jobName: 'Project Titan', phaseId: 'infra', phaseName: 'Infrastructure', categoryId: 'cloud', categoryName: 'Cloud Services' },
  { jobId: 'titan', jobName: 'Project Titan', phaseId: 'dev', phaseName: 'Development', categoryId: 'software', categoryName: 'Software' },
  { jobId: 'titan', jobName: 'Project Titan', phaseId: 'dev', phaseName: 'Development', categoryId: 'ci-cd', categoryName: 'CI/CD' },
  
  // Company-wide
  { jobId: 'comp', jobName: 'Company-wide', phaseId: 'design', phaseName: 'Design', categoryId: 'software', categoryName: 'Software' },
  { jobId: 'comp', jobName: 'Company-wide', phaseId: 'comm', phaseName: 'Communications', categoryId: 'software', categoryName: 'Software' },

  // HQ Maintenance
  { jobId: 'hq', jobName: 'HQ Maintenance', phaseId: 'q3', phaseName: 'Q3', categoryId: 'facilities', categoryName: 'Facilities' },
  { jobId: 'hq', jobName: 'HQ Maintenance', phaseId: 'q4', phaseName: 'Q4', categoryId: 'facilities', categoryName: 'Facilities' },

  // Team Building
  { jobId: 'team', jobName: 'Team Building', phaseId: 'q3', phaseName: 'Q3', categoryId: 'morale', categoryName: 'Employee Morale' },

  // Client Visit
  { jobId: 'client-sfo', jobName: 'Client Visit SFO', phaseId: 'sales', phaseName: 'Sales', categoryId: 'travel', categoryName: 'Travel' },
  { jobId: 'client-sfo', jobName: 'Client Visit SFO', phaseId: 'sales', phaseName: 'Sales', categoryId: 'meals', categoryName: 'Client Meals' },
];


export type CostCode = {
  id: string;
  account: string;
  name: string;
  status: 'Active' | 'Inactive';
};
