import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import api from '../../api';
import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, FilePicker, Icon, IconType, IconSize, Loader, LoaderSize, Message, MessageStyle, Popup, Form } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ImportStep.module.scss';

const MAPPING_FIELDS = ['date', 'start', 'end', 'duration', 'activity', 'note'];

const ImportStep = React.memo(({ accessToken, isAdmin, users, onImportComplete, onClose }) => {
  const [t] = useTranslation();
  const [step, setStep] = useState('select');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [isTeamImport, setIsTeamImport] = useState(false);
  const [memberMapping, setMemberMapping] = useState({});
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${accessToken}` }), [accessToken]);

  const handleFileSelect = useCallback(
    async (selectedFile) => {
      setFile(selectedFile);
      setIsLoading(true);
      setError(null);

      try {
        const { columns, detectedMapping, preview, memberValues, rowCount } = await api.previewTimeEntriesImport(selectedFile, headers);
        setPreviewData({ columns, preview, memberValues, rowCount });
        setMapping(detectedMapping);
        setIsTeamImport(false);
        setStep('mapping');
      } catch (importError) {
        setError(importError.message || t('common.importFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [headers, t],
  );

  const handleMappingChange = useCallback((field, columnId) => {
    setMapping((prevMapping) => ({ ...prevMapping, [field]: columnId }));
  }, []);

  const handleContinueToMembers = useCallback(() => {
    if (!mapping.date || !mapping.start) {
      setError(t('common.importMappingRequired'));
      return;
    }
    if (!mapping.member) {
      setError(t('common.importMemberColumnRequired'));
      return;
    }

    const suggested = {};
    previewData.memberValues.forEach((rawName) => {
      const match = users.find((user) => user.name.trim().toLowerCase() === rawName.trim().toLowerCase());
      suggested[rawName] = match ? match.id : null;
    });

    setMemberMapping(suggested);
    setError(null);
    setStep('matchMembers');
  }, [mapping, previewData, users, t]);

  const runImport = useCallback(
    async (extra) => {
      setIsLoading(true);
      setError(null);

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const result = await api.confirmTimeEntriesImport(file, mapping, timezone, headers, extra);
        setResultData(result);
        setStep('result');
        onImportComplete();
      } catch (importError) {
        setError(importError.message || t('common.importFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [file, mapping, headers, onImportComplete, t],
  );

  const handleConfirm = useCallback(() => {
    if (!mapping.date || !mapping.start) {
      setError(t('common.importMappingRequired'));
      return;
    }

    if (isTeamImport) {
      handleContinueToMembers();
      return;
    }

    runImport({});
  }, [mapping, isTeamImport, handleContinueToMembers, runImport, t]);

  const handleMemberMappingChange = useCallback((rawName, userId) => {
    setMemberMapping((prevMapping) => ({ ...prevMapping, [rawName]: userId }));
  }, []);

  const handleConfirmMembers = useCallback(() => {
    runImport({ allMembers: true, memberMapping });
  }, [runImport, memberMapping]);

  const columnOptions = useMemo(() => (previewData ? [{ id: null, name: t('common.none') }, ...previewData.columns.map((column) => ({ id: column, name: column }))] : []), [previewData, t]);

  const userOptions = useMemo(() => [{ id: null, name: t('common.importSkipMember') }, ...users.map((user) => ({ id: user.id, name: user.name }))], [users, t]);

  const matchedMemberCount = previewData ? previewData.memberValues.filter((rawName) => memberMapping[rawName]).length : 0;

  return (
    <>
      <Popup.Header>{t('common.importTimesheet', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent>
        {step === 'select' && (
          <Form>
            <p className={s.instructions}>{t('common.importInstructions')}</p>
            {error && <Message style={MessageStyle.Error} content={error} onDismiss={() => setError(null)} />}
            {isLoading ? (
              <Loader size={LoaderSize.Small} />
            ) : (
              <FilePicker onSelect={handleFileSelect} accept=".csv,text/csv">
                <Button style={ButtonStyle.DefaultBorder}>
                  <Icon type={IconType.Attach} size={IconSize.Size14} className={s.icon} />
                  {t('common.chooseCsvFile')}
                </Button>
              </FilePicker>
            )}
          </Form>
        )}
        {step === 'mapping' && previewData && (
          <Form>
            <p className={s.instructions}>{t('common.importPreviewSummary', { count: previewData.rowCount })}</p>
            {error && <Message style={MessageStyle.Error} content={error} onDismiss={() => setError(null)} />}
            {MAPPING_FIELDS.map((field) => (
              <div key={field} className={s.mappingRow}>
                <div className={s.mappingLabel}>{t(`common.importColumn_${field}`)}</div>
                <Dropdown
                  style={DropdownStyle.Default}
                  options={columnOptions}
                  defaultItem={columnOptions.find((option) => option.id === mapping[field]) || columnOptions[0]}
                  placeholder={t('common.none')}
                  onChange={(item) => handleMappingChange(field, item.id)}
                  className={s.mappingDropdown}
                />
              </div>
            ))}
            {isAdmin && previewData.memberValues.length > 0 && (
              <>
                <div className={s.teamImportRow}>
                  <Checkbox checked={isTeamImport} onChange={() => setIsTeamImport((prev) => !prev)} />
                  <span>{t('common.importTeamFile', { count: previewData.memberValues.length })}</span>
                </div>
                {isTeamImport && (
                  <div className={s.mappingRow}>
                    <div className={s.mappingLabel}>{t('common.importColumn_member')}</div>
                    <Dropdown
                      style={DropdownStyle.Default}
                      options={columnOptions}
                      defaultItem={columnOptions.find((option) => option.id === mapping.member) || columnOptions[0]}
                      placeholder={t('common.none')}
                      onChange={(item) => handleMappingChange('member', item.id)}
                      className={s.mappingDropdown}
                    />
                  </div>
                )}
              </>
            )}
            <div className={gs.controlsSpaceBetween}>
              <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={onClose} disabled={isLoading} />
              <Button style={ButtonStyle.Submit} content={isTeamImport ? t('common.next') : t('common.confirmImport')} onClick={handleConfirm} disabled={isLoading} />
            </div>
          </Form>
        )}
        {step === 'matchMembers' && previewData && (
          <Form>
            <p className={s.instructions}>{t('common.importMatchMembersSummary', { matched: matchedMemberCount, total: previewData.memberValues.length })}</p>
            {error && <Message style={MessageStyle.Error} content={error} onDismiss={() => setError(null)} />}
            <div className={s.memberMatchList}>
              {previewData.memberValues.map((rawName) => (
                <div key={rawName} className={s.mappingRow}>
                  <div className={s.mappingLabel} title={rawName}>
                    {rawName}
                  </div>
                  <Dropdown
                    style={DropdownStyle.Default}
                    options={userOptions}
                    defaultItem={userOptions.find((option) => option.id === memberMapping[rawName]) || userOptions[0]}
                    placeholder={t('common.importSkipMember')}
                    onChange={(item) => handleMemberMappingChange(rawName, item.id)}
                    className={s.mappingDropdown}
                  />
                </div>
              ))}
            </div>
            <div className={gs.controlsSpaceBetween}>
              <Button style={ButtonStyle.Cancel} content={t('common.back')} onClick={() => setStep('mapping')} disabled={isLoading} />
              <Button style={ButtonStyle.Submit} content={t('common.confirmImport')} onClick={handleConfirmMembers} disabled={isLoading} />
            </div>
          </Form>
        )}
        {step === 'result' && resultData && (
          <Form>
            <p className={s.resultLine}>{t('common.rowsCreated', { count: resultData.created })}</p>
            <p className={s.resultLine}>{t('common.rowsSkipped', { count: resultData.skipped })}</p>
            {resultData.skippedEmpty > 0 && <p className={s.resultLine}>{t('common.rowsEmpty', { count: resultData.skippedEmpty })}</p>}
            {resultData.skippedUnmatched > 0 && <p className={s.resultLine}>{t('common.rowsUnmatched', { count: resultData.skippedUnmatched })}</p>}
            <p className={s.resultLine}>{t('common.rowsFailed', { count: resultData.failedCount })}</p>
            {resultData.failed.length > 0 && (
              <ul className={s.failureList}>
                {resultData.failed.map((failure) => (
                  <li key={failure.row}>
                    {t('common.importRowNumber', { row: failure.row })}: {failure.reason}
                  </li>
                ))}
              </ul>
            )}
            <div className={gs.controls}>
              <Button style={ButtonStyle.Submit} content={t('common.close')} onClick={onClose} />
            </div>
          </Form>
        )}
      </Popup.Content>
    </>
  );
});

ImportStep.propTypes = {
  accessToken: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onImportComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ImportStep.defaultProps = {
  accessToken: undefined,
};

export default ImportStep;
