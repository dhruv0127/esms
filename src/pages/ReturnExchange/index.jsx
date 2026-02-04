import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import ReturnExchangeDataTableModule from '@/modules/ReturnExchangeModule/ReturnExchangeDataTableModule';

export default function ReturnExchange() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'returnexchange';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['number', 'customer.name', 'type'];

  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      render: (type) => {
        const color = type === 'return' ? 'orange' : 'blue';
        return <Tag color={color}>{translate(type)}</Tag>;
      },
    },
    {
      title: translate('Customer'),
      dataIndex: ['customer', 'name'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Returned Item'),
      dataIndex: ['returnedItem', 'itemName'],
    },
    {
      title: translate('Quantity'),
      dataIndex: ['returnedItem', 'quantity'],
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'completed') color = 'green';
        else if (status === 'approved') color = 'blue';
        else if (status === 'rejected') color = 'red';
        else if (status === 'pending') color = 'orange';
        return <Tag color={color}>{translate(status)}</Tag>;
      },
    },
    {
      title: translate('Price Difference'),
      dataIndex: 'priceDifference',
      render: (amount, record) => {
        if (record.type === 'return') return '-';
        const color = amount > 0 ? '#52c41a' : amount < 0 ? '#ff4d4f' : '#666';
        return (
          <span style={{ color }}>
            {moneyFormatter({ amount: Math.abs(amount || 0), currency_code: record.currency })}
          </span>
        );
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('return_exchange'),
    DATATABLE_TITLE: translate('return_exchange_list'),
    ADD_NEW_ENTITY: translate('add_new_return_exchange'),
    ENTITY_NAME: translate('return_exchange'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <ReturnExchangeDataTableModule config={config} />;
}
