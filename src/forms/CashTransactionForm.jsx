import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useDate, useMoney } from '@/settings';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

const { TextArea } = Input;

export default function CashTransactionForm() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const money = useMoney();
  const form = Form.useFormInstance();
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Fetch invoices when client changes
  const fetchClientInvoices = async (clientId) => {
    if (!clientId) {
      setInvoices([]);
      return;
    }

    try {
      setLoadingInvoices(true);
      const response = await request.list({
        entity: 'invoice',
        options: {
          page: 1,
          items: 100,
        },
      });

      if (response && response.result) {
        // Filter invoices for this client with unpaid/partially status
        const clientInvoices = response.result.filter(
          (inv) =>
            inv.client &&
            inv.client._id === clientId &&
            (inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partially')
        );
        setInvoices(clientInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handlePartyTypeChange = (value) => {
    // Clear the opposite field when party type changes
    if (value === 'client') {
      form.setFieldValue('supplier', undefined);
    } else {
      form.setFieldValue('client', undefined);
    }
    // Clear invoice and invoices list
    form.setFieldValue('invoice', undefined);
    setInvoices([]);
    setSelectedClient(null);
  };

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId);
    // Clear invoice selection when client changes
    form.setFieldValue('invoice', undefined);
    // Fetch invoices for this client
    if (clientId) {
      fetchClientInvoices(clientId);
    } else {
      setInvoices([]);
    }
  };

  const handleInvoiceChange = (invoiceId) => {
    // Find the selected invoice
    const selectedInvoice = invoices.find((inv) => inv._id === invoiceId);
    if (selectedInvoice) {
      // Calculate pending amount (total - credit)
      const pendingAmount = selectedInvoice.total - (selectedInvoice.credit || 0);

      // Auto-fill the amount
      form.setFieldValue('amount', pendingAmount);
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
                  onChange={handleClientChange}
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

      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.partyType !== currentValues.partyType || prevValues.client !== currentValues.client}>
        {({ getFieldValue }) => {
          const currentPartyType = getFieldValue('partyType') || 'client';
          const currentClient = getFieldValue('client');

          // Only show invoice dropdown if party type is client and a client is selected
          if (currentPartyType === 'client' && currentClient) {
            return (
              <Form.Item
                label={translate('invoice')}
                name="invoice"
                help={translate('Select an invoice to auto-fill amount (optional)')}
              >
                <Select
                  loading={loadingInvoices}
                  disabled={loadingInvoices}
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  placeholder={translate('Select Invoice (Optional)')}
                  onChange={handleInvoiceChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {invoices.map((invoice) => {
                    const pendingAmount = invoice.total - (invoice.credit || 0);
                    return (
                      <Select.Option key={invoice._id} value={invoice._id}>
                        Invoice #{invoice.number} - {money.currency_symbol}
                        {pendingAmount.toFixed(2)} pending
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            );
          }
          return null;
        }}
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
