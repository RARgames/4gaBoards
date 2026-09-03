import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../../api';
import LabelColors from '../../../constants/LabelColors';
import Paths from '../../../constants/Paths';
import DeletePopup from '../../DeletePopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize, Message, MessageStyle } from '../../Utils';
import ConnectionCalendarPicker from './ConnectionCalendarPicker';
import IcalFeedForm from './IcalFeedForm';
import LinkedCalendarRow from './LinkedCalendarRow';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './CalendarSettings.module.scss';

const ERROR_STATUS = 'error';
const GOOGLE_PROVIDER = 'google';
const ICAL_PROVIDER = 'ical';

// Reads its own data rather than going through the store: connections and linked calendars are
// instance-wide admin configuration touched a handful of times ever, so there is nothing for the
// rest of the app to keep in sync and no reason to carry them in the ORM.
const CalendarSettings = React.memo(({ accessToken, projects }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [connections, setConnections] = useState(null);
  const [linkedCalendars, setLinkedCalendars] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const noticeRef = useRef(null);

  // These calls bypass the sagas, so they have to carry the token the saga request helper would
  // otherwise attach. Without it every request 401s and the page silently renders empty.
  const headers = useMemo(() => ({ Authorization: `Bearer ${accessToken}` }), [accessToken]);

  const projectNamesById = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project.name])), [projects]);
  const linkedExternalIds = useMemo(() => linkedCalendars.filter((item) => item.externalId).map((item) => item.externalId), [linkedCalendars]);

  // The OAuth flow returns as a plain redirect carrying its result in the query string. Lift it
  // into state once and strip it from the URL, so the banner survives that rewrite and a later
  // reload does not replay a stale success or failure.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const failed = params.get('error');

    if (connected) {
      setNotice({ isError: false, text: t('common.calendarAccountConnected', { email: connected }) });
    } else if (failed) {
      setNotice({ isError: true, text: t('common.calendarAuthorizationFailed', { reason: failed }) });
    }

    if (connected || failed) {
      navigate(Paths.SETTINGS_CALENDAR, { replace: true });
    }
  }, [navigate, t]);

  const fetchAll = useCallback(async () => {
    try {
      const [connectionsResult, linkedResult] = await Promise.all([api.getCalendarConnections(headers), api.getLinkedCalendars(headers)]);
      setConnections(connectionsResult.items);
      setIsAvailable(connectionsResult.available);
      setLinkedCalendars(linkedResult.items);
    } catch {
      setConnections([]);
      setNotice({ isError: true, text: t('common.calendarConnectionsFetchFailed') });
    }
  }, [headers, t]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (notice && noticeRef.current) {
      noticeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [notice]);

  const handleNoticeDismiss = useCallback(() => setNotice(null), []);
  const handleError = useCallback((text) => setNotice({ isError: true, text }), []);

  const handleConnect = useCallback(async () => {
    setNotice(null);
    setIsBusy(true);

    try {
      const { item } = await api.getCalendarAuthorizeUrl(headers);
      window.location.href = item.url;
    } catch {
      setIsBusy(false);
      setNotice({ isError: true, text: t('common.calendarConnectFailed') });
    }
  }, [headers, t]);

  const handleDisconnect = useCallback(
    async (id) => {
      try {
        await api.deleteCalendarConnection(id, headers);
        setConnections((prev) => prev.filter((connection) => connection.id !== id));
        // Its calendars go with it, so drop them rather than leaving rows that can never load.
        setLinkedCalendars((prev) => prev.filter((linked) => linked.connectionId !== id));
      } catch {
        setNotice({ isError: true, text: t('common.calendarDisconnectFailed') });
      }
    },
    [headers, t],
  );

  const createLinkedCalendar = useCallback(
    async (data) => {
      setIsBusy(true);

      try {
        const { item } = await api.createLinkedCalendar(data, headers);
        setLinkedCalendars((prev) => [...prev, item]);
        setNotice({ isError: false, text: t('common.calendarAdded', { name: item.name }) });
        return true;
      } catch (error) {
        setNotice({ isError: true, text: error?.message || t('common.calendarAddFailed') });
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [headers, t],
  );

  const handleIcalSubmit = useCallback((data) => createLinkedCalendar({ ...data, provider: ICAL_PROVIDER }), [createLinkedCalendar]);

  const handleGoogleAdd = useCallback(
    (data) => createLinkedCalendar({ ...data, provider: GOOGLE_PROVIDER, color: LabelColors[linkedCalendars.length % LabelColors.length], projectId: null }),
    [createLinkedCalendar, linkedCalendars.length],
  );

  const handleToggle = useCallback(
    async (id, isEnabled) => {
      try {
        const { item } = await api.updateLinkedCalendar(id, { isEnabled }, headers);
        setLinkedCalendars((prev) => prev.map((linked) => (linked.id === id ? item : linked)));
      } catch {
        setNotice({ isError: true, text: t('common.calendarUpdateFailed') });
      }
    },
    [headers, t],
  );

  const handleLinkedDelete = useCallback(
    async (id) => {
      try {
        await api.deleteLinkedCalendar(id, headers);
        setLinkedCalendars((prev) => prev.filter((linked) => linked.id !== id));
      } catch {
        setNotice({ isError: true, text: t('common.calendarRemoveFailed') });
      }
    },
    [headers, t],
  );

  const renderConnection = (connection) => (
    <div key={connection.id} className={s.connection}>
      <div className={s.connectionHeader}>
        <Icon type={IconType.Google} size={IconSize.Size16} className={s.connectionIcon} />
        <div className={s.connectionText}>
          <div className={s.connectionEmail}>{connection.accountEmail}</div>
          {connection.status === ERROR_STATUS ? (
            <div className={s.connectionError}>{connection.lastError || t('common.calendarConnectionNeedsReauthorization')}</div>
          ) : (
            <div className={s.connectionMeta}>{t('common.calendarConnectedOn', { date: format(new Date(connection.createdAt), 'PP') })}</div>
          )}
        </div>
        <DeletePopup
          title={t('common.disconnectCalendarAccount', { context: 'title' })}
          content={t('common.areYouSureYouWantToDisconnectThisCalendarAccount')}
          buttonContent={t('action.disconnectAccount')}
          onConfirm={() => handleDisconnect(connection.id)}
        >
          <Button style={ButtonStyle.Cancel} content={t('action.disconnectAccount')} />
        </DeletePopup>
      </div>
      {connection.status !== ERROR_STATUS && <ConnectionCalendarPicker connectionId={connection.id} headers={headers} linkedExternalIds={linkedExternalIds} onAdd={handleGoogleAdd} onError={handleError} />}
    </div>
  );

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.settingsCalendar')}</h2>
      </div>
      <div className={s.content}>
        <p className={s.description}>{t('common.calendarSettingsDescription')}</p>

        <div ref={noticeRef}>
          {notice &&
            (notice.isError ? (
              <Message style={MessageStyle.Error} content={notice.text} onDismiss={handleNoticeDismiss} />
            ) : (
              <div className={s.success}>
                {notice.text}
                <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleNoticeDismiss} className={s.successClose}>
                  <Icon type={IconType.Close} size={IconSize.Size14} />
                </Button>
              </div>
            ))}
        </div>

        {connections === null ? (
          <Loader size={LoaderSize.Normal} />
        ) : (
          <>
            <section className={s.section}>
              <h3 className={s.sectionTitle}>{t('common.linkedCalendars')}</h3>
              {linkedCalendars.length === 0 ? (
                <p className={s.empty}>{t('common.noLinkedCalendars')}</p>
              ) : (
                <div className={s.linkedList}>
                  {linkedCalendars.map((linkedCalendar) => (
                    <LinkedCalendarRow
                      key={linkedCalendar.id}
                      linkedCalendar={linkedCalendar}
                      projectName={linkedCalendar.projectId ? projectNamesById[linkedCalendar.projectId] : undefined}
                      onToggle={handleToggle}
                      onDelete={handleLinkedDelete}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className={s.section}>
              <h3 className={s.sectionTitle}>{t('common.addByFeedAddress')}</h3>
              <p className={s.sectionHint}>{t('common.icalSectionHint')}</p>
              <IcalFeedForm projects={projects} isSubmitting={isBusy} onSubmit={handleIcalSubmit} />
            </section>

            <section className={s.section}>
              <h3 className={s.sectionTitle}>{t('common.connectedAccounts')}</h3>
              <p className={s.sectionHint}>{t('common.googleSectionHint')}</p>
              {!isAvailable && <Message style={MessageStyle.Warning} content={t('common.calendarIntegrationNotConfigured')} />}
              {connections.length === 0 ? <p className={s.empty}>{t('common.noCalendarAccountsConnected')}</p> : <div className={s.connections}>{connections.map(renderConnection)}</div>}
              <div className={gs.controlsCenter}>
                <Button style={ButtonStyle.Submit} content={t('action.connectGoogleAccount')} disabled={!isAvailable || isBusy} onClick={handleConnect} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
});

CalendarSettings.propTypes = {
  accessToken: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default CalendarSettings;
