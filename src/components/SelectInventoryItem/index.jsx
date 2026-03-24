import { useState, useEffect, useRef } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';

import { Select, Empty, Modal, Form, Input, InputNumber, Button } from 'antd';
import useLanguage from '@/locale/useLanguage';

function AddInventoryModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const result = await request.create({ entity: 'inventory', jsonData: values });
      if (result && result.success) {
        form.resetFields();
        onCreated(result.result);
      }
    } catch (_) {
      // validation or request error — do nothing, antd shows field errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Inventory Item"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Add Item
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Item Code" name="itemCode">
          <Input placeholder="e.g. GM001" />
        </Form.Item>
        <Form.Item
          label="Product"
          name="product"
          rules={[{ required: true, message: 'Please input Product name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: 'Please input Quantity!', type: 'number', min: 0 }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          label="Unit Price"
          name="unitPrice"
          rules={[{ required: true, message: 'Please input Unit Price!', type: 'number', min: 0 }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `$ ${value}`}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function SelectInventoryItem({
  value,
  onChange,
  withRedirect = false,
  urlToRedirect = '/inventory',
}) {
  const translate = useLanguage();
  const entity = 'inventory';

  const addNewValue = { value: 'addNewModal', label: `+ ${translate('Add New Inventory')}` };

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const handleSelectChange = (newValue, option) => {
    isUpdating.current = false;

    if (newValue === 'addNewModal') {
      setModalOpen(true);
      return;
    }

    // Find the full object from selectOptions
    const selectedItem = selectOptions.find(item => item._id === newValue);

    if (onChange) {
      if (selectedItem) {
        // Pass the full item object to parent
        onChange(selectedItem);
      } else {
        // Item was cleared
        onChange(null);
      }
    }
    setCurrentValue(newValue);
  };

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  useEffect(() => {
    const options = {
      q: debouncedValue,
      fields: 'product',
    };
    const callback = asyncSearch(options);
    onFetch(callback);

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    isSearching.current = true;
    setSearching(true);
    setValToSearch(searchText);
  };

  useEffect(() => {
    if (isSuccess) {
      setOptions(result);
    } else {
      setSearching(false);
    }
  }, [isSuccess, result]);

  useEffect(() => {
    // this for update Form , it's for setField
    if (value && isUpdating.current) {
      setOptions([value]);
      setCurrentValue(value._id);
      isUpdating.current = false;
    }
  }, [value]);

  const handleItemCreated = (newItem) => {
    setOptions((prev) => [newItem, ...prev]);
    setCurrentValue(newItem._id);
    if (onChange) {
      onChange(newItem);
    }
    setModalOpen(false);
  };

  return (
    <>
      <Select
        loading={isLoading}
        showSearch
        allowClear
        placeholder={translate('Search Inventory Item')}
        defaultActiveFirstOption={false}
        filterOption={false}
        notFoundContent={searching ? '... Searching' : <Empty />}
        value={currentValue}
        onSearch={onSearch}
        onClear={() => {
          setSearching(false);
          setCurrentValue(undefined);
          if (onChange) {
            onChange(null);
          }
        }}
        onChange={handleSelectChange}
        style={{ width: '100%' }}
      >
        {selectOptions.map((item) => (
          <Select.Option key={item._id} value={item._id}>
            {item.itemCode ? `[${item.itemCode}] ` : ''}{item.product} - ${item.unitPrice}
          </Select.Option>
        ))}
        <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>
      </Select>
      <AddInventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleItemCreated}
      />
    </>
  );
}
