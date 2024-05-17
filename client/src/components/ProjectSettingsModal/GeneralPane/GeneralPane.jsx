import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Divider, Header, Tab } from 'semantic-ui-react';
import { ButtonTmp, ButtonStyle } from '../../Utils/Button';

import InformationEdit from './InformationEdit';
import DeletePopup from '../../DeletePopup';

import styles from './GeneralPane.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const GeneralPane = React.memo(({ name, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <InformationEdit
        defaultData={{
          name,
        }}
        onUpdate={onUpdate}
      />
      <Divider horizontal section>
        <Header as="h4">{t('common.dangerZone', { context: 'title' })}</Header>
      </Divider>
      <div className={styles.action}>
        <DeletePopup title={t('common.deleteProject', { context: 'title' })} content={t('common.areYouSureYouWantToDeleteThisProject')} buttonContent={t('action.deleteProject')} onConfirm={onDelete}>
          <div className={gStyles.controlsCenter}>
            <ButtonTmp style={ButtonStyle.Cancel} content={t('action.deleteProject', { context: 'title' })} />
          </div>
        </DeletePopup>
      </div>
    </Tab.Pane>
  );
});

GeneralPane.propTypes = {
  name: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GeneralPane;
