import useLanguage from '@/locale/useLanguage';
import UpdatePurchaseModule from '@/modules/PurchaseModule/UpdatePurchaseModule';

export default function PurchaseUpdate() {
  const translate = useLanguage();
  const entity = 'purchase';

  const Labels = {
    PANEL_TITLE: translate('purchase'),
    DATATABLE_TITLE: translate('purchase_list'),
    ADD_NEW_ENTITY: translate('add_new_purchase'),
    ENTITY_NAME: translate('purchase'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <UpdatePurchaseModule config={configPage} />;
}
