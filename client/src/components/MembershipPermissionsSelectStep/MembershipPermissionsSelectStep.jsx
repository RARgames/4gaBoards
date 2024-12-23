import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ButtonStyle, Popup, Form, Radio, RadioSize } from '../Utils';

import { BoardMembershipRoles } from '../../constants/Enums';

import * as s from './MembershipPermissionsSelectStep.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const MembershipPermissionsSelectStep = React.memo(({ defaultData, title, buttonContent, onSelect, onBack, onClose }) => {
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

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        case 'Escape': {
          onClose();
          break;
        }
        default:
      }
    },
    [handleSubmit, onClose],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onKeyDown={handleKeyDown}>
          <Button style={ButtonStyle.Popup} onClick={() => handleSelectRoleClick(BoardMembershipRoles.EDITOR)} className={classNames(data.role === BoardMembershipRoles.EDITOR && s.selected)}>
            <div className={s.menuItemTitle}>{t('common.editor')}</div>
            <div className={s.menuItemDescription}>{t('common.canEditContentOfBoard')}</div>
          </Button>
          <Button
            style={ButtonStyle.Popup}
            onClick={() => handleSelectRoleClick(BoardMembershipRoles.VIEWER)}
            className={classNames(data.role === BoardMembershipRoles.VIEWER && s.selected, data.role !== BoardMembershipRoles.VIEWER && s.last)}
          >
            <div className={s.menuItemTitle}>{t('common.viewer')}</div>
            <div className={s.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
          </Button>
          {data.role === BoardMembershipRoles.VIEWER && (
            <div className={s.commentSettings}>
              <Radio size={RadioSize.Size12} name="canComment" checked={data.canComment} onChange={handleSettingChange} className={s.commentSettingsRadio} />
              <div className={classNames(s.commentSettingsText, s.last)}>{t('common.canComment')}</div>
            </div>
          )}
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t(buttonContent)} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

MembershipPermissionsSelectStep.propTypes = {
  defaultData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

MembershipPermissionsSelectStep.defaultProps = {
  defaultData: undefined,
  title: 'common.selectPermissions',
  buttonContent: 'action.selectPermissions',
};

export default MembershipPermissionsSelectStep;
