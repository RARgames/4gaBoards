import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { dequal } from 'dequal';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';

import { BoardMembershipRoles } from '../../constants/Enums';
import { Button, ButtonStyle, Popup, Form, Radio, RadioSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './MembershipPermissionsSelectStep.module.scss';

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

  const handleSettingChange = useCallback((e) => {
    const { name, checked } = e.target;
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
    (e) => {
      switch (e.key) {
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
      <Popup.Content isMinContent>
        <Form onKeyDown={handleKeyDown}>
          <Button style={ButtonStyle.Popup} onClick={() => handleSelectRoleClick(BoardMembershipRoles.EDITOR)} className={clsx(data.role === BoardMembershipRoles.EDITOR && s.selected)}>
            <div className={s.menuItemTitle}>{t('common.editor')}</div>
            <div className={s.menuItemDescription}>{t('common.canEditContentOfBoard')}</div>
          </Button>
          <Button
            style={ButtonStyle.Popup}
            onClick={() => handleSelectRoleClick(BoardMembershipRoles.VIEWER)}
            className={clsx(data.role === BoardMembershipRoles.VIEWER && s.selected, data.role !== BoardMembershipRoles.VIEWER && s.last)}
          >
            <div className={s.menuItemTitle}>{t('common.viewer')}</div>
            <div className={s.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
          </Button>
          {data.role === BoardMembershipRoles.VIEWER && (
            <div className={s.commentSettings}>
              <Radio size={RadioSize.Size12} name="canComment" checked={data.canComment} onChange={handleSettingChange} className={s.commentSettingsRadio} />
              <div className={clsx(s.commentSettingsText, s.last)}>{t('common.canComment')}</div>
            </div>
          )}
          <div className={gs.controls}>
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
