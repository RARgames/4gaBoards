import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../../Button';
import { Icon, IconType, IconSize } from '../../Icon';
import ActionsPopup from './ActionsPopup';

import * as s from './ActionsHeader.module.scss';

const ActionsHeader = React.memo(({ table, onResetColumnSorting, onResetColumnWidths, onResetColumnVisibility, onUserPrefsUpdate }) => {
  const [t] = useTranslation();

  return (
    <ActionsPopup
      table={table}
      onResetColumnWidths={onResetColumnWidths}
      onResetColumnSorting={onResetColumnSorting}
      onResetColumnVisibility={onResetColumnVisibility}
      onUserPrefsUpdate={onUserPrefsUpdate}
      position="left-start"
      offset={0}
      hideCloseButton
    >
      <Button style={ButtonStyle.Icon} title={t('common.editListView')} className={s.tableSettingsButton}>
        <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} className={s.iconTableSettingsButton} />
      </Button>
    </ActionsPopup>
  );
});

ActionsHeader.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

export default ActionsHeader;
