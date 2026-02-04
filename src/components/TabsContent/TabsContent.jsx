import { Tabs, Row, Col } from 'antd';
import useResponsive from '@/hooks/useResponsive';

const SettingsLayout = ({ children }) => {
  const { isMobile } = useResponsive();

  return (
    <Col className="gutter-row" order={0}>
      <div className="whiteBox shadow" style={{ minHeight: isMobile ? '300px' : '480px' }}>
        <div className={isMobile ? 'pad15' : 'pad40'}>{children}</div>
      </div>
    </Col>
  );
};

const TopCard = ({ pageTitle }) => {
  const { isMobile } = useResponsive();

  return (
    <div
      className="whiteBox shadow"
      style={{
        color: '#595959',
        fontSize: isMobile ? 12 : 13,
        height: isMobile ? '50px' : '70px',
        minHeight: 'auto',
        marginBottom: isMobile ? '12px' : '24px',
      }}
    >
      <div className={isMobile ? 'pad10 strong' : 'pad20 strong'} style={{ textAlign: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#22075e', marginBottom: 0, marginTop: 0 }}>{pageTitle}</h2>
      </div>
    </div>
  );
};

const RightMenu = ({ children, pageTitle }) => {
  const { isMobile } = useResponsive();

  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 24 }}
      md={{ span: 7 }}
      lg={{ span: 6 }}
      order={1}
    >
      <TopCard pageTitle={pageTitle} />
      <div className="whiteBox shadow">
        <div className={isMobile ? 'pad15' : 'pad25'} style={{ width: '100%', paddingBottom: 0 }}>
          {children}
        </div>
      </div>
    </Col>
  );
};

export default function TabsContent({ content, defaultActiveKey, pageTitle }) {
  const { isMobile } = useResponsive();

  const items = content.map((item, index) => {
    return {
      key: item.key ? item.key : index + '_' + item.label.replace(/ /g, '_'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {item.icon} <span style={{ paddingRight: isMobile ? 10 : 30 }}>{item.label}</span>
        </div>
      ),
      children: <SettingsLayout>{item.children}</SettingsLayout>,
    };
  });

  const renderTabBar = (props, DefaultTabBar) => (
    <RightMenu pageTitle={pageTitle}>
      <DefaultTabBar {...props} />
    </RightMenu>
  );

  return (
    <Row gutter={isMobile ? [12, 12] : [24, 24]} className="tabContent">
      <Tabs
        tabPosition={isMobile ? 'top' : 'right'}
        defaultActiveKey={defaultActiveKey}
        hideAdd={true}
        items={items}
        renderTabBar={isMobile ? undefined : renderTabBar}
      />
    </Row>
  );
}
