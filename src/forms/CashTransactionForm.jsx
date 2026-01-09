import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';
import SelectAsync from '@/components/SelectAsync';

const { TextArea } = Input;

export default function CashTransactionForm() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const money = useMoney();
  const form = Form.useFormInstance();

  const handlePartyTypeChange = (value) => {
    // Clear the opposite field when party type changes
    if (value === 'client') {
      form.setFieldValue('supplier', undefined);
    } else {
      form.setFieldValue('client', undefined);
    }
  };

  return (
    <>
      <Form.Item
        label={translate('type')}
        name="type"
        rules={[
          {
            required: true,
            message: translate('Please select transaction type'),
          },
        ]}
      >
        <Select
          style={{ width: '100%' }}
          placeholder={translate('Select transaction type')}
        >
          <Select.Option value="in">Cash In (Received)</Select.Option>
          <Select.Option value="out">Cash Out (Paid)</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('amount')}
        name="amount"
        rules={[{ required: true }]}
      >
        <InputNumber
          className="moneyInput"
          min={0}
          controls={false}
          style={{ width: '100%' }}
          addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
          addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
        />
      </Form.Item>

      <Form.Item
        label={translate('date')}
        name="date"
        rules={[
          {
            required: true,
            type: 'object',
          },
        ]}
      >
        <DatePicker format={dateFormat} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label={translate('party_type')}
        name="partyType"
        rules={[
          {
            required: true,
            message: translate('Please select party type'),
          },
        ]}
        initialValue="client"
      >
        <Select
          style={{ width: '100%' }}
          placeholder={translate('Select party type')}
          onChange={handlePartyTypeChange}
        >
          <Select.Option value="client">{translate('client')}</Select.Option>
          <Select.Option value="supplier">{translate('supplier')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.partyType !== currentValues.partyType}>
        {({ getFieldValue }) => {
          const currentPartyType = getFieldValue('partyType') || 'client';

          if (currentPartyType === 'client') {
            return (
              <Form.Item
                label={translate('client')}
                name="client"
              >
                <SelectAsync
                  entity={'client'}
                  displayLabels={['name']}
                  withRedirect={true}
                  urlToRedirect="/customer"
                  redirectLabel="Add New Client"
                />
              </Form.Item>
            );
          } else {
            return (
              <Form.Item
                label={translate('supplier')}
                name="supplier"
              >
                <SelectAsync
                  entity={'supplier'}
                  displayLabels={['name']}
                  withRedirect={true}
                  urlToRedirect="/supplier"
                  redirectLabel="Add New Supplier"
                />
              </Form.Item>
            );
          }
        }}
      </Form.Item>

      <Form.Item
        label={translate('reference')}
        name="reference"
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={translate('description')}
        name="description"
      >
        <TextArea rows={4} />
      </Form.Item>
    </>
  );
}
