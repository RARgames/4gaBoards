import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import api from '../../../api';
import { Button, ButtonStyle, Loader, LoaderSize } from '../../Utils';

import * as s from './CalendarSettings.module.scss';

// Lists what a connected Google account can see, so the admin picks calendars instead of pasting
// ids. Loaded on demand rather than with the page: it costs a round trip to Google, and most
// visits to this page are not about adding a calendar.
const ConnectionCalendarPicker = React.memo(({ connectionId, headers, linkedExternalIds, onAdd, onError }) => {
  const [t] = useTranslation();

  const [calendars, setCalendars] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowse = useCallback(async () => {
    setIsLoading(true);

    try {
      const { items } = await api.getConnectionCalendars(connectionId, headers);
      setCalendars(items);
    } catch {
      onError(t('common.calendarListFailed'));
    }

    setIsLoading(false);
  }, [connectionId, headers, onError, t]);

  if (isLoading) {
    return <Loader size={LoaderSize.Small} />;
  }

  if (calendars === null) {
    return <Button style={ButtonStyle.DefaultBorder} content={t('action.browseCalendars')} onClick={handleBrowse} />;
  }

  if (calendars.length === 0) {
    return <p className={s.empty}>{t('common.noCalendarsInAccount')}</p>;
  }

  return (
    <div className={s.pickerList}>
      {calendars.map((calendar) => {
        const isLinked = linkedExternalIds.includes(calendar.externalId);

        return (
          <div key={calendar.externalId} className={s.pickerRow}>
            <span className={s.pickerName} title={calendar.externalId}>
              {calendar.name}
            </span>
            <Button
              style={ButtonStyle.DefaultBorder}
              content={isLinked ? t('common.added') : t('action.add')}
              disabled={isLinked}
              onClick={() => onAdd({ connectionId, externalId: calendar.externalId, name: calendar.name })}
            />
          </div>
        );
      })}
    </div>
  );
});

ConnectionCalendarPicker.propTypes = {
  connectionId: PropTypes.string.isRequired,
  headers: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  linkedExternalIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default ConnectionCalendarPicker;
