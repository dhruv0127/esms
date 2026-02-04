import { ErpContextProvider } from '@/context/erp';

import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import useResponsive from '@/hooks/useResponsive';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  const { isMobile } = useResponsive();

  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin: isMobile ? '16px auto' : '30px auto',
          width: '100%',
          maxWidth: isMobile ? '100%' : '1100px',
          minHeight: isMobile ? '400px' : '600px',
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}
