export const fields = {
  type: {
    type: 'select',
    options: [
      { value: 'in', label: 'Cash In (Received)' },
      { value: 'out', label: 'Cash Out (Paid)' },
    ],
    required: true,
  },
  amount: {
    type: 'currency',
    required: true,
  },
  date: {
    type: 'date',
    required: true,
  },
  partyType: {
    type: 'select',
    options: [
      { value: 'client', label: 'Client' },
      { value: 'supplier', label: 'Supplier' },
    ],
    required: true,
  },
  client: {
    type: 'async',
    entity: 'client',
    displayLabels: ['name'],
    searchFields: ['name'],
    dataIndex: ['client', 'name'],
    redirectLabel: 'Add New Client',
    required: false,
  },
  supplier: {
    type: 'async',
    entity: 'supplier',
    displayLabels: ['name'],
    searchFields: ['name'],
    dataIndex: ['supplier', 'name'],
    redirectLabel: 'Add New Supplier',
    required: false,
  },
  reference: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'textarea',
    required: false,
  },
};
