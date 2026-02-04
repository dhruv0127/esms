import { useCallback, useEffect, useState } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input, Select, Space, DatePicker, Pagination } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import useResponsive from '@/hooks/useResponsive';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';
import MobileCardView from '@/components/DataTable/MobileCardView';

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}

export default function CashTransactionDataTable({ config, extra = [] }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox } = crudContextAction;
  const translate = useLanguage();
  const { isMobile } = useResponsive();

  const [typeFilter, setTypeFilter] = useState(null);
  const [partyTypeFilter, setPartyTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const { RangePicker } = DatePicker;

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },
    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };

  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }

  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  // Store original columns without action column for mobile view
  const originalColumns = [...dataTableColumns];

  const columnsWithActions = [
    ...dataTableColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;
                case 'delete':
                  handleDelete(record);
                  break;
                default:
                  break;
              }
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback(
    (pagination, filters, sorter) => {
      const options = {
        page: pagination.current || 1,
        items: pagination.pageSize || 10
      };

      // Add filters to options
      if (typeFilter) {
        options.type = typeFilter;
      }
      if (partyTypeFilter) {
        options.partyType = partyTypeFilter;
      }
      if (dateRange && dateRange.length === 2) {
        options.dateFrom = dateRange[0].format('YYYY-MM-DD');
        options.dateTo = dateRange[1].format('YYYY-MM-DD');
      }

      // Add sorting to options
      if (sorter && sorter.field) {
        options.sortBy = sorter.field;
        options.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      } else if (sortField && sortOrder) {
        options.sortBy = sortField;
        options.sortOrder = sortOrder;
      }

      dispatch(crud.list({ entity, options }));
    },
    [typeFilter, partyTypeFilter, dateRange, sortField, sortOrder, entity]
  );

  const filterTable = (e) => {
    const value = e.target.value;
    const options = { q: value, fields: searchConfig?.searchFields || '' };

    // Preserve existing filters
    if (typeFilter) options.type = typeFilter;
    if (partyTypeFilter) options.partyType = partyTypeFilter;
    if (dateRange && dateRange.length === 2) {
      options.dateFrom = dateRange[0].format('YYYY-MM-DD');
      options.dateTo = dateRange[1].format('YYYY-MM-DD');
    }
    if (sortField && sortOrder) {
      options.sortBy = sortField;
      options.sortOrder = sortOrder;
    }

    dispatch(crud.list({ entity, options }));
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  const handlePartyTypeFilterChange = (value) => {
    setPartyTypeFilter(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleSortChange = (value) => {
    if (value) {
      const [field, order] = value.split('-');
      setSortField(field);
      setSortOrder(order);
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  const clearFilters = () => {
    setTypeFilter(null);
    setPartyTypeFilter(null);
    setDateRange(null);
    setSortField(null);
    setSortOrder(null);
    dispatch(crud.list({ entity }));
  };

  const applyFilters = () => {
    handelDataTableLoad(pagination || { current: 1, pageSize: 10 });
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={isMobile ? undefined : [
          <Input
            key={`searchFilterDataTable}`}
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
            style={{ width: 200 }}
          />,
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,
          <AddNewItem key={`${uniqueId()}`} config={config} />,
        ]}
        style={{
          padding: isMobile ? '12px 0px' : '20px 0px',
        }}
      >
        {!isMobile && (
          <Space wrap style={{ marginTop: 16 }}>
            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: 180 }}
              value={typeFilter}
              onChange={handleTypeFilterChange}
              options={[
                { label: 'Cash In', value: 'in' },
                { label: 'Cash Out', value: 'out' },
              ]}
            />
            <Select
              placeholder="Filter by Party Type"
              allowClear
              style={{ width: 180 }}
              value={partyTypeFilter}
              onChange={handlePartyTypeFilterChange}
              options={[
                { label: 'Client', value: 'client' },
                { label: 'Supplier', value: 'supplier' },
              ]}
            />
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              style={{ width: 280 }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Select
              placeholder="Sort by"
              allowClear
              style={{ width: 200 }}
              value={sortField && sortOrder ? `${sortField}-${sortOrder}` : null}
              onChange={handleSortChange}
              options={[
                { label: 'Date (Newest First)', value: 'date-desc' },
                { label: 'Date (Oldest First)', value: 'date-asc' },
                { label: 'Amount (High to Low)', value: 'amount-desc' },
                { label: 'Amount (Low to High)', value: 'amount-asc' },
                { label: 'Type (A-Z)', value: 'type-asc' },
                { label: 'Type (Z-A)', value: 'type-desc' },
              ]}
            />
            <Button type="primary" icon={<FilterOutlined />} onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Space>
        )}
      </PageHeader>

      {isMobile && (
        <div style={{ padding: '8px 0', marginBottom: 12 }}>
          <Input
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
            size="small"
            style={{ marginBottom: 8 }}
          />

          <Space direction="vertical" style={{ width: '100%', marginBottom: 8 }}>
            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: '100%' }}
              size="small"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              options={[
                { label: 'Cash In', value: 'in' },
                { label: 'Cash Out', value: 'out' },
              ]}
            />
            <Select
              placeholder="Filter by Party Type"
              allowClear
              style={{ width: '100%' }}
              size="small"
              value={partyTypeFilter}
              onChange={handlePartyTypeFilterChange}
              options={[
                { label: 'Client', value: 'client' },
                { label: 'Supplier', value: 'supplier' },
              ]}
            />
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              style={{ width: '100%' }}
              size="small"
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Select
              placeholder="Sort by"
              allowClear
              style={{ width: '100%' }}
              size="small"
              value={sortField && sortOrder ? `${sortField}-${sortOrder}` : null}
              onChange={handleSortChange}
              options={[
                { label: 'Date (Newest First)', value: 'date-desc' },
                { label: 'Date (Oldest First)', value: 'date-asc' },
                { label: 'Amount (High to Low)', value: 'amount-desc' },
                { label: 'Amount (Low to High)', value: 'amount-asc' },
                { label: 'Type (A-Z)', value: 'type-asc' },
                { label: 'Type (Z-A)', value: 'type-desc' },
              ]}
            />
          </Space>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={applyFilters}
              size="small"
              style={{ flex: 1 }}
            >
              Apply
            </Button>
            <Button onClick={clearFilters} size="small" style={{ flex: 1 }}>
              Clear
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              onClick={handelDataTableLoad}
              icon={<RedoOutlined />}
              size="small"
              style={{ flex: 1 }}
            >
              {translate('Refresh')}
            </Button>
            <AddNewItem config={config} />
          </div>
        </div>
      )}

      {isMobile ? (
        <>
          <MobileCardView
            dataSource={dataSource}
            columns={originalColumns}
            onRead={handleRead}
            onEdit={handleEdit}
            onDelete={handleDelete}
            extraActions={extra}
            loading={listIsLoading}
          />
          <Pagination
            {...pagination}
            onChange={(page, pageSize) => handelDataTableLoad({ current: page, pageSize })}
            style={{ marginTop: 16, textAlign: 'center' }}
            size="small"
            showSizeChanger={false}
          />
        </>
      ) : (
        <Table
          columns={columnsWithActions}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
          scroll={{ x: true }}
        />
      )}
    </>
  );
}
