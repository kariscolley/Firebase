
export type TransactionStatus = 'Complete' | 'Needs Info' | 'Pending Sync';

export type CodedFields = {
  accountingCode: string | null;
  memo: string | null;
  jobName: string | null;
  jobPhase: string | null;
  jobCategory: string | null;
};

export type Transaction = {
  id: string;
  vendor: string;
  amount: number;
  date: string; // Should be ISO 8601 format string
  status: TransactionStatus;
  receiptUrl: string | null;
  description: string;
  codedFields: CodedFields;
  syncedToRamp?: boolean;
};

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
