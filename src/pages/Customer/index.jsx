import { useNavigate } from 'react-router-dom';
import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Customer() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const entity = 'client';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('client'),
    DATATABLE_TITLE: translate('client_list'),
    ADD_NEW_ENTITY: translate('add_new_client'),
    ENTITY_NAME: translate('client'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
    // Override the default read action to navigate to detail page
    onRead: (record) => {
      navigate(`/customer/${record._id}`);
    },
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
