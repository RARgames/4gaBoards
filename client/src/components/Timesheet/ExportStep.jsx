import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { endOfDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Dropdown, DropdownStyle, Input, InputStyle, Popup, Form } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ExportStep.module.scss';

const PRESETS = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom'];
const GROUP_BY_OPTIONS = ['none', 'day', 'project'];

const computePresetRange = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'lastWeek': {
      const from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      return { from, to: endOfWeek(from, { weekStartsOn: 1 }) };
    }
    case 'thisMonth':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'lastMonth': {
      const from = startOfMonth(subMonths(now, 1));
      return { from, to: endOfMonth(from) };
    }
    case 'thisWeek':
    default:
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
  }
};

const ExportStep = React.memo(({ projects, isAdmin, viewedUserName, onDownloadCsv, onPrintSummary, onClose }) => {
  const [t] = useTranslation();
  const [preset, setPreset] = useState('thisWeek');
  const [customFrom, setCustomFrom] = useState(() => t('format:date', { postProcess: 'formatDate', value: new Date() }));
  const [customTo, setCustomTo] = useState(() => t('format:date', { postProcess: 'formatDate', value: new Date() }));
  const [projectId, setProjectId] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [memberScope, setMemberScope] = useState('current');

  const presetOptions = useMemo(() => PRESETS.map((value) => ({ id: value, name: t(`common.${value}`) })), [t]);
  const groupByOptions = useMemo(() => GROUP_BY_OPTIONS.map((value) => ({ id: value, name: value === 'project' ? t('common.project', { context: 'title' }) : t(`common.${value}`) })), [t]);
  const projectOptions = useMemo(() => [{ id: null, name: t('common.allProjects') }, ...projects], [projects, t]);
  const memberScopeOptions = useMemo(
    () => [
      { id: 'current', name: viewedUserName || t('common.me') },
      { id: 'all', name: t('common.allMembers') },
    ],
    [viewedUserName, t],
  );

  const range = useMemo(() => {
    if (preset === 'custom') {
      const from = t('format:date', { postProcess: 'parseDate', value: customFrom });
      const to = t('format:date', { postProcess: 'parseDate', value: customTo });
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return null;
      }
      return { from, to: endOfDay(to) };
    }
    const { from, to } = computePresetRange(preset);
    return { from, to: endOfDay(to) };
  }, [preset, customFrom, customTo, t]);

  const handleDownloadCsv = useCallback(() => {
    if (!range) {
      return;
    }
    onDownloadCsv({
      from: range.from,
      to: range.to,
      projectId: projectId || undefined,
      groupBy,
      allMembers: isAdmin && memberScope === 'all',
    });
    onClose();
  }, [range, projectId, groupBy, isAdmin, memberScope, onDownloadCsv, onClose]);

  const handlePrintSummary = useCallback(() => {
    if (!range) {
      return;
    }
    onPrintSummary({
      from: range.from,
      to: range.to,
      projectId: projectId || undefined,
    });
    onClose();
  }, [range, projectId, onPrintSummary, onClose]);

  const isAllMembers = isAdmin && memberScope === 'all';

  return (
    <>
      <Popup.Header>{t('common.exportTimesheet', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent>
        <Form>
          <div className={s.fieldLabel}>{t('common.dateRange')}</div>
          <Dropdown
            style={DropdownStyle.Default}
            options={presetOptions}
            defaultItem={presetOptions.find((option) => option.id === preset)}
            placeholder={t('common.dateRange')}
            onChange={(item) => setPreset(item.id)}
            className={s.field}
          />
          {preset === 'custom' && (
            <div className={s.customRangeRow}>
              <Input style={InputStyle.Default} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <Input style={InputStyle.Default} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          )}
          <div className={s.fieldLabel}>{t('common.project', { context: 'title' })}</div>
          <Dropdown
            style={DropdownStyle.Default}
            options={projectOptions}
            defaultItem={projectOptions.find((option) => option.id === projectId)}
            placeholder={t('common.allProjects')}
            onChange={(item) => setProjectId(item.id)}
            className={s.field}
          />
          <div className={s.fieldLabel}>{t('common.groupBy')}</div>
          <Dropdown
            style={DropdownStyle.Default}
            options={groupByOptions}
            defaultItem={groupByOptions.find((option) => option.id === groupBy)}
            placeholder={t('common.groupBy')}
            onChange={(item) => setGroupBy(item.id)}
            className={s.field}
          />
          {isAdmin && (
            <>
              <div className={s.fieldLabel}>{t('common.memberScope')}</div>
              <Dropdown
                style={DropdownStyle.Default}
                options={memberScopeOptions}
                defaultItem={memberScopeOptions.find((option) => option.id === memberScope)}
                placeholder={t('common.memberScope')}
                onChange={(item) => setMemberScope(item.id)}
                className={s.field}
              />
            </>
          )}
          <div className={gs.controlsSpaceBetween}>
            <Button
              style={ButtonStyle.DefaultBorder}
              content={t('common.printSummary')}
              onClick={handlePrintSummary}
              disabled={isAllMembers}
              title={isAllMembers ? t('common.printSummaryDisabledForAllMembers') : undefined}
            />
            <Button style={ButtonStyle.Submit} content={t('common.downloadCsv')} onClick={handleDownloadCsv} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ExportStep.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  viewedUserName: PropTypes.string,
  onDownloadCsv: PropTypes.func.isRequired,
  onPrintSummary: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ExportStep.defaultProps = {
  viewedUserName: undefined,
};

export default ExportStep;
