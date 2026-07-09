import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { endOfDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import PropTypes from 'prop-types';

import { parseGstToBasisPoints, parseRateToCents } from '../../utils/invoice-math';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize, Input, InputStyle, Popup, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ExportStep.module.scss';

const PRESETS = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom'];
const GROUP_BY_OPTIONS = ['none', 'day', 'project'];
const FORMATS = ['invoice', 'csv'];

const DEFAULT_BILL_TO = 'Lucid Rain Studios\nEdmonton, AB\nLucidrainstudios@gmail.com';

const EMPTY_INVOICE_FIELDS = {
  invoiceNumber: '1',
  rate: '',
  gstRateStr: '0',
  gstNumber: '',
  payableToName: '',
  addressStreet: '',
  addressCity: '',
  addressProvince: '',
  addressPostalCode: '',
  addressCountry: '',
  paymentDetails: '',
  billTo: DEFAULT_BILL_TO,
};

const ButtonGroup = React.memo(({ options, selectedId, onChange }) => (
  <div className={s.buttonGroup}>
    {options.map((option) => (
      <Button
        key={option.id}
        style={ButtonStyle.NoBackground}
        content={option.name}
        onClick={() => onChange(option.id)}
        className={clsx(s.buttonGroupItem, selectedId === option.id && s.buttonGroupItemActive)}
      />
    ))}
  </div>
));

ButtonGroup.propTypes = {
  options: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
};

ButtonGroup.defaultProps = {
  selectedId: undefined,
};

const CollapsibleSection = React.memo(({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={s.collapsibleSection}>
      <Button style={ButtonStyle.NoBackground} onClick={() => setIsOpen((prev) => !prev)} className={s.collapsibleHeader}>
        <span>{title}</span>
        <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={clsx(s.collapsibleIcon, isOpen && s.collapsibleIconOpen)} />
      </Button>
      {isOpen && <div className={s.collapsibleContent}>{children}</div>}
    </div>
  );
});

CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

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

const loadInvoiceSettings = (userId) => {
  if (!userId) {
    return {};
  }
  try {
    const raw = localStorage.getItem(`invoiceSettings:${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const invoiceFieldsForMember = (userId, fallbackName) => {
  const settings = loadInvoiceSettings(userId);
  const last = settings.lastInvoiceNumber;
  let invoiceNumber;
  if (last && /^\d+$/.test(last)) {
    invoiceNumber = String(parseInt(last, 10) + 1);
  } else {
    invoiceNumber = last || '1';
  }

  return {
    invoiceNumber,
    rate: settings.rate || '',
    gstRateStr: settings.gstRate || '0',
    gstNumber: settings.gstNumber || '',
    payableToName: settings.payableToName || fallbackName || '',
    addressStreet: settings.addressStreet || '',
    addressCity: settings.addressCity || '',
    addressProvince: settings.addressProvince || '',
    addressPostalCode: settings.addressPostalCode || '',
    addressCountry: settings.addressCountry || '',
    paymentDetails: settings.paymentDetails || '',
    billTo: settings.billTo || DEFAULT_BILL_TO,
  };
};

const ExportStep = React.memo(({ projects, isAdmin, viewedUserId, viewedUserName, members, onDownloadCsv, onPrintSummary, onPrintInvoice, onClose }) => {
  const [t] = useTranslation();
  const [preset, setPreset] = useState('thisWeek');
  const [customFrom, setCustomFrom] = useState(() => t('format:date', { postProcess: 'formatDate', value: new Date() }));
  const [customTo, setCustomTo] = useState(() => t('format:date', { postProcess: 'formatDate', value: new Date() }));
  const [projectId, setProjectId] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [memberScope, setMemberScope] = useState('current');

  const [exportFormat, setExportFormat] = useState(() => (onPrintInvoice ? 'invoice' : 'csv'));
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [invoiceFields, setInvoiceFields] = useState(() => (members ? EMPTY_INVOICE_FIELDS : invoiceFieldsForMember(viewedUserId, viewedUserName)));

  useEffect(() => {
    if (!members) {
      return;
    }
    if (!selectedMemberId) {
      setInvoiceFields(EMPTY_INVOICE_FIELDS);
      return;
    }
    const memberName = members.find((member) => member.id === selectedMemberId)?.name;
    setInvoiceFields(invoiceFieldsForMember(selectedMemberId, memberName));
  }, [members, selectedMemberId]);

  const effectiveUserId = members ? selectedMemberId : viewedUserId;
  const effectiveUserName = members ? members.find((member) => member.id === selectedMemberId)?.name : viewedUserName;

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
  const memberOptions = useMemo(() => (members ? members.map((member) => ({ id: member.id, name: member.name })) : []), [members]);
  const formatOptions = useMemo(() => FORMATS.map((value) => ({ id: value, name: t(`common.format${value === 'csv' ? 'Csv' : 'PdfInvoice'}`) })), [t]);

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

  const rateCents = useMemo(() => parseRateToCents(invoiceFields.rate), [invoiceFields.rate]);
  const gstBp = useMemo(() => parseGstToBasisPoints(invoiceFields.gstRateStr), [invoiceFields.gstRateStr]);
  const isInvoiceValid = !!range && rateCents !== null && gstBp !== null && !!effectiveUserId;

  const setInvoiceField = useCallback((field, value) => {
    setInvoiceFields((prev) => ({ ...prev, [field]: value }));
  }, []);

  const formattedPayableToAddress = useMemo(() => {
    const { addressStreet, addressCity, addressProvince, addressPostalCode, addressCountry } = invoiceFields;
    const lines = [];
    if (addressStreet.trim()) {
      lines.push(addressStreet.trim());
    }
    const cityProvince = [addressCity.trim(), addressProvince.trim()].filter(Boolean).join(', ');
    const cityLine = [cityProvince, addressPostalCode.trim()].filter(Boolean).join(' ');
    if (cityLine) {
      lines.push(cityLine);
    }
    if (addressCountry.trim()) {
      lines.push(addressCountry.trim());
    }
    return lines.join('\n');
  }, [invoiceFields]);

  const handleGenerateInvoice = useCallback(() => {
    if (!range || rateCents === null || gstBp === null || !onPrintInvoice || !effectiveUserId) {
      return;
    }

    try {
      localStorage.setItem(
        `invoiceSettings:${effectiveUserId}`,
        JSON.stringify({
          lastInvoiceNumber: invoiceFields.invoiceNumber,
          rate: invoiceFields.rate,
          gstRate: invoiceFields.gstRateStr,
          gstNumber: invoiceFields.gstNumber,
          payableToName: invoiceFields.payableToName,
          addressStreet: invoiceFields.addressStreet,
          addressCity: invoiceFields.addressCity,
          addressProvince: invoiceFields.addressProvince,
          addressPostalCode: invoiceFields.addressPostalCode,
          addressCountry: invoiceFields.addressCountry,
          paymentDetails: invoiceFields.paymentDetails,
          billTo: invoiceFields.billTo,
        }),
      );
    } catch {
      // Ignore storage errors (quota exceeded, privacy mode, etc.)
    }

    onPrintInvoice({
      from: range.from,
      to: range.to,
      projectId: projectId || undefined,
      userId: effectiveUserId,
      userName: effectiveUserName,
      invoice: {
        number: invoiceFields.invoiceNumber,
        rateCents,
        gstBp,
        gstNumber: invoiceFields.gstNumber,
        payableToName: invoiceFields.payableToName,
        payableToAddress: formattedPayableToAddress,
        paymentDetails: invoiceFields.paymentDetails,
        billTo: invoiceFields.billTo,
      },
    });
    onClose();
  }, [range, rateCents, gstBp, onPrintInvoice, effectiveUserId, effectiveUserName, invoiceFields, formattedPayableToAddress, projectId, onClose]);

  const isAllMembers = isAdmin && memberScope === 'all';

  return (
    <>
      <Popup.Header>{t('common.exportTimesheet', { context: 'title' })}</Popup.Header>
      <Popup.Content className={s.content}>
        <Form className={s.form}>
          <div className={s.scrollArea}>
            {onPrintInvoice && (
              <>
                <div className={s.fieldLabel}>{t('common.exportFormat')}</div>
                <ButtonGroup options={formatOptions} selectedId={exportFormat} onChange={setExportFormat} />
              </>
            )}
            <div className={s.fieldLabel}>{t('common.dateRange')}</div>
            <ButtonGroup options={presetOptions} selectedId={preset} onChange={setPreset} />
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
              dropdownMenuClassName={s.dropdownMenu}
            />
            {exportFormat === 'csv' && (
              <>
                <div className={s.fieldLabel}>{t('common.groupBy')}</div>
                <ButtonGroup options={groupByOptions} selectedId={groupBy} onChange={setGroupBy} />
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
                      dropdownMenuClassName={s.dropdownMenu}
                    />
                  </>
                )}
              </>
            )}
            {exportFormat === 'invoice' && onPrintInvoice && (
              <>
                {members && (
                  <>
                    <div className={s.fieldLabel}>{t('common.invoiceMember')}</div>
                    <Dropdown
                      style={DropdownStyle.Default}
                      options={memberOptions}
                      defaultItem={memberOptions.find((option) => option.id === selectedMemberId)}
                      placeholder={t('common.selectMember')}
                      onChange={(item) => setSelectedMemberId(item.id)}
                      className={s.field}
                      dropdownMenuClassName={s.dropdownMenu}
                    />
                  </>
                )}
                <div className={s.fieldLabel}>{t('common.invoiceNumber')}</div>
                <Input style={InputStyle.Default} value={invoiceFields.invoiceNumber} onChange={(e) => setInvoiceField('invoiceNumber', e.target.value)} className={s.field} />
                <div className={s.fieldLabel}>{t('common.hourlyRate')}</div>
                <Input style={InputStyle.Default} value={invoiceFields.rate} onChange={(e) => setInvoiceField('rate', e.target.value)} isError={rateCents === null} className={s.field} />
                <div className={s.fieldLabel}>{t('common.gstRate')}</div>
                <Input style={InputStyle.Default} value={invoiceFields.gstRateStr} onChange={(e) => setInvoiceField('gstRateStr', e.target.value)} isError={gstBp === null} className={s.field} />
                <div className={s.fieldLabel}>{t('common.gstNumber')}</div>
                <Input style={InputStyle.Default} value={invoiceFields.gstNumber} onChange={(e) => setInvoiceField('gstNumber', e.target.value)} className={s.field} />
                <div className={s.fieldLabel}>{t('common.payableToName')}</div>
                <Input style={InputStyle.Default} value={invoiceFields.payableToName} onChange={(e) => setInvoiceField('payableToName', e.target.value)} className={s.field} />
                <CollapsibleSection title={t('common.addressSection')}>
                  <div className={s.fieldLabel}>{t('common.streetAddress')}</div>
                  <Input style={InputStyle.Default} value={invoiceFields.addressStreet} onChange={(e) => setInvoiceField('addressStreet', e.target.value)} className={s.field} />
                  <div className={s.fieldRow}>
                    <div className={s.fieldRowItem}>
                      <div className={s.fieldLabel}>{t('common.city')}</div>
                      <Input style={InputStyle.Default} value={invoiceFields.addressCity} onChange={(e) => setInvoiceField('addressCity', e.target.value)} />
                    </div>
                    <div className={s.fieldRowItem}>
                      <div className={s.fieldLabel}>{t('common.province')}</div>
                      <Input style={InputStyle.Default} value={invoiceFields.addressProvince} onChange={(e) => setInvoiceField('addressProvince', e.target.value)} />
                    </div>
                  </div>
                  <div className={s.fieldRow}>
                    <div className={s.fieldRowItem}>
                      <div className={s.fieldLabel}>{t('common.postalCode')}</div>
                      <Input style={InputStyle.Default} value={invoiceFields.addressPostalCode} onChange={(e) => setInvoiceField('addressPostalCode', e.target.value)} />
                    </div>
                    <div className={s.fieldRowItem}>
                      <div className={s.fieldLabel}>{t('common.country')}</div>
                      <Input style={InputStyle.Default} value={invoiceFields.addressCountry} onChange={(e) => setInvoiceField('addressCountry', e.target.value)} />
                    </div>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title={t('common.billingSection')}>
                  <div className={s.fieldLabel}>{t('common.paymentDetails')}</div>
                  <TextArea style={TextAreaStyle.Default} value={invoiceFields.paymentDetails} onChange={(e) => setInvoiceField('paymentDetails', e.target.value)} maxRows={4} className={s.field} />
                  <div className={s.fieldLabel}>{t('common.billTo')}</div>
                  <TextArea style={TextAreaStyle.Default} value={invoiceFields.billTo} onChange={(e) => setInvoiceField('billTo', e.target.value)} maxRows={4} className={s.field} />
                </CollapsibleSection>
              </>
            )}
          </div>
          {exportFormat === 'csv' && (
            <div className={clsx(gs.controlsSpaceBetween, s.footerRow)}>
              <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={onClose} />
              <div className={s.footerActions}>
                <Button
                  style={ButtonStyle.DefaultBorder}
                  content={t('common.printSummary')}
                  onClick={handlePrintSummary}
                  disabled={isAllMembers}
                  title={isAllMembers ? t('common.printSummaryDisabledForAllMembers') : undefined}
                  className={s.fitContentButton}
                />
                <Button style={ButtonStyle.Submit} content={t('common.downloadCsv')} onClick={handleDownloadCsv} />
              </div>
            </div>
          )}
          {exportFormat === 'invoice' && onPrintInvoice && (
            <div className={clsx(gs.controlsSpaceBetween, s.footerRow)}>
              <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={onClose} />
              <Button style={ButtonStyle.Submit} content={t('common.generateInvoice')} onClick={handleGenerateInvoice} disabled={!isInvoiceValid} />
            </div>
          )}
        </Form>
      </Popup.Content>
    </>
  );
});

ExportStep.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  viewedUserId: PropTypes.string,
  viewedUserName: PropTypes.string,
  members: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onDownloadCsv: PropTypes.func.isRequired,
  onPrintSummary: PropTypes.func.isRequired,
  onPrintInvoice: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ExportStep.defaultProps = {
  viewedUserId: undefined,
  viewedUserName: undefined,
  members: undefined,
  onPrintInvoice: undefined,
};

export default ExportStep;
