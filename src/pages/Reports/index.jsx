import React, { useState, useMemo } from 'react';
import {
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Spin,
  Typography,
  Tag,
  Tabs,
  Select,
} from 'antd';
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
import useResponsive from '@/hooks/useResponsive';
import { getAmountColor } from '@/utils/amountColor';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

const { RangePicker } = DatePicker;
const { Title } = Typography;

function PartyLedger() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { isMobile } = useResponsive();

  const [partyType, setPartyType] = useState('client');
  const [selectedParty, setSelectedParty] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);

  const handlePartyChange = (partyId, partyObj) => {
    setSelectedParty(partyObj ? { _id: partyId, ...partyObj } : null);
    setLedgerData(null);
  };

  const fetchLedger = async () => {
    if (!selectedParty?._id) return;

    setLoading(true);
    try {
      let query = `report/party-ledger?partyId=${selectedParty._id}&partyType=${partyType}`;
      if (dateRange && dateRange.length === 2) {
        query += `&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      const response = await request.get({ entity: query });
      if (response.success) {
        setLedgerData(response.result);
      }
    } catch (error) {
      console.error('Error fetching party ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const ledgerColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format(dateFormat),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Credit'),
      dataIndex: 'credit',
      key: 'credit',
      align: 'right',
      render: (val) =>
        val > 0 ? (
          <span style={{ color: '#cf1322' }}>{moneyFormatter({ amount: val })}</span>
        ) : (
          '-'
        ),
    },
    {
      title: translate('Debit'),
      dataIndex: 'debit',
      key: 'debit',
      align: 'right',
      render: (val) =>
        val > 0 ? (
          <span style={{ color: '#389e0d' }}>{moneyFormatter({ amount: val })}</span>
        ) : (
          '-'
        ),
    },
    {
      title: translate('Outstanding'),
      dataIndex: 'outstanding',
      key: 'outstanding',
      align: 'right',
      render: (val) => (
        <span style={{ color: getAmountColor(val > 0 ? -1 : 1), fontWeight: 'bold' }}>
          {moneyFormatter({ amount: Math.abs(val) })}
          {val > 0 ? ' (Due)' : val < 0 ? ' (Advance)' : ''}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px' }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={6}>
            <Select
              value={partyType}
              onChange={(val) => {
                setPartyType(val);
                setSelectedParty(null);
                setLedgerData(null);
              }}
              style={{ width: '100%' }}
            >
              <Select.Option value="client">Client</Select.Option>
              <Select.Option value="supplier">Supplier</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <AutoCompleteAsync
              key={partyType}
              entity={partyType}
              displayLabels={['name']}
              searchFields="name"
              outputValue="_id"
              onChange={handlePartyChange}
            />
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format={dateFormat}
              style={{ width: '100%' }}
              placeholder={['Start Date (optional)', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              type="primary"
              onClick={fetchLedger}
              loading={loading}
              disabled={!selectedParty}
              block
            >
              Generate
            </Button>
          </Col>
        </Row>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && ledgerData && (
        <>
          <Card
            title={`Ledger: ${ledgerData.party?.name}`}
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={ledgerColumns}
              dataSource={ledgerData.rows}
              rowKey={(_, idx) => idx}
              pagination={{ pageSize: 20, showSizeChanger: true }}
              scroll={{ x: 700 }}
              size={isMobile ? 'small' : 'middle'}
              summary={() => (
                <Table.Summary.Row style={{ fontWeight: 'bold', background: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Total
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <span style={{ color: '#cf1322' }}>
                      {moneyFormatter({ amount: ledgerData.summary.totalCredit })}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <span style={{ color: '#389e0d' }}>
                      {moneyFormatter({ amount: ledgerData.summary.totalDebit })}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <span
                      style={{
                        color: getAmountColor(ledgerData.summary.closingBalance > 0 ? -1 : 1),
                        fontWeight: 'bold',
                      }}
                    >
                      {moneyFormatter({ amount: Math.abs(ledgerData.summary.closingBalance) })}
                      {ledgerData.summary.closingBalance > 0 ? ' (Due)' : ledgerData.summary.closingBalance < 0 ? ' (Advance)' : ''}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </>
      )}

      {!loading && !ledgerData && (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Title level={4}>Select a party and click Generate</Title>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function Reports() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { isMobile } = useResponsive();

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

    // Add return/exchanges
    if (reportData.details.returnExchanges) {
      reportData.details.returnExchanges.forEach((returnExchange) => {
        const isReturn = returnExchange.type === 'return';
        const amount = isReturn
          ? returnExchange.returnedItem?.total || 0
          : Math.abs(returnExchange.priceDifference || 0);

        transactions.push({
          _id: `returnexchange-${returnExchange._id}`,
          date: returnExchange.date,
          cashType: isReturn ? 'Return' : 'Exchange',
          partyType: 'Client',
          partyName: returnExchange.customer?.name || '-',
          partyId: returnExchange.customer?._id || null,
          amount: amount,
          outstanding: isReturn
            ? -(returnExchange.returnedItem?.total || 0) // Returns reduce what customer owes
            : -(returnExchange.priceDifference || 0), // Positive diff means customer owes more
          currency: returnExchange.currency,
          type: 'returnexchange',
          number: returnExchange.number,
          returnExchangeType: returnExchange.type,
        });
      });
    }

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
        else if (cashType === 'Return') color = 'purple';
        else if (cashType === 'Exchange') color = 'cyan';
        return <Tag color={color}>{cashType}</Tag>;
      },
      filters: [
        { text: 'Invoice', value: 'Invoice' },
        { text: 'Purchase', value: 'Purchase' },
        { text: 'Cash In', value: 'Cash In' },
        { text: 'Cash Out', value: 'Cash Out' },
        { text: 'Return', value: 'Return' },
        { text: 'Exchange', value: 'Exchange' },
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
        return (
          <span style={{ color: getAmountColor(outstanding), fontWeight: outstanding !== 0 ? 'bold' : 'normal' }}>
            {outstanding > 0 ? '+' : outstanding < 0 ? '-' : ''}{moneyFormatter({ amount: Math.abs(outstanding), currency_code: record.currency })}
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
        return (
          <span
            style={{
              color: getAmountColor(partyBalance),
              fontWeight: 'bold',
              backgroundColor: partyBalance !== 0 ? (partyBalance > 0 ? '#f6ffed' : '#fff2f0') : 'transparent',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {partyBalance > 0 ? '+' : partyBalance < 0 ? '-' : ''}{moneyFormatter({ amount: Math.abs(partyBalance), currency_code: record.currency })}
            {partyBalance > 0 && ' (To Receive)'}
            {partyBalance < 0 && ' (To Pay)'}
          </span>
        );
      },
      sorter: (a, b) => a.partyBalance - b.partyBalance,
    },
  ];

  const detailedReportContent = (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        title="Detailed Reports"
        ghost={false}
        extra={isMobile ? undefined : [
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
        style={{ padding: isMobile ? '12px' : '20px' }}
      />

      {isMobile && (
        <div style={{ padding: '12px' }}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format={dateFormat}
            style={{ width: '100%', marginBottom: 8 }}
            size="small"
          />
          <Button
            type="primary"
            onClick={fetchReport}
            loading={loading}
            block
            size="small"
          >
            Generate Report
          </Button>
        </div>
      )}

      <div style={{ padding: isMobile ? '12px' : '24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '50px' }}>
            <Spin size="large" />
          </div>
        )}

        {!loading && reportData && (
          <>
            <Row gutter={isMobile ? [8, 8] : 16} style={{ marginBottom: isMobile ? 12 : 24 }}>
              <Col xs={24} sm={24} md={8} span={8}>
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
                    valueStyle={{ fontSize: 14, color: getAmountColor(reportData.summary.invoices.paidAmount), marginTop: 4 }}
                  />
                  <Statistic
                    title="Unpaid"
                    value={reportData.summary.invoices.unpaidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: getAmountColor(-reportData.summary.invoices.unpaidAmount), marginTop: 4 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8} span={8}>
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
                    valueStyle={{ fontSize: 14, color: getAmountColor(reportData.summary.purchases.paidAmount), marginTop: 4 }}
                  />
                  <Statistic
                    title="Unpaid"
                    value={reportData.summary.purchases.unpaidAmount}
                    precision={2}
                    valueStyle={{ fontSize: 14, color: getAmountColor(-reportData.summary.purchases.unpaidAmount), marginTop: 4 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8} span={8}>
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
                    valueStyle={{ fontSize: 16, color: getAmountColor(reportData.summary.cashTransactions.cashIn), marginTop: 8 }}
                  />
                  <Statistic
                    title="Cash Out"
                    value={reportData.summary.cashTransactions.cashOut}
                    precision={2}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ fontSize: 16, color: getAmountColor(-reportData.summary.cashTransactions.cashOut), marginTop: 4 }}
                  />
                  <Statistic
                    title="Net Cash Flow"
                    value={reportData.summary.cashTransactions.netCash}
                    precision={2}
                    valueStyle={{
                      fontSize: 16,
                      color: getAmountColor(reportData.summary.cashTransactions.netCash),
                      marginTop: 4,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title={`All Transactions (${allTransactions.length})`}>
              {isMobile ? (
                <div>
                  {allTransactions.map((record, index) => (
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
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Date:</span>
                            <span style={{ fontSize: 12 }}>{dayjs(record.date).format(dateFormat)}</span>
                          </div>
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Type:</span>
                            <span style={{ fontSize: 12 }}>
                              {record.cashType === 'Invoice' && <Tag color="blue">{record.cashType}</Tag>}
                              {record.cashType === 'Purchase' && <Tag color="orange">{record.cashType}</Tag>}
                              {record.cashType === 'Cash In' && <Tag color="green">{record.cashType}</Tag>}
                              {record.cashType === 'Cash Out' && <Tag color="red">{record.cashType}</Tag>}
                              {record.cashType === 'Return' && <Tag color="purple">{record.cashType}</Tag>}
                              {record.cashType === 'Exchange' && <Tag color="cyan">{record.cashType}</Tag>}
                            </span>
                          </div>
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Party:</span>
                            <span style={{ fontSize: 12 }}>{record.partyType} - {record.partyName}</span>
                          </div>
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Amount:</span>
                            <span style={{ fontSize: 12 }}>{moneyFormatter({ amount: record.amount, currency_code: record.currency })}</span>
                          </div>
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Outstanding:</span>
                            <span style={{ fontSize: 12, color: getAmountColor(record.outstanding) }}>
                              {record.outstanding > 0 ? '+' : record.outstanding < 0 ? '-' : ''}{moneyFormatter({ amount: Math.abs(record.outstanding), currency_code: record.currency })}
                              {record.outstanding > 0 && ' (Receivable)'}
                              {record.outstanding < 0 && ' (Payable)'}
                            </span>
                          </div>
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500, color: '#666', fontSize: 11 }}>Balance:</span>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 'bold',
                              color: getAmountColor(record.partyBalance),
                            }}>
                              {record.partyBalance > 0 ? '+' : record.partyBalance < 0 ? '-' : ''}{moneyFormatter({ amount: Math.abs(record.partyBalance), currency_code: record.currency })}
                              {record.partyBalance > 0 && ' (To Receive)'}
                              {record.partyBalance < 0 && ' (To Pay)'}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table
                  columns={transactionColumns}
                  dataSource={allTransactions}
                  rowKey="_id"
                  pagination={{
                    showSizeChanger: !isMobile,
                    showTotal: (total) => `Total ${total} transactions`,
                    pageSize: isMobile ? 10 : 20,
                  }}
                  scroll={{ x: isMobile ? 800 : 1000 }}
                  size={isMobile ? 'small' : 'middle'}
                />
              )}
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
    </>
  );

  return (
    <div>
      <Tabs
        defaultActiveKey="detailed"
        style={{ padding: isMobile ? '0 12px' : '0 24px' }}
        items={[
          {
            key: 'detailed',
            label: 'Detailed Report',
            children: detailedReportContent,
          },
          {
            key: 'party-ledger',
            label: 'Party Ledger',
            children: <PartyLedger />,
          },
        ]}
      />
    </div>
  );
}
