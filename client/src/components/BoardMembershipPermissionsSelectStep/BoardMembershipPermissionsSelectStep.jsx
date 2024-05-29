import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ButtonStyle, Popup, Form, Radio, RadioSize } from '../Utils';

import { BoardMembershipRoles } from '../../constants/Enums';

import styles from './BoardMembershipPermissionsSelectStep.module.scss';
import gStyles from '../../globalStyles.module.scss';

const BoardMembershipPermissionsSelectStep = React.memo(({ defaultData, title, buttonContent, onSelect, onBack, onClose }) => {
  const [t] = useTranslation();

  const [data, setData] = useState(() => ({
    role: BoardMembershipRoles.EDITOR,
    canComment: null,
    ...defaultData,
  }));

  const handleSelectRoleClick = useCallback((role) => {
    setData((prevData) => ({
      ...prevData,
      role,
      canComment: role === BoardMembershipRoles.VIEWER ? !!prevData.canComment : null,
    }));
  }, []);

  const handleSettingChange = useCallback((event) => {
    const { name, checked } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!dequal(data, defaultData)) {
      onSelect(data.role === BoardMembershipRoles.VIEWER ? data : omit(data, 'canComment'));
    }

    onClose();
  }, [defaultData, onSelect, onClose, data]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Button style={ButtonStyle.Popup} onClick={() => handleSelectRoleClick(BoardMembershipRoles.EDITOR)} className={classNames(data.role === BoardMembershipRoles.EDITOR && styles.selected)}>
            <div className={styles.menuItemTitle}>{t('common.editor')}</div>
            <div className={styles.menuItemDescription}>{t('common.canEditContentOfBoard')}</div>
          </Button>
          <Button style={ButtonStyle.Popup} onClick={() => handleSelectRoleClick(BoardMembershipRoles.VIEWER)} className={classNames(data.role === BoardMembershipRoles.VIEWER && styles.selected)}>
            <div className={styles.menuItemTitle}>{t('common.viewer')}</div>
            <div className={styles.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
          </Button>
          {data.role === BoardMembershipRoles.VIEWER && (
            <div className={styles.commentSettings}>
              <Radio size={RadioSize.Size12} name="canComment" checked={data.canComment} onChange={handleSettingChange} className={styles.commentSettingsRadio} />
              <div className={styles.commentSettingsText}>{t('common.canComment')}</div>
            </div>
          )}
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t(buttonContent)} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

BoardMembershipPermissionsSelectStep.propTypes = {
  defaultData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

BoardMembershipPermissionsSelectStep.defaultProps = {
  defaultData: undefined,
  title: 'common.selectPermissions',
  buttonContent: 'action.selectPermissions',
};

export default BoardMembershipPermissionsSelectStep;
