import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { tagColor } from '@/utils/statusTagColor';

import { useMoney, useDate } from '@/settings';
import PurchaseDataTableModule from '@/modules/PurchaseModule/PurchaseDataTableModule';
import { getAmountColor } from '@/utils/amountColor';

export default function Purchase() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'purchase';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'supplier',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['number', 'supplier.name'];
  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'name'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('expired Date'),
      dataIndex: 'expiredDate',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({ amount: total, currency_code: record.currency });
      },
    },
    {
      title: translate('paid'),
      dataIndex: 'credit',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (credit, record) => {
        const balance = record.total - (credit || 0);
        return (
          <span>
            <span style={{ color: getAmountColor(credit || 0), fontWeight: '500' }}>
              {moneyFormatter({ amount: credit || 0, currency_code: record.currency })}
            </span>
            {balance > 0 && (
              <span style={{ fontSize: '11px', color: getAmountColor(-balance), marginLeft: '4px' }}>
                ({moneyFormatter({ amount: balance, currency_code: record.currency })} due)
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
    {
      title: translate('Payment'),
      dataIndex: 'paymentStatus',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('purchase'),
    DATATABLE_TITLE: translate('purchase_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase'),
    ENTITY_NAME: translate('purchase'),

    RECORD_ENTITY: translate('record_payment'),
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

  return <PurchaseDataTableModule config={config} />;
}
