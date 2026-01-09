import CrudModule from '@/modules/CrudModule/CrudModule';
import CashTransactionForm from '@/forms/CashTransactionForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function CashTransaction() {
  const translate = useLanguage();
  const entity = 'cashtransaction';

  const searchConfig = {
    displayLabels: ['type', 'amount', 'partyType'],
    searchFields: 'reference,description',
  };

  const deleteModalLabels = ['type', 'amount'];

  const dataTableColumns = [
    {
      title: translate('Type'),
      dataIndex: 'type',
      render: (type) => (type === 'in' ? 'Cash In' : 'Cash Out'),
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
    },
    {
      title: translate('Party Type'),
      dataIndex: 'partyType',
      render: (partyType) => (partyType === 'client' ? 'Client' : 'Supplier'),
    },
    {
      title: translate('Party'),
      dataIndex: ['client', 'name'],
      render: (text, record) => {
        if (record.partyType === 'client' && record.client) {
          return record.client.name;
        } else if (record.partyType === 'supplier' && record.supplier) {
          return record.supplier.name;
        }
        return '-';
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('cash_management'),
    DATATABLE_TITLE: translate('cash_transaction_list'),
    ADD_NEW_ENTITY: translate('add_new_transaction'),
    ENTITY_NAME: translate('cash_transaction'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
    dataTableColumns,
  };

  return (
    <CrudModule
      createForm={<CashTransactionForm />}
      updateForm={<CashTransactionForm />}
      config={config}
    />
  );
}
