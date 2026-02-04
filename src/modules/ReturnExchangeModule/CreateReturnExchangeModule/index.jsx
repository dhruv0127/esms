import { useState, useEffect } from 'react';
import { Button, Tag, Form } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { settingsAction } from '@/redux/settings/actions';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import { ArrowLeftOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ErpLayout } from '@/layout';
import ReturnExchangeForm from '@/forms/ReturnExchangeForm';

function SaveForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

export default function CreateReturnExchangeModule({ config }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);

  let { entity } = config;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      navigate(`/${entity.toLowerCase()}/read/${result._id}`);
    }
    return () => {};
  }, [isSuccess]);

  const onSubmit = (fieldsValue) => {
    if (fieldsValue) {
      // Calculate returnedItem total
      if (fieldsValue.returnedItem && fieldsValue.returnedItem.quantity && fieldsValue.returnedItem.price) {
        fieldsValue.returnedItem.total = calculate.multiply(
          fieldsValue.returnedItem.quantity,
          fieldsValue.returnedItem.price
        );
      }

      // Calculate exchangedItem total
      if (fieldsValue.exchangedItem && fieldsValue.exchangedItem.quantity && fieldsValue.exchangedItem.price) {
        fieldsValue.exchangedItem.total = calculate.multiply(
          fieldsValue.exchangedItem.quantity,
          fieldsValue.exchangedItem.price
        );
      }

      // Calculate price difference if exchange
      if (fieldsValue.type === 'exchange') {
        const returnedTotal = fieldsValue.returnedItem?.total || 0;
        const exchangedTotal = fieldsValue.exchangedItem?.total || 0;
        fieldsValue.priceDifference = calculate.subtract(exchangedTotal, returnedTotal);
      }
    }

    dispatch(erp.create({ entity, jsonData: fieldsValue }));
  };

  return (
    <ErpLayout>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <ReturnExchangeForm current={null} />
      </Form>
    </ErpLayout>
  );
}
