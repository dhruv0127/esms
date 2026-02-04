import { Row, Col, Descriptions, Statistic, Tag, Divider, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { generate as uniqueId } from 'shortid';
import { selectCurrentItem } from '@/redux/erp/selectors';
import { useMoney, useDate } from '@/settings';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function ReadReturnExchangeItem({ config, selectedItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const navigate = useNavigate();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { result: currentResult } = useSelector(selectCurrentItem);

  const currentErp = currentResult || selectedItem;

  return (
    <>
      <PageHeader
        onBack={() => navigate(`/${entity.toLowerCase()}`)}
        title={`${ENTITY_NAME} # ${currentErp.number}/${currentErp.year}`}
        ghost={false}
        tags={[
          <span key="type">{translate(currentErp.type || 'return')}</span>,
          <span key="status">{translate(currentErp.status || 'pending')}</span>,
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`)}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      >
        <Row>
          <Statistic title={translate('Type')} value={translate(currentErp.type || 'return')} />
          <Statistic
            title={translate('Returned Item Total')}
            value={moneyFormatter({
              amount: currentErp.returnedItem?.total || 0,
              currency_code: currentErp.currency,
            })}
            style={{ margin: '0 32px' }}
          />
          {currentErp.type === 'exchange' && (
            <>
              <Statistic
                title={translate('Exchanged Item Total')}
                value={moneyFormatter({
                  amount: currentErp.exchangedItem?.total || 0,
                  currency_code: currentErp.currency,
                })}
                style={{ margin: '0 32px' }}
              />
              <Statistic
                title={translate('Price Difference')}
                value={moneyFormatter({
                  amount: Math.abs(currentErp.priceDifference || 0),
                  currency_code: currentErp.currency,
                })}
                prefix={currentErp.priceDifference > 0 ? '+' : currentErp.priceDifference < 0 ? '-' : ''}
                style={{ margin: '0 32px' }}
              />
            </>
          )}
        </Row>
      </PageHeader>
      <Divider dashed />
      <Descriptions title={`${translate('Customer')} : ${currentErp.customer?.name || ''}`}>
        <Descriptions.Item label={translate('Address')}>
          {currentErp.customer?.address}
        </Descriptions.Item>
        <Descriptions.Item label={translate('email')}>
          {currentErp.customer?.email}
        </Descriptions.Item>
        <Descriptions.Item label={translate('Phone')}>
          {currentErp.customer?.phone}
        </Descriptions.Item>
      </Descriptions>
      <Divider />

      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={11}>
          <p>
            <strong>{translate('Product')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p style={{ textAlign: 'right' }}>
            <strong>{translate('Price')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p style={{ textAlign: 'right' }}>
            <strong>{translate('Quantity')}</strong>
          </p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p style={{ textAlign: 'right' }}>
            <strong>{translate('Total')}</strong>
          </p>
        </Col>
        <Divider />
      </Row>

      {/* Returned Item */}
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={11}>
          <p style={{ marginBottom: 5 }}>
            <strong>{currentErp.returnedItem?.itemName}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#888' }}>
            {translate('Returned Item')}
          </p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p style={{ textAlign: 'right' }}>
            {moneyFormatter({
              amount: currentErp.returnedItem?.price || 0,
              currency_code: currentErp.currency,
            })}
          </p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p style={{ textAlign: 'right' }}>{currentErp.returnedItem?.quantity}</p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p style={{ textAlign: 'right', fontWeight: '700' }}>
            {moneyFormatter({
              amount: currentErp.returnedItem?.total || 0,
              currency_code: currentErp.currency,
            })}
          </p>
        </Col>
        <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
      </Row>

      {/* Exchanged Item */}
      {currentErp.type === 'exchange' && currentErp.exchangedItem && (
        <Row gutter={[12, 0]}>
          <Col className="gutter-row" span={11}>
            <p style={{ marginBottom: 5 }}>
              <strong>{currentErp.exchangedItem?.itemName}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>
              {translate('Exchanged Item')}
            </p>
          </Col>
          <Col className="gutter-row" span={4}>
            <p style={{ textAlign: 'right' }}>
              {moneyFormatter({
                amount: currentErp.exchangedItem?.price || 0,
                currency_code: currentErp.currency,
              })}
            </p>
          </Col>
          <Col className="gutter-row" span={4}>
            <p style={{ textAlign: 'right' }}>{currentErp.exchangedItem?.quantity}</p>
          </Col>
          <Col className="gutter-row" span={5}>
            <p style={{ textAlign: 'right', fontWeight: '700' }}>
              {moneyFormatter({
                amount: currentErp.exchangedItem?.total || 0,
                currency_code: currentErp.currency,
              })}
            </p>
          </Col>
          <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
        </Row>
      )}

      {/* Totals Section (similar to invoice) */}
      <div style={{ width: '300px', float: 'right', textAlign: 'right', fontWeight: '700' }}>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={12}>
            <p>{translate('Returned Total')} :</p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>
              {moneyFormatter({
                amount: currentErp.returnedItem?.total || 0,
                currency_code: currentErp.currency,
              })}
            </p>
          </Col>

          {currentErp.type === 'exchange' && (
            <>
              <Col className="gutter-row" span={12}>
                <p>{translate('Exchanged Total')} :</p>
              </Col>
              <Col className="gutter-row" span={12}>
                <p>
                  {moneyFormatter({
                    amount: currentErp.exchangedItem?.total || 0,
                    currency_code: currentErp.currency,
                  })}
                </p>
              </Col>

              <Col className="gutter-row" span={12}>
                <p>{translate('Difference')} :</p>
              </Col>
              <Col className="gutter-row" span={12}>
                <p
                  style={{
                    color: currentErp.priceDifference > 0 ? '#cf1322' : currentErp.priceDifference < 0 ? '#3f8600' : '#000',
                  }}
                >
                  {currentErp.priceDifference > 0 ? '+' : ''}
                  {moneyFormatter({
                    amount: currentErp.priceDifference || 0,
                    currency_code: currentErp.currency,
                  })}
                </p>
              </Col>
            </>
          )}
        </Row>
      </div>

      <div style={{ clear: 'both' }} />

      {currentErp.reason && (
        <>
          <Divider />
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Descriptions title={translate('Reason')} column={1} bordered>
                <Descriptions.Item>{currentErp.reason}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </>
      )}

      {currentErp.notes && (
        <>
          <Divider />
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Descriptions title={translate('Notes')} column={1} bordered>
                <Descriptions.Item>{currentErp.notes}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
