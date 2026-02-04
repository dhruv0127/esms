import React, { useState, useMemo } from 'react';
import { DatePicker, Button, Card, Row, Col, Statistic, Table, Spin, Typography, Tag } from 'antd';
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '@ant-design/pro-layout';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function Reports() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    if (!dateRange || dateRange.length !== 2) {
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      const response = await request.get({
        entity: `report/detailed?startDate=${startDate}&endDate=${endDate}`,
      });

      if (response.success) {
        setReportData(response.result);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine all transactions into a unified list with running balances
  const allTransactions = useMemo(() => {
    if (!reportData) return [];

    const transactions = [];

    // Add invoices
    reportData.details.invoices.forEach((invoice) => {
      transactions.push({
        _id: `invoice-${invoice._id}`,
        date: invoice.date,
        cashType: 'Invoice',
        partyType: 'Client',
        partyName: invoice.client?.name || '-',
        partyId: invoice.client?._id || null,
        amount: invoice.total || 0,
        outstanding: (invoice.total || 0) - (invoice.credit || 0),
        currency: invoice.currency,
        type: 'invoice',
        number: invoice.number,
      });
    });

    // Add purchases
    reportData.details.purchases.forEach((purchase) => {
      transactions.push({
        _id: `purchase-${purchase._id}`,
        date: purchase.date,
        cashType: 'Purchase',
        partyType: 'Supplier',
        partyName: purchase.supplier?.name || '-',
        partyId: purchase.supplier?._id || null,
        amount: purchase.total || 0,
        outstanding: -((purchase.total || 0) - (purchase.credit || 0)), // Negative for purchases
        currency: purchase.currency,
        type: 'purchase',
        number: purchase.number,
      });
    });

    // Add cash transactions
    reportData.details.cashTransactions.forEach((cash) => {
      const isIn = cash.type === 'in';
      const partyId = cash.partyType === 'client' ? cash.client?._id : cash.supplier?._id;

      transactions.push({
        _id: `cash-${cash._id}`,
        date: cash.date,
        cashType: isIn ? 'Cash In' : 'Cash Out',
        partyType: cash.partyType === 'client' ? 'Client' : 'Supplier',
        partyName:
          cash.partyType === 'client' ? cash.client?.name || '-' : cash.supplier?.name || '-',
        partyId: partyId || null,
        amount: cash.amount || 0,
        outstanding: 0, // Cash transactions are settled immediately
        currency: cash.currency,
        type: 'cash',
        description: cash.description,
      });
    });

    // Sort by date (oldest first for running balance calculation)
    const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance for each party
    const partyBalances = {}; // Track running balance by partyId

    const transactionsWithBalance = sortedTransactions.map((txn) => {
      const partyKey = `${txn.partyType}-${txn.partyId}`;

      // Initialize balance if not exists
      if (!partyBalances[partyKey]) {
        partyBalances[partyKey] = 0;
      }

      // Update balance based on transaction type
      if (txn.type === 'invoice') {
        // Invoice increases client balance (they owe us)
        partyBalances[partyKey] += txn.outstanding;
      } else if (txn.type === 'purchase') {
        // Purchase increases supplier balance we owe (negative)
        partyBalances[partyKey] += txn.outstanding;
      } else if (txn.type === 'cash') {
        // Cash transaction affects balance
        if (txn.cashType === 'Cash In') {
          // Cash received reduces what they owe us
          partyBalances[partyKey] -= txn.amount;
        } else {
          // Cash paid reduces what we owe them
          partyBalances[partyKey] += txn.amount;
        }
      }

      return {
        ...txn,
        partyBalance: partyBalances[partyKey],
      };
    });

    // Return sorted by date (newest first) for display
    return transactionsWithBalance.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reportData]);

  const transactionColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format(dateFormat),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: translate('Cash Type'),
      dataIndex: 'cashType',
      key: 'cashType',
      render: (cashType) => {
        let color = 'default';
        if (cashType === 'Invoice') color = 'blue';
        else if (cashType === 'Purchase') color = 'orange';
        else if (cashType === 'Cash In') color = 'green';
        else if (cashType === 'Cash Out') color = 'red';
        return <Tag color={color}>{cashType}</Tag>;
      },
      filters: [
        { text: 'Invoice', value: 'Invoice' },
        { text: 'Purchase', value: 'Purchase' },
        { text: 'Cash In', value: 'Cash In' },
        { text: 'Cash Out', value: 'Cash Out' },
      ],
      onFilter: (value, record) => record.cashType === value,
    },
    {
      title: translate('Party Type'),
      dataIndex: 'partyType',
      key: 'partyType',
      filters: [
        { text: 'Client', value: 'Client' },
        { text: 'Supplier', value: 'Supplier' },
      ],
      onFilter: (value, record) => record.partyType === value,
    },
    {
      title: translate('Party Name'),
      dataIndex: 'partyName',
      key: 'partyName',
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => moneyFormatter({ amount, currency_code: record.currency }),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: translate('Outstanding'),
      dataIndex: 'outstanding',
      key: 'outstanding',
      align: 'right',
      render: (outstanding, record) => {
        const color = outstanding > 0 ? '#52c41a' : outstanding < 0 ? '#ff4d4f' : '#666';
        return (
          <span style={{ color, fontWeight: outstanding !== 0 ? 'bold' : 'normal' }}>
            {moneyFormatter({ amount: Math.abs(outstanding), currency_code: record.currency })}
            {outstanding > 0 && ' (Receivable)'}
            {outstanding < 0 && ' (Payable)'}
          </span>
        );
      },
      sorter: (a, b) => a.outstanding - b.outstanding,
    },
    {
      title: translate('Party Balance'),
      dataIndex: 'partyBalance',
      key: 'partyBalance',
      align: 'right',
      render: (partyBalance, record) => {
        const color = partyBalance > 0 ? '#52c41a' : partyBalance < 0 ? '#ff4d4f' : '#666';
        return (
          <span
            style={{
              color,
              fontWeight: 'bold',
              backgroundColor: partyBalance !== 0 ? (partyBalance > 0 ? '#f6ffed' : '#fff2f0') : 'transparent',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {moneyFormatter({ amount: Math.abs(partyBalance), currency_code: record.currency })}
            {partyBalance > 0 && ' (To Receive)'}
            {partyBalance < 0 && ' (To Pay)'}
          </span>
        );
      },
      sorter: (a, b) => a.partyBalance - b.partyBalance,
    },
  ];

  return (
    <div>
      <PageHeader
        onBack={() => window.history.back()}
        title="Detailed Reports"
        ghost={false}
        extra={[
          <RangePicker
            key="datepicker"
            value={dateRange}
            onChange={setDateRange}
            format={dateFormat}
            style={{ marginRight: 8 }}
          />,
          <Button key="generate" type="primary" onClick={fetchReport} loading={loading}>
            Generate Report
          </Button>,
        ]}
      />

      <div style={{ padding: '24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}

        {!loading && reportData && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Invoices"
                    value={reportData.summary.invoices.count}
                    prefix={<FileTextOutlined />}
                  />
                  <Statistic
                    title="Invoice Amount"
                    value={reportData.summary.invoices.totalAmount}
                    precision={2}
                    valueStyle={{ fontSize: 16, marginTop: 8 }}
                  />
                  <Statistic
                    title="Paid"
                    value={reportData.summary.invoices.paidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: '#52c41a', marginTop: 4 }}
                  />
                  <Statistic
                    title="Unpaid"
                    value={reportData.summary.invoices.unpaidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: '#ff4d4f', marginTop: 4 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Purchases"
                    value={reportData.summary.purchases.count}
                    prefix={<ShoppingCartOutlined />}
                  />
                  <Statistic
                    title="Purchase Amount"
                    value={reportData.summary.purchases.totalAmount}
                    precision={2}
                    valueStyle={{ fontSize: 16, marginTop: 8 }}
                  />
                  <Statistic
                    title="Paid"
                    value={reportData.summary.purchases.paidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: '#52c41a', marginTop: 4 }}
                  />
                  <Statistic
                    title="Unpaid"
                    value={reportData.summary.purchases.unpaidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: '#ff4d4f', marginTop: 4 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Transactions"
                    value={reportData.summary.cashTransactions.count}
                    prefix={<DollarOutlined />}
                  />
                  <Statistic
                    title="Cash In"
                    value={reportData.summary.cashTransactions.cashIn}
                    precision={2}
                    prefix={<ArrowUpOutlined />}
                    valueStyle={{ fontSize: 16, color: '#52c41a', marginTop: 8 }}
                  />
                  <Statistic
                    title="Cash Out"
                    value={reportData.summary.cashTransactions.cashOut}
                    precision={2}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ fontSize: 16, color: '#ff4d4f', marginTop: 4 }}
                  />
                  <Statistic
                    title="Net Cash Flow"
                    value={reportData.summary.cashTransactions.netCash}
                    precision={2}
                    valueStyle={{
                      fontSize: 16,
                      color:
                        reportData.summary.cashTransactions.netCash >= 0 ? '#52c41a' : '#ff4d4f',
                      marginTop: 4,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title={`All Transactions (${allTransactions.length})`}>
              <Table
                columns={transactionColumns}
                dataSource={allTransactions}
                rowKey="_id"
                pagination={{
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} transactions`,
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </>
        )}

        {!loading && !reportData && (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Title level={4}>Select a date range and click Generate Report</Title>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
