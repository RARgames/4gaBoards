import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import DeletePopup from '../../DeletePopup';
import { Button, ButtonStyle, Checkbox, CheckboxSize } from '../../Utils';

import * as bs from '../../../backgrounds.module.scss';
import * as s from './CalendarSettings.module.scss';

const ERROR_STATUS = 'error';

const LinkedCalendarRow = React.memo(({ linkedCalendar, projectName, onToggle, onDelete }) => {
  const [t] = useTranslation();

  return (
    <div className={s.linked}>
      <span className={clsx(s.swatch, s.swatchStatic, bs[`background${upperFirst(camelCase(linkedCalendar.color))}`])} />
      <div className={s.linkedText}>
        <div className={s.linkedName}>{linkedCalendar.name}</div>
        {linkedCalendar.status === ERROR_STATUS ? (
          <div className={s.linkedError}>{linkedCalendar.lastError || t('common.calendarFeedUnreadable')}</div>
        ) : (
          <div className={s.linkedMeta}>
            {t(linkedCalendar.provider === 'ical' ? 'common.icalFeed' : 'common.googleCalendar')}
            {' · '}
            {projectName || t('common.allProjects')}
          </div>
        )}
      </div>
      <Checkbox
        size={CheckboxSize.Size14}
        checked={linkedCalendar.isEnabled}
        title={linkedCalendar.isEnabled ? t('common.calendarShown') : t('common.calendarHidden')}
        onChange={() => onToggle(linkedCalendar.id, !linkedCalendar.isEnabled)}
      />
      <DeletePopup
        title={t('common.removeCalendar', { context: 'title' })}
        content={t('common.areYouSureYouWantToRemoveThisCalendar')}
        buttonContent={t('action.removeCalendar')}
        onConfirm={() => onDelete(linkedCalendar.id)}
      >
        <Button style={ButtonStyle.Cancel} content={t('action.remove')} />
      </DeletePopup>
    </div>
  );
});

LinkedCalendarRow.propTypes = {
  linkedCalendar: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  projectName: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

LinkedCalendarRow.defaultProps = {
  projectName: undefined,
};

export default LinkedCalendarRow;
