export type TransactionStatus = 'Complete' | 'Needs Info' | 'Pending Sync';

export type Transaction = {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  costCode: string | null;
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
    costCode: null,
    receiptUrl: null,
    description: 'AWS monthly hosting fees for production servers.',
  },
  {
    id: 'txn_2',
    vendor: 'Figma',
    amount: 360.0,
    date: '2024-07-21',
    status: 'Complete',
    costCode: '7210 - Software & Subscriptions',
    receiptUrl: '/receipts/figma.pdf',
    description: 'Annual subscription for design team.',
  },
  {
    id: 'txn_3',
    vendor: 'The Home Depot',
    amount: 85.42,
    date: '2024-07-20',
    status: 'Needs Info',
    costCode: null,
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Office maintenance supplies.',
  },
  {
    id: 'txn_4',
    vendor: 'Doordash',
    amount: 175.2,
    date: '2024-07-19',
    status: 'Pending Sync',
    costCode: '6450 - Meals & Entertainment',
    receiptUrl: 'https://placehold.co/100x150.png',
    description: 'Team lunch for quarterly meeting.',
  },
  {
    id: 'txn_5',
    vendor: 'Slack',
    amount: 150.0,
    date: '2024-07-18',
    status: 'Complete',
    costCode: '7210 - Software & Subscriptions',
    receiptUrl: '/receipts/slack.pdf',
    description: 'Monthly Slack subscription.',
  },
  {
    id: 'txn_6',
    vendor: 'United Airlines',
    amount: 734.55,
    date: '2024-07-17',
    status: 'Needs Info',
    costCode: null,
    receiptUrl: null,
    description: 'Flight for John Doe to client meeting in SFO.',
  },
  {
    id: 'txn_7',
    vendor: 'Github',
    amount: 210.0,
    date: '2024-07-15',
    status: 'Pending Sync',
    costCode: '7210 - Software & Subscriptions',
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
