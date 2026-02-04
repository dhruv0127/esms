import useLanguage from '@/locale/useLanguage';
import CreateReturnExchangeModule from '@/modules/ReturnExchangeModule/CreateReturnExchangeModule';

export default function ReturnExchangeCreate() {
  const translate = useLanguage();
  const entity = 'returnexchange';

  const Labels = {
    PANEL_TITLE: translate('return_exchange'),
    DATATABLE_TITLE: translate('return_exchange_list'),
    ADD_NEW_ENTITY: translate('add_new_return_exchange'),
    ENTITY_NAME: translate('return_exchange'),
    CREATE_ENTITY: translate('create_return_exchange'),
  };

  const config = {
    entity,
    ...Labels,
  };

  return <CreateReturnExchangeModule config={config} />;
}
