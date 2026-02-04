import './style/app.css';

import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import { isMobileDevice } from '@/utils/deviceDetection';

const KreddoOs = lazy(() => import('./apps/KreddoOs'));

export default function RoutApp() {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if device is mobile
    const checkDevice = () => {
      setIsMobile(isMobileDevice());
      setIsChecking(false);
    };

    checkDevice();

    // Recheck on window resize
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show loader while checking device type
  if (isChecking) {
    return <PageLoader />;
  }

  // Show maintenance screen for mobile devices
  if (isMobile) {
    return <MaintenanceScreen />;
  }

  return (
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <KreddoOs />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
