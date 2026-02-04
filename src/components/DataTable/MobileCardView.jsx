import { Card, Button, Row, Col, Dropdown, Space, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';

export default function MobileCardView({
  dataSource,
  columns,
  onRead,
  onEdit,
  onDelete,
  extraActions = [],
  loading = false,
}) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

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
    ...extraActions,
    {
      type: 'divider',
    },
    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleMenuClick = (key, record) => {
    switch (key) {
      case 'read':
        onRead && onRead(record);
        break;
      case 'edit':
        onEdit && onEdit(record);
        break;
      case 'delete':
        onDelete && onDelete(record);
        break;
      default:
        break;
    }
  };

  const renderValue = (column, record) => {
    const value = column.dataIndex
      ? Array.isArray(column.dataIndex)
        ? column.dataIndex.reduce((obj, key) => obj?.[key], record)
        : record[column.dataIndex]
      : null;

    // If column has custom render function, use it
    if (column.render) {
      return column.render(value, record);
    }

    // Handle date formatting
    if (column.isDate && value) {
      return dayjs(value).format(dateFormat);
    }

    // Handle money formatting
    if (column.isMoney && value !== undefined) {
      return moneyFormatter({ amount: value, currency_code: record.currency });
    }

    return value || '-';
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!dataSource || dataSource.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {dataSource.map((record, index) => (
        <Card
          key={record._id || index}
          style={{
            marginBottom: 12,
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
          bodyStyle={{ padding: 12 }}
        >
          <Row gutter={[8, 8]}>
            {/* Display all columns except action */}
            {columns
              .filter(col => col.key !== 'action' && col.title)
              .map((column, colIndex) => (
                <Col span={24} key={colIndex}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      fontWeight: 500,
                      color: '#666',
                      fontSize: 11,
                      marginRight: 8,
                      minWidth: '80px',
                    }}>
                      {column.title}:
                    </span>
                    <span style={{
                      flex: 1,
                      textAlign: 'right',
                      fontSize: 12,
                      color: '#000',
                      wordBreak: 'break-word',
                    }}>
                      {renderValue(column, record)}
                    </span>
                  </div>
                </Col>
              ))}

            {/* Actions */}
            <Col span={24} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onRead && onRead(record)}
                >
                  {translate('View')}
                </Button>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit && onEdit(record)}
                >
                  {translate('Edit')}
                </Button>
                <Dropdown
                  menu={{
                    items,
                    onClick: ({ key }) => handleMenuClick(key, record),
                  }}
                  trigger={['click']}
                >
                  <Button size="small" icon={<EllipsisOutlined />} />
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
}
