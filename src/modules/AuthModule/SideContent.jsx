import { Space, Layout, Divider, Typography } from 'antd';
// import logo from '@/assets/images/kreddo-logo.png';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <div
          style={{ margin: '0 0 40px', display: 'block' }}
        >
          <span style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1890ff',
            letterSpacing: '1px',
          }}>
            Kreddo
          </span>
        </div>

        <Title level={1} style={{ fontSize: 28 }}>
          Free Open Source ERP / CRM
        </Title>
        <Text>
          Accounting / Invoicing / Quote App <b /> based on Node.js React.js Ant Design
        </Text>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
