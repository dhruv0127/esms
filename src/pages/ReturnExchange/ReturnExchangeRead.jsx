import useLanguage from '@/locale/useLanguage';
import ReadReturnExchangeModule from '@/modules/ReturnExchangeModule/ReadReturnExchangeModule';

export default function ReturnExchangeRead() {
  const translate = useLanguage();
  const entity = 'returnexchange';

  const Labels = {
    PANEL_TITLE: translate('return_exchange'),
    DATATABLE_TITLE: translate('return_exchange_list'),
    ADD_NEW_ENTITY: translate('add_new_return_exchange'),
    ENTITY_NAME: translate('return_exchange'),
    ENTITY_NAME_LOWERCASE: translate('return_exchange'),
  };

  const config = {
    entity,
    ...Labels,
  };

  return <ReadReturnExchangeModule config={config} />;
}
