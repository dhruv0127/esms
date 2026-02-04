import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Table, Tabs, Tag, Button, Spin, Modal, Form, Input, InputNumber, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import dayjs from 'dayjs';
import SelectInventoryItem from '@/components/SelectInventoryItem';

const { TabPane } = Tabs;

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const money = useMoney();

  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [returnExchanges, setReturnExchanges] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client details
      const clientResponse = await request.read({ entity: 'client', id });
      if (clientResponse.success) {
        setClient(clientResponse.result);
      }

      // Fetch client invoices
      const invoiceResponse = await request.list({
        entity: 'invoice',
        options: { page: 1, items: 100 },
      });
      if (invoiceResponse.success) {
        const clientInvoices = invoiceResponse.result.filter(
          (inv) => inv.client && inv.client._id === id
        );
        setInvoices(clientInvoices);
      }

      // Fetch client cash transactions
      const cashResponse = await request.list({
        entity: 'cashtransaction',
        options: { page: 1, items: 100 },
      });
      if (cashResponse.success) {
        const clientTransactions = cashResponse.result.filter(
          (txn) => txn.client && txn.client._id === id
        );
        setCashTransactions(clientTransactions);
      }

      // Fetch client return/exchanges
      const returnExchangeResponse = await request.list({
        entity: 'returnexchange',
        options: { page: 1, items: 100 },
      });
      if (returnExchangeResponse.success) {
        const clientReturnExchanges = returnExchangeResponse.result.filter(
          (re) => re.customer && re.customer._id === id
        );
        setReturnExchanges(clientReturnExchanges);
      }

      // Fetch client balance from backend
      const balanceResponse = await request.get({
        entity: `client/balance/${id}`,
      });
      if (balanceResponse.success) {
        setBalance(balanceResponse.result);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const invoiceColumns = [
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
      render: (type, record) => {
        if (type === 'return' || type === 'exchange') {
          const color = type === 'return' ? 'purple' : 'cyan';
          return <Tag color={color}>{translate(type).toUpperCase()}</Tag>;
        }
        return <Tag color="blue">INVOICE</Tag>;
      },
      filters: [
        { text: 'Invoice', value: 'invoice' },
        { text: 'Return', value: 'return' },
        { text: 'Exchange', value: 'exchange' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: translate('Number'),
      dataIndex: 'number',
      key: 'number',
      render: (number, record) => {
        const entity = record.type === 'return' || record.type === 'exchange' ? 'returnexchange' : 'invoice';
        return (
          <Button
            type="link"
            onClick={() => navigate(`/${entity}/read/${record._id}`)}
          >
            #{number}{record.year ? `/${record.year}` : ''}
          </Button>
        );
      },
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      key: 'total',
      render: (total, record) => {
        if (record.type === 'return' || record.type === 'exchange') {
          return `${money.currency_symbol}${(record.returnedItem?.total || 0).toFixed(2)}`;
        }
        return `${money.currency_symbol}${total.toFixed(2)}`;
      },
    },
    {
      title: translate('Paid'),
      dataIndex: 'credit',
      key: 'credit',
      render: (credit, record) => {
        if (record.type === 'return' || record.type === 'exchange') {
          return '-';
        }
        return `${money.currency_symbol}${(credit || 0).toFixed(2)}`;
      },
    },
    {
      title: translate('Balance'),
      key: 'balance',
      render: (_, record) => {
        if (record.type === 'return') {
          const amount = record.returnedItem?.total || 0;
          return (
            <span style={{ color: 'green' }}>
              -{money.currency_symbol}
              {amount.toFixed(2)}
            </span>
          );
        }
        if (record.type === 'exchange' && record.priceDifference) {
          const color = record.priceDifference > 0 ? 'red' : 'green';
          return (
            <span style={{ color }}>
              {record.priceDifference > 0 ? '+' : ''}
              {money.currency_symbol}
              {record.priceDifference.toFixed(2)}
            </span>
          );
        }
        if (record.type === 'exchange') {
          return `${money.currency_symbol}0.00`;
        }
        const balance = record.total - (record.credit || 0);
        return `${money.currency_symbol}${balance.toFixed(2)}`;
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status, record) => {
        if (record.type === 'return' || record.type === 'exchange') {
          const statusValue = record.status || 'pending';
          let color = 'default';
          if (statusValue === 'completed') color = 'green';
          else if (statusValue === 'approved') color = 'blue';
          else if (statusValue === 'rejected') color = 'red';
          return <Tag color={color}>{statusValue.toUpperCase()}</Tag>;
        }
        let color = 'red';
        if (status === 'paid') color = 'green';
        if (status === 'partially') color = 'orange';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  const handleAddPricing = () => {
    setEditingPricing(null);
    form.resetFields();
    setPricingModalVisible(true);
  };

  const handleEditPricing = (pricing) => {
    setEditingPricing(pricing);
    form.setFieldsValue({
      product: pricing.product,
      customPrice: pricing.customPrice,
    });
    setPricingModalVisible(true);
  };

  const handleDeletePricing = async (product) => {
    try {
      const updatedPricing = (client.customPricing || []).filter((p) => p.product !== product);

      const response = await request.update({
        entity: 'client',
        id: client._id,
        jsonData: { customPricing: updatedPricing },
      });

      if (response.success) {
        message.success('Custom pricing deleted successfully');
        fetchClientData();
      }
    } catch (error) {
      message.error('Failed to delete custom pricing');
      console.error(error);
    }
  };

  const handleSavePricing = async () => {
    try {
      const values = await form.validateFields();
      let { product, customPrice } = values;

      // Extract product name - it could be a string (when editing) or object (when adding new)
      let productName;
      if (typeof product === 'string') {
        productName = product;
      } else if (product && product.product) {
        productName = product.product;
      } else {
        message.error('Please select a valid product');
        return;
      }

      let updatedPricing = [...(client.customPricing || [])];

      if (editingPricing) {
        // Update existing pricing
        const index = updatedPricing.findIndex((p) => p.product === editingPricing.product);
        if (index !== -1) {
          updatedPricing[index] = { product: productName, customPrice };
        }
      } else {
        // Add new pricing or update if exists
        const existingIndex = updatedPricing.findIndex((p) => p.product === productName);
        if (existingIndex !== -1) {
          updatedPricing[existingIndex] = { product: productName, customPrice };
        } else {
          updatedPricing.push({ product: productName, customPrice });
        }
      }

      const response = await request.update({
        entity: 'client',
        id: client._id,
        jsonData: { customPricing: updatedPricing },
      });

      if (response.success) {
        message.success('Custom pricing saved successfully');
        setPricingModalVisible(false);
        fetchClientData();
      }
    } catch (error) {
      message.error('Failed to save custom pricing');
      console.error(error);
    }
  };

  const pricingColumns = [
    {
      title: translate('Product'),
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: translate('Custom Price'),
      dataIndex: 'customPrice',
      key: 'customPrice',
      render: (price) => `${money.currency_symbol}${price.toFixed(2)}`,
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPricing(record)}
          >
            {translate('Edit')}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePricing(record.product)}
          >
            {translate('Delete')}
          </Button>
        </>
      ),
    },
  ];

  const fullLogsColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
    },
    {
      title: translate('Type'),
      dataIndex: 'displayType',
      key: 'displayType',
      render: (displayType, record) => {
        let color = 'default';
        if (displayType === 'Invoice') color = 'blue';
        else if (displayType === 'Cash In') color = 'green';
        else if (displayType === 'Cash Out') color = 'red';
        else if (displayType === 'Return') color = 'purple';
        else if (displayType === 'Exchange') color = 'cyan';
        return <Tag color={color}>{displayType}</Tag>;
      },
      filters: [
        { text: 'Invoice', value: 'Invoice' },
        { text: 'Cash In', value: 'Cash In' },
        { text: 'Cash Out', value: 'Cash Out' },
        { text: 'Return', value: 'Return' },
        { text: 'Exchange', value: 'Exchange' },
      ],
      onFilter: (value, record) => record.displayType === value,
    },
    {
      title: translate('Reference'),
      key: 'reference',
      render: (_, record) => {
        if (record.transactionType === 'invoice') {
          return (
            <Button
              type="link"
              onClick={() => navigate(`/invoice/read/${record._id}`)}
            >
              Invoice #{record.number}
            </Button>
          );
        }
        if (record.transactionType === 'returnexchange') {
          return (
            <Button
              type="link"
              onClick={() => navigate(`/returnexchange/read/${record._id}`)}
            >
              {record.type === 'return' ? 'Return' : 'Exchange'} #{record.number}/{record.year}
            </Button>
          );
        }
        if (record.transactionType === 'cash') {
          return (
            <span>
              {record.reference || 'Cash Transaction'}
              {record.invoice && (
                <>
                  {' - '}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/invoice/read/${record.invoice._id}`)}
                  >
                    Invoice #{record.invoice.number}
                  </Button>
                </>
              )}
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: translate('Description'),
      key: 'description',
      render: (_, record) => {
        if (record.transactionType === 'invoice') {
          const itemCount = record.items?.length || 0;
          return `Invoice with ${itemCount} item${itemCount !== 1 ? 's' : ''}`;
        }
        if (record.transactionType === 'returnexchange') {
          return record.reason || `${record.type === 'return' ? 'Return' : 'Exchange'} - ${record.returnedItem?.itemName || 'Item'}`;
        }
        if (record.transactionType === 'cash') {
          return record.description || '-';
        }
        return '-';
      },
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        let displayAmount = amount;
        let prefix = '';
        let color = '#000';

        if (record.transactionType === 'cash') {
          if (record.type === 'out') {
            prefix = '-';
            color = '#ff4d4f';
          } else {
            prefix = '+';
            color = '#52c41a';
          }
        } else if (record.transactionType === 'returnexchange' && record.type === 'return') {
          prefix = '-';
          color = '#ff4d4f';
        }

        return (
          <span style={{ color, fontWeight: '500' }}>
            {prefix}{money.currency_symbol}{displayAmount.toFixed(2)}
          </span>
        );
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: translate('Paid/Received'),
      key: 'relatedAmount',
      align: 'right',
      render: (_, record) => {
        if (record.transactionType === 'invoice') {
          return `${money.currency_symbol}${record.relatedAmount.toFixed(2)}`;
        }
        if (record.transactionType === 'returnexchange' && record.type === 'exchange') {
          const diff = record.relatedAmount;
          if (diff === 0) return '-';
          const color = diff > 0 ? '#ff4d4f' : '#52c41a';
          return (
            <span style={{ color }}>
              {diff > 0 ? '+' : ''}{money.currency_symbol}{diff.toFixed(2)}
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: translate('Outstanding'),
      key: 'balance',
      align: 'right',
      render: (_, record) => {
        if (record.transactionType === 'invoice') {
          const bal = record.balance;
          if (bal === 0) return `${money.currency_symbol}0.00`;
          const color = bal > 0 ? '#ff4d4f' : '#52c41a';
          return (
            <span style={{ color, fontWeight: 'bold' }}>
              {money.currency_symbol}{bal.toFixed(2)}
            </span>
          );
        }
        if (record.transactionType === 'returnexchange') {
          const bal = record.balance;
          if (bal === 0) return `${money.currency_symbol}0.00`;
          const color = bal > 0 ? '#ff4d4f' : '#52c41a';
          return (
            <span style={{ color }}>
              {bal > 0 ? '+' : ''}{money.currency_symbol}{Math.abs(bal).toFixed(2)}
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: translate('Status'),
      key: 'status',
      render: (_, record) => {
        if (record.transactionType === 'invoice') {
          const status = record.paymentStatus;
          let color = 'red';
          if (status === 'paid') color = 'green';
          if (status === 'partially') color = 'orange';
          return <Tag color={color}>{status?.toUpperCase()}</Tag>;
        }
        if (record.transactionType === 'returnexchange') {
          const status = record.status || 'pending';
          let color = 'default';
          if (status === 'completed') color = 'green';
          else if (status === 'approved') color = 'blue';
          else if (status === 'rejected') color = 'red';
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        }
        if (record.transactionType === 'cash') {
          return <Tag color="green">COMPLETED</Tag>;
        }
        return '-';
      },
    },
  ];

  const cashColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'in' ? 'green' : 'red'}>
          {type === 'in' ? 'Cash In' : 'Cash Out'}
        </Tag>
      ),
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${money.currency_symbol}${amount.toFixed(2)}`,
    },
    {
      title: translate('Invoice'),
      dataIndex: ['invoice', 'number'],
      key: 'invoice',
      render: (number, record) =>
        record.invoice ? (
          <Button
            type="link"
            onClick={() => navigate(`/invoice/read/${record.invoice._id}`)}
          >
            #{number}
          </Button>
        ) : (
          '-'
        ),
    },
    {
      title: translate('Reference'),
      dataIndex: 'reference',
      key: 'reference',
      render: (ref) => ref || '-',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc || '-',
    },
  ];


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  // Combine invoices and return/exchanges for the invoices tab
  const combinedInvoiceData = [
    ...invoices.map(inv => ({ ...inv, type: 'invoice' })),
    ...returnExchanges
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Combine cash transactions with return/exchanges (for cash-related returns)
  const combinedCashData = [...cashTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Create full logs - all transactions combined
  const fullLogs = [
    ...invoices.map(inv => ({
      ...inv,
      transactionType: 'invoice',
      displayType: 'Invoice',
      date: inv.date,
      amount: inv.total,
      relatedAmount: inv.credit || 0,
      balance: inv.total - (inv.credit || 0),
    })),
    ...cashTransactions.map(cash => ({
      ...cash,
      transactionType: 'cash',
      displayType: cash.type === 'in' ? 'Cash In' : 'Cash Out',
      date: cash.date,
      amount: cash.amount,
      relatedAmount: 0,
      balance: 0,
    })),
    ...returnExchanges.map(re => ({
      ...re,
      transactionType: 'returnexchange',
      displayType: re.type === 'return' ? 'Return' : 'Exchange',
      date: re.date,
      amount: re.returnedItem?.total || 0,
      relatedAmount: re.type === 'exchange' ? (re.priceDifference || 0) : 0,
      balance: re.type === 'return' ? -(re.returnedItem?.total || 0) : (re.priceDifference || 0),
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Use backend balance if available, otherwise calculate locally
  const totalInvoiced = balance?.totalInvoiced || invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = balance?.totalPaid || invoices.reduce((sum, inv) => sum + (inv.credit || 0), 0);
  const totalReturns = balance?.totalReturns || 0;
  const totalExchangeDifference = balance?.totalExchangeDifference || 0;
  const totalBalance = balance?.outstanding || (totalInvoiced - totalPaid - totalReturns + totalExchangeDifference);
  const totalCashIn = cashTransactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCashOut = cashTransactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/customer')}
        style={{ marginBottom: '16px' }}
      >
        {translate('Back to Clients')}
      </Button>

      <Card title={`Client: ${client.name}`} style={{ marginBottom: '24px' }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={translate('Name')}>{client.name}</Descriptions.Item>
          <Descriptions.Item label={translate('Email')}>{client.email || '-'}</Descriptions.Item>
          <Descriptions.Item label={translate('Phone')}>{client.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label={translate('Country')}>
            {client.country || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Address')} span={2}>
            {client.address || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Total Invoiced</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {money.currency_symbol}
                {totalInvoiced.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Total Paid</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
                {money.currency_symbol}
                {totalPaid.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Returns</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'purple' }}>
                {money.currency_symbol}
                {totalReturns.toFixed(2)}
              </div>
              {totalExchangeDifference !== 0 && (
                <div style={{ fontSize: '12px', color: totalExchangeDifference > 0 ? 'red' : 'green', marginTop: '4px' }}>
                  Exchange Adj: {totalExchangeDifference > 0 ? '+' : ''}
                  {money.currency_symbol}
                  {Math.abs(totalExchangeDifference).toFixed(2)}
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Balance Due</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: totalBalance > 0 ? 'red' : 'green' }}>
                {money.currency_symbol}
                {Math.abs(totalBalance).toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {totalBalance > 0 ? 'To Receive' : totalBalance < 0 ? 'To Pay' : 'Settled'}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab={`Invoices & Returns (${combinedInvoiceData.length})`} key="1">
            <Table
              columns={invoiceColumns}
              dataSource={combinedInvoiceData}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Cash Transactions (${combinedCashData.length})`} key="2">
            <Table
              columns={cashColumns}
              dataSource={combinedCashData}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Custom Pricing" key="3">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPricing}
              style={{ marginBottom: '16px' }}
            >
              {translate('Add Custom Pricing')}
            </Button>
            <Table
              columns={pricingColumns}
              dataSource={client.customPricing || []}
              rowKey="product"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Full Logs (${fullLogs.length})`} key="4">
            <Table
              columns={fullLogsColumns}
              dataSource={fullLogs}
              rowKey={(record) => `${record.transactionType}-${record._id}`}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} transactions`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingPricing ? translate('Edit Custom Pricing') : translate('Add Custom Pricing')}
        open={pricingModalVisible}
        onOk={handleSavePricing}
        onCancel={() => setPricingModalVisible(false)}
        okText={translate('Save')}
        cancelText={translate('Cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product"
            label={translate('Product')}
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            {editingPricing ? (
              <Input disabled value={editingPricing.product} />
            ) : (
              <SelectInventoryItem />
            )}
          </Form.Item>
          <Form.Item
            name="customPrice"
            label={translate('Custom Price')}
            rules={[{ required: true, message: 'Please enter custom price' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
