import { useState, useEffect, useRef } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function SelectInventoryItem({
  value,
  onChange,
  withRedirect = true,
  urlToRedirect = '/inventory',
}) {
  const translate = useLanguage();
  const entity = 'inventory';
  const redirectLabel = 'Add New Inventory';

  const addNewValue = { value: 'redirectURL', label: `+ ${translate(redirectLabel)}` };

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const navigate = useNavigate();

  const handleSelectChange = (newValue, option) => {
    isUpdating.current = false;

    if (newValue === 'redirectURL' && withRedirect) {
      navigate(urlToRedirect);
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

  return (
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
          {item.product} - ${item.unitPrice}
        </Select.Option>
      ))}
      {withRedirect && <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>}
    </Select>
  );
}
