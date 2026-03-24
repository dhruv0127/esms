import CrudModule from '@/modules/CrudModule/CrudModule';
import InventoryForm from '@/forms/InventoryForm';

import useLanguage from '@/locale/useLanguage';

export default function Inventory() {
  const translate = useLanguage();
  const entity = 'inventory';
  const searchConfig = {
    displayLabels: ['itemCode', 'product'],
    searchFields: 'itemCode,product',
  };
  const deleteModalLabels = ['product'];

  const readColumns = [
    {
      title: translate('Item Code'),
      dataIndex: 'itemCode',
    },
    {
      title: translate('Product'),
      dataIndex: 'product',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('Unit Price'),
      dataIndex: 'unitPrice',
    },
  ];

  const dataTableColumns = [
    {
      title: translate('Item Code'),
      dataIndex: 'itemCode',
    },
    {
      title: translate('Product'),
      dataIndex: 'product',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('Unit Price'),
      dataIndex: 'unitPrice',
      render: (_, record) => {
        return <>$ {record.unitPrice}</>;
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('inventory'),
    DATATABLE_TITLE: translate('inventory_list'),
    ADD_NEW_ENTITY: translate('add_new_inventory'),
    ENTITY_NAME: translate('inventory'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<InventoryForm />}
      updateForm={<InventoryForm />}
      config={config}
    />
  );
}
