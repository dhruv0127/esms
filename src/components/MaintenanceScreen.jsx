import { Result } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

export default function MaintenanceScreen() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      <Result
        icon={<ToolOutlined style={{ fontSize: '72px', color: '#1890ff' }} />}
        title="Under Review"
        subTitle="Our mobile application is currently under review. We will be back within 24 hours. Please access the application from a desktop browser in the meantime."
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '600px',
        }}
      />
    </div>
  );
}
