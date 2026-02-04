import useLanguage from '@/locale/useLanguage';
import UpdateReturnExchangeModule from '@/modules/ReturnExchangeModule/UpdateReturnExchangeModule';

export default function ReturnExchangeUpdate() {
  const translate = useLanguage();
  const entity = 'returnexchange';

  const Labels = {
    PANEL_TITLE: translate('return_exchange'),
    DATATABLE_TITLE: translate('return_exchange_list'),
    ADD_NEW_ENTITY: translate('add_new_return_exchange'),
    ENTITY_NAME: translate('return_exchange'),
    UPDATE_ENTITY: translate('update_return_exchange'),
  };

  const config = {
    entity,
    ...Labels,
  };

  return <UpdateReturnExchangeModule config={config} />;
}
