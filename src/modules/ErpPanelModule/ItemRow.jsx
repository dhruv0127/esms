import { useState, useEffect, useRef } from 'react';
import { Form, InputNumber, Row, Col, message } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import SelectInventoryItem from '@/components/SelectInventoryItem';
import { request } from '@/request';

export default function ItemRow({ field, remove, current = null, selectedClient = null }) {
  const form = Form.useFormInstance();
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [autoFilledPrice, setAutoFilledPrice] = useState(null);
  const priceUpdateTimeoutRef = useRef(null);

  const money = useMoney();
  const updateQt = (value) => {
    setQuantity(value);
  };
  const updatePrice = (value) => {
    setPrice(value);

    // Check if this is a manual price change (different from auto-filled price)
    if (selectedClient && selectedProductName && autoFilledPrice !== null && value !== autoFilledPrice) {
      // Debounce the API call to avoid too many requests while user is typing
      if (priceUpdateTimeoutRef.current) {
        clearTimeout(priceUpdateTimeoutRef.current);
      }

      priceUpdateTimeoutRef.current = setTimeout(() => {
        updateClientCustomPricing(value);
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  const updateClientCustomPricing = async (newPrice) => {
    if (!selectedClient || !selectedProductName || !newPrice) return;

    try {
      // Get existing custom pricing
      let updatedPricing = [...(selectedClient.customPricing || [])];

      // Find if this product already has custom pricing
      const existingIndex = updatedPricing.findIndex((p) => p.product === selectedProductName);

      if (existingIndex !== -1) {
        // Update existing
        updatedPricing[existingIndex] = { product: selectedProductName, customPrice: newPrice };
      } else {
        // Add new
        updatedPricing.push({ product: selectedProductName, customPrice: newPrice });
      }

      // Update client with new custom pricing
      await request.update({
        entity: 'client',
        id: selectedClient._id,
        jsonData: { customPricing: updatedPricing },
      });

      // Update the autoFilledPrice to the new value so subsequent edits are compared to this
      setAutoFilledPrice(newPrice);

      // Silently update - no success message to avoid disrupting the user
    } catch (error) {
      console.error('Failed to update custom pricing:', error);
    }
  };

  const handleItemSelect = (selectedItem) => {
    if (selectedItem && selectedItem.unitPrice && selectedItem.product) {
      let newPrice = selectedItem.unitPrice; // Default price from inventory

      // Check if client has custom pricing for this product
      if (selectedClient && selectedClient.customPricing && Array.isArray(selectedClient.customPricing)) {
        const customPricing = selectedClient.customPricing.find(
          (pricing) => pricing.product === selectedItem.product
        );
        if (customPricing && customPricing.customPrice) {
          newPrice = customPricing.customPrice; // Use client-specific price
        }
      }

      // Store the product name and auto-filled price for tracking manual changes
      setSelectedProductName(selectedItem.product);
      setAutoFilledPrice(newPrice);
      setPrice(newPrice);

      // Update both itemName (product name) and price in the form
      const items = form.getFieldValue('items') || [];
      items[field.name] = {
        ...items[field.name],
        itemName: selectedItem.product, // Store the product name for backend
        price: newPrice,
      };
      form.setFieldsValue({ items });
    } else if (!selectedItem) {
      // Clear price when item is cleared
      setSelectedProductName(null);
      setAutoFilledPrice(null);
      setPrice(0);
      const items = form.getFieldValue('items') || [];
      items[field.name] = {
        ...items[field.name],
        itemName: '',
        price: 0,
      };
      form.setFieldsValue({ items });
    }
  };

  useEffect(() => {
    if (current) {
      // When it accesses the /payment/ endpoint,
      // it receives an invoice.item instead of just item
      // and breaks the code, but now we can check if items exists,
      // and if it doesn't we can access invoice.items.

      const { items, invoice } = current;

      if (invoice) {
        const item = invoice[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      } else {
        const item = items[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);

    setTotal(currentTotal);
  }, [price, quantity]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (priceUpdateTimeoutRef.current) {
        clearTimeout(priceUpdateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Please select an item',
            },
          ]}
        >
          <SelectInventoryItem onChange={handleItemSelect} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) =>
                money.amountFormatter({ amount: value, currency_code: money.currency_code })
              }
            />
          </Form.Item>
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
