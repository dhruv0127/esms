import React from 'react';

import { Layout } from 'antd';
import { Divider, Row, Col } from 'antd';
import useResponsive from '@/hooks/useResponsive';

const { Content } = Layout;

const TopCard = ({ title, cardContent }) => {
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
        <h2 style={{ color: '#22075e', marginBottom: 0, marginTop: 0 }}>{title}</h2>
      </div>
      {/* <Divider style={{ padding: 0, margin: 0 }}></Divider>
      <div className="pad15" style={{ textAlign: 'center', justifyContent: 'center' }}>
        {cardContent}
      </div> */}
    </div>
  );
};

export default function SettingsLayout({
  children,
  topCardTitle,
  topCardContent,
  bottomCardContent,
}) {
  const { isMobile } = useResponsive();

  return (
    <Layout className="site-layout">
      <Content
        style={{
          padding: isMobile ? '16px 12px' : '30px 40px',
          margin: '0px auto',
          width: '100%',
          maxWidth: isMobile ? '100%' : '1100px',
        }}
      >
        <Row gutter={isMobile ? [12, 12] : [24, 24]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 17 }}
            lg={{ span: 18 }}
          >
            <div className="whiteBox shadow" style={{ minHeight: isMobile ? '300px' : '480px', maxWidth: isMobile ? '100%' : '800px' }}>
              <Row className={isMobile ? 'pad15' : 'pad40'} gutter={[0, 0]}>
                <Col span={24}>{children}</Col>
              </Row>
            </div>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 7 }}
            lg={{ span: 6 }}
          >
            <TopCard title={topCardTitle} cardContent={topCardContent} />
            <div className="whiteBox shadow" style={{ minHeight: isMobile ? '150px' : '280px' }}>
              <Row gutter={[0, 0]}>{bottomCardContent}</Row>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
