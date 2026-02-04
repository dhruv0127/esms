import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Radio, Row, Col, Checkbox } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import SelectInventoryItem from '@/components/SelectInventoryItem';
import { request } from '@/request';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function ReturnExchangeForm({ current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const form = Form.useFormInstance();

  const [type, setType] = useState('return');
  const [returnedItemPrice, setReturnedItemPrice] = useState(0);
  const [returnedItemQuantity, setReturnedItemQuantity] = useState(0);
  const [exchangedItemPrice, setExchangedItemPrice] = useState(0);
  const [exchangedItemQuantity, setExchangedItemQuantity] = useState(0);
  const [priceDifference, setPriceDifference] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (current) {
      const { type: currentType, year, returnedItem, exchangedItem } = current;
      setType(currentType || 'return');
      setCurrentYear(year);

      if (returnedItem) {
        setReturnedItemPrice(returnedItem.price || 0);
        setReturnedItemQuantity(returnedItem.quantity || 0);
      }

      if (exchangedItem) {
        setExchangedItemPrice(exchangedItem.price || 0);
        setExchangedItemQuantity(exchangedItem.quantity || 0);
      }
    }
  }, [current]);

  useEffect(() => {
    const returnTotal = returnedItemPrice * returnedItemQuantity;
    const exchangeTotal = exchangedItemPrice * exchangedItemQuantity;
    const difference = exchangeTotal - returnTotal;

    setPriceDifference(difference);
    form.setFieldValue('priceDifference', difference);
  }, [returnedItemPrice, returnedItemQuantity, exchangedItemPrice, exchangedItemQuantity, form]);

  const handleTypeChange = (value) => {
    setType(value);
    // Clear exchanged item fields if switching to return
    if (value === 'return') {
      form.setFieldsValue({
        exchangedItem: {
          inventory: undefined,
          itemName: undefined,
          quantity: undefined,
          price: undefined,
        },
      });
      setExchangedItemPrice(0);
      setExchangedItemQuantity(0);
    }
  };

  const handleCustomerChange = async (customerId, customerObject) => {
    if (customerObject) {
      setSelectedCustomer(customerObject);
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleReturnedItemSelect = (inventoryObject) => {
    if (inventoryObject) {
      let newPrice = inventoryObject.unitPrice || 0;

      // Check if customer has custom pricing for this product
      if (selectedCustomer && selectedCustomer.customPricing && Array.isArray(selectedCustomer.customPricing)) {
        const customPricing = selectedCustomer.customPricing.find(
          (pricing) => pricing.product === inventoryObject.product
        );

        if (customPricing && customPricing.customPrice) {
          newPrice = customPricing.customPrice; // Use customer-specific price
        }
      }

      form.setFieldsValue({
        returnedItem: {
          itemName: inventoryObject.product,
          price: newPrice,
        },
      });
      setReturnedItemPrice(newPrice);
    }
  };

  const handleExchangedItemSelect = (inventoryObject) => {
    if (inventoryObject) {
      let newPrice = inventoryObject.unitPrice || 0;

      // Check if customer has custom pricing for this product
      if (selectedCustomer && selectedCustomer.customPricing && Array.isArray(selectedCustomer.customPricing)) {
        const customPricing = selectedCustomer.customPricing.find(
          (pricing) => pricing.product === inventoryObject.product
        );

        if (customPricing && customPricing.customPrice) {
          newPrice = customPricing.customPrice; // Use customer-specific price
        }
      }

      form.setFieldsValue({
        exchangedItem: {
          itemName: inventoryObject.product,
          price: newPrice,
        },
      });
      setExchangedItemPrice(newPrice);
    }
  };

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="number"
            label={translate('Number')}
            initialValue={lastNumber}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="year"
            label={translate('Year')}
            initialValue={currentYear}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="type"
            label={translate('Type')}
            rules={[{ required: true }]}
            initialValue="return"
          >
            <Radio.Group onChange={(e) => handleTypeChange(e.target.value)}>
              <Radio.Button value="return">{translate('Return')}</Radio.Button>
              <Radio.Button value="exchange">{translate('Exchange')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="customer"
            label={translate('Customer')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Customer'}
              withRedirect
              urlToRedirect={'/customer'}
              onChange={handleCustomerChange}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="currency"
            label={translate('Currency')}
            rules={[
              {
                required: true,
              },
            ]}
            initialValue="INR"
          >
            <Select
              options={[
                { value: 'INR', label: 'INR' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <h3>{translate('Returned Item')}</h3>
      </div>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name={['returnedItem', 'inventory']}
            label={translate('Item')}
            rules={[{ required: true }]}
          >
            <SelectInventoryItem onChange={handleReturnedItemSelect} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name={['returnedItem', 'itemName']}
            label={translate('Item Name')}
          >
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name={['returnedItem', 'quantity']}
            label={translate('Quantity')}
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              onChange={(value) => setReturnedItemQuantity(value || 0)}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name={['returnedItem', 'price']}
            label={translate('Price')}
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              onChange={(value) => setReturnedItemPrice(value || 0)}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item label={translate('Total')}>
            <InputNumber
              style={{ width: '100%' }}
              value={returnedItemPrice * returnedItemQuantity}
              disabled
            />
          </Form.Item>
        </Col>
      </Row>

      {type === 'exchange' && (
        <>
          <div style={{ marginBottom: 24, marginTop: 24 }}>
            <h3>{translate('Exchanged Item')}</h3>
          </div>

          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name={['exchangedItem', 'inventory']}
                label={translate('Item')}
                rules={[{ required: type === 'exchange' }]}
              >
                <SelectInventoryItem onChange={handleExchangedItemSelect} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name={['exchangedItem', 'itemName']}
                label={translate('Item Name')}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={8}>
              <Form.Item
                name={['exchangedItem', 'quantity']}
                label={translate('Quantity')}
                rules={[{ required: type === 'exchange' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  onChange={(value) => setExchangedItemQuantity(value || 0)}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item
                name={['exchangedItem', 'price']}
                label={translate('Price')}
                rules={[{ required: type === 'exchange' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  onChange={(value) => setExchangedItemPrice(value || 0)}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item label={translate('Total')}>
                <InputNumber
                  style={{ width: '100%' }}
                  value={exchangedItemPrice * exchangedItemQuantity}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                name="priceDifference"
                label={translate('Price Difference')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={priceDifference}
                  disabled
                  prefix={priceDifference >= 0 ? '+' : ''}
                />
              </Form.Item>
              {priceDifference > 0 && (
                <div style={{ color: '#ff4d4f', marginTop: -16, marginBottom: 16 }}>
                  Customer needs to pay: {moneyFormatter({ amount: priceDifference, currency_code: form.getFieldValue('currency') || 'INR' })}
                </div>
              )}
              {priceDifference < 0 && (
                <div style={{ color: '#52c41a', marginTop: -16, marginBottom: 16 }}>
                  Refund to customer: {moneyFormatter({ amount: Math.abs(priceDifference), currency_code: form.getFieldValue('currency') || 'INR' })}
                </div>
              )}
            </Col>
          </Row>
        </>
      )}

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item
            name="reason"
            label={translate('Reason')}
          >
            <TextArea rows={2} placeholder={translate('Enter reason for return/exchange')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item
            name="notes"
            label={translate('Notes')}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="status"
            label={translate('Status')}
            initialValue="pending"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="pending">{translate('Pending')}</Select.Option>
              <Select.Option value="approved">{translate('Approved')}</Select.Option>
              <Select.Option value="rejected">{translate('Rejected')}</Select.Option>
              <Select.Option value="completed">{translate('Completed')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={12}>
          <Form.Item
            name="createCashTransaction"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>
              {translate('create_cash_transaction_automatically')}
            </Checkbox>
          </Form.Item>
          <div style={{ fontSize: '12px', color: '#888', marginTop: -16 }}>
            {type === 'return' && (
              <span>Will create a Cash Out transaction for the returned amount</span>
            )}
            {type === 'exchange' && priceDifference > 0 && (
              <span>Will create a Cash In transaction for the difference amount</span>
            )}
            {type === 'exchange' && priceDifference < 0 && (
              <span>Will create a Cash Out transaction for the refund amount</span>
            )}
            {type === 'exchange' && priceDifference === 0 && (
              <span>No cash transaction needed (equal exchange)</span>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
