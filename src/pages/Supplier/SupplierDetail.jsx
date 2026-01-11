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

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const money = useMoney();

  const [supplier, setSupplier] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSupplierData();
  }, [id]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);

      // Fetch supplier details
      const supplierResponse = await request.read({ entity: 'supplier', id });
      if (supplierResponse.success) {
        setSupplier(supplierResponse.result);
      }

      // Fetch supplier purchases
      const purchaseResponse = await request.list({
        entity: 'purchase',
        options: { page: 1, items: 100 },
      });
      if (purchaseResponse.success) {
        const supplierPurchases = purchaseResponse.result.filter(
          (pur) => pur.supplier && pur.supplier._id === id
        );
        setPurchases(supplierPurchases);
      }

      // Fetch supplier cash transactions
      const cashResponse = await request.list({
        entity: 'cashtransaction',
        options: { page: 1, items: 100 },
      });
      if (cashResponse.success) {
        const supplierTransactions = cashResponse.result.filter(
          (txn) => txn.supplier && txn.supplier._id === id
        );
        setCashTransactions(supplierTransactions);
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseColumns = [
    {
      title: translate('Purchase Number'),
      dataIndex: 'number',
      key: 'number',
      render: (number, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/purchase/read/${record._id}`)}
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
      const updatedPricing = (supplier.customPricing || []).filter((p) => p.product !== product);

      const response = await request.update({
        entity: 'supplier',
        id: supplier._id,
        jsonData: { customPricing: updatedPricing },
      });

      if (response.success) {
        message.success('Custom pricing deleted successfully');
        fetchSupplierData();
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

      let updatedPricing = [...(supplier.customPricing || [])];

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
        entity: 'supplier',
        id: supplier._id,
        jsonData: { customPricing: updatedPricing },
      });

      if (response.success) {
        message.success('Custom pricing saved successfully');
        setPricingModalVisible(false);
        fetchSupplierData();
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

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  // Calculate totals
  const totalPurchased = purchases.reduce((sum, pur) => sum + pur.total, 0);
  const totalPaid = purchases.reduce((sum, pur) => sum + (pur.credit || 0), 0);
  const totalBalance = totalPurchased - totalPaid;
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
        onClick={() => navigate('/supplier')}
        style={{ marginBottom: '16px' }}
      >
        {translate('Back to Suppliers')}
      </Button>

      <Card title={`Supplier: ${supplier.name}`} style={{ marginBottom: '24px' }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={translate('Name')}>{supplier.name}</Descriptions.Item>
          <Descriptions.Item label={translate('Email')}>{supplier.email || '-'}</Descriptions.Item>
          <Descriptions.Item label={translate('Phone')}>{supplier.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label={translate('Country')}>
            {supplier.country || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Address')} span={2}>
            {supplier.address || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>Total Purchased</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {money.currency_symbol}
                {totalPurchased.toFixed(2)}
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
          <TabPane tab={`Purchases (${purchases.length})`} key="1">
            <Table
              columns={purchaseColumns}
              dataSource={purchases}
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
              dataSource={supplier.customPricing || []}
              rowKey="product"
              pagination={{ pageSize: 10 }}
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
