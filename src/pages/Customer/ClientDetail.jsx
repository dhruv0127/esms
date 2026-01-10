import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Table, Tabs, Tag, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const money = useMoney();

  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const invoiceColumns = [
    {
      title: translate('Invoice Number'),
      dataIndex: 'number',
      key: 'number',
      render: (number, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/invoice/read/${record._id}`)}
        >
          #{number}
        </Button>
      ),
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${money.currency_symbol}${total.toFixed(2)}`,
    },
    {
      title: translate('Paid'),
      dataIndex: 'credit',
      key: 'credit',
      render: (credit) => `${money.currency_symbol}${(credit || 0).toFixed(2)}`,
    },
    {
      title: translate('Balance'),
      key: 'balance',
      render: (_, record) => {
        const balance = record.total - (record.credit || 0);
        return `${money.currency_symbol}${balance.toFixed(2)}`;
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        let color = 'red';
        if (status === 'paid') color = 'green';
        if (status === 'partially') color = 'orange';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
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

  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.credit || 0), 0);
  const totalBalance = totalInvoiced - totalPaid;
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
              <div style={{ fontSize: '14px', color: '#888' }}>Balance Due</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
                {money.currency_symbol}
                {totalBalance.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Total Transactions</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {cashTransactions.length}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab={`Invoices (${invoices.length})`} key="1">
            <Table
              columns={invoiceColumns}
              dataSource={invoices}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Cash Transactions (${cashTransactions.length})`} key="2">
            <Table
              columns={cashColumns}
              dataSource={cashTransactions}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
