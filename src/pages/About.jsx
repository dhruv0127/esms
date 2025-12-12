import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'Kreddo'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <p>
            Website : <a href="https://www.thekreddo.com">www.thekreddo.com</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="https://github.com/dhruv0127/esms">
              https://github.com/dhruv0127/esms
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://www.thekreddo.com/contact-us/`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
