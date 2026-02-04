import CashTransactionCrudModule from './CashTransactionCrudModule';
import CashTransactionForm from '@/forms/CashTransactionForm';
import { fields } from './config';
import dayjs from 'dayjs';

import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { getAmountColor } from '@/utils/amountColor';

export default function CashTransaction() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
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
      render: (amount, record) => {
        const isPositive = record.type === 'in';
        const displayAmount = isPositive ? amount : -amount;
        return (
          <span style={{ color: getAmountColor(displayAmount), fontWeight: '500' }}>
            {isPositive ? '+' : '-'}{moneyFormatter({ amount })}
          </span>
        );
      },
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
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

  const readColumns = [
    { title: translate('Type'), dataIndex: 'type' },
    { title: translate('Amount'), dataIndex: 'amount' },
    { title: translate('Date'), dataIndex: 'date', isDate: true },
    { title: translate('Party Type'), dataIndex: 'partyType' },
    { title: translate('Reference'), dataIndex: 'reference' },
    { title: translate('Description'), dataIndex: 'description' },
    { title: translate('Currency'), dataIndex: 'currency' },
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
    searchConfig,
    deleteModalLabels,
    dataTableColumns,
    readColumns,
  };

  return (
    <CashTransactionCrudModule
      createForm={<CashTransactionForm />}
      updateForm={<CashTransactionForm />}
      config={config}
    />
  );
}
