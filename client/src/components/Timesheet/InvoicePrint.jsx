import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import formatDuration from '../../utils/format-duration';
import { formatCents } from '../../utils/invoice-math';
import { Button, ButtonStyle } from '../Utils';

import * as s from './InvoicePrint.module.scss';

const InvoicePrint = React.memo(({ params, viewedUserId, viewedUserName, timeEntries, projectsById, categoryTagsById, onFetch, onClose }) => {
  const [t] = useTranslation();

  useEffect(() => {
    if (viewedUserId) {
      onFetch({ userId: viewedUserId, from: params.from, to: params.to, subscribe: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedUserId, params.from, params.to]);

  const { projectGroups, subtotalCents, taxCents, grandTotalCents } = useMemo(() => {
    const scoped = timeEntries.filter(
      (timeEntry) => timeEntry.userId === viewedUserId && timeEntry.startedAt < params.to && timeEntry.endedAt > params.from && (!params.projectId || timeEntry.projectId === params.projectId),
    );

    const projectMap = new Map();

    scoped.forEach((timeEntry) => {
      const projectKey = timeEntry.projectId || '__none__';
      if (!projectMap.has(projectKey)) {
        const projectName = timeEntry.projectId ? projectsById.get(timeEntry.projectId) : null;
        projectMap.set(projectKey, { projectName, categories: new Map() });
      }
      const projectGroup = projectMap.get(projectKey);

      const categoryLabel = (timeEntry.categoryTagId && categoryTagsById.get(timeEntry.categoryTagId)) || t('common.otherCategory');
      const categoryKey = categoryLabel.toLowerCase();

      const minutes = Math.round((timeEntry.endedAt.getTime() - timeEntry.startedAt.getTime()) / 60000);

      if (!projectGroup.categories.has(categoryKey)) {
        projectGroup.categories.set(categoryKey, { label: categoryLabel, minutes: 0 });
      }
      projectGroup.categories.get(categoryKey).minutes += minutes;
    });

    const sortedProjectEntries = Array.from(projectMap.entries()).sort(([, a], [, b]) => {
      if (!a.projectName && b.projectName) {
        return 1;
      }
      if (a.projectName && !b.projectName) {
        return -1;
      }
      return (a.projectName || '').localeCompare(b.projectName || '');
    });

    let subtotal = 0;
    let runningNo = 0;
    const groups = sortedProjectEntries.map(([projectKey, group]) => {
      const sortedCategories = Array.from(group.categories.values()).sort((a, b) => b.minutes - a.minutes || a.label.localeCompare(b.label));
      const items = sortedCategories.map((category) => {
        runningNo += 1;
        const lineTotalCents = Math.round((category.minutes * params.invoice.rateCents) / 60);
        subtotal += lineTotalCents;
        return {
          no: runningNo,
          label: category.label,
          minutes: category.minutes,
          lineTotalCents,
        };
      });

      return {
        key: projectKey,
        projectName: group.projectName,
        items,
      };
    });

    const tax = Math.round((subtotal * params.invoice.gstBp) / 10000);

    return {
      projectGroups: groups,
      subtotalCents: subtotal,
      taxCents: tax,
      grandTotalCents: subtotal + tax,
    };
  }, [timeEntries, viewedUserId, params, categoryTagsById, projectsById, t]);

  const gstPercentDisplay = (params.invoice.gstBp / 100).toFixed(2).replace(/\.?0+$/, '');

  return (
    <div className={s.overlay}>
      <div className={clsx(s.toolbar, 'timesheet-print-toolbar')}>
        <Button style={ButtonStyle.Submit} content={t('action.print')} onClick={() => window.print()} />
        <Button style={ButtonStyle.Cancel} content={t('common.close')} onClick={onClose} />
        {viewedUserName && <span className={s.toolbarHint}>{viewedUserName}</span>}
      </div>
      <div className={clsx(s.printArea, 'timesheet-print-area')}>
        <h1 className={s.title}>{t('common.invoice_title')}</h1>
        <div className={s.metaRow}>
          <div>
            {t('common.invoiceNumber')}: {params.invoice.number}
          </div>
          <div>
            {t('common.invoiceDate')}: {format(new Date(), 'MMM d, yyyy')}
          </div>
        </div>
        <div className={s.partiesRow}>
          <div className={s.partyColumn}>
            <div className={s.partyHeading}>{t('common.billToHeading')}</div>
            {params.invoice.billTo.split('\n').map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <div className={s.partyColumn}>
            <div className={s.partyHeading}>
              {t('common.payableToHeading')} {params.invoice.payableToName}
            </div>
            {params.invoice.payableToAddress.split('\n').map((line) => (
              <div key={line}>{line}</div>
            ))}
            {params.invoice.gstNumber && <div>GST #: {params.invoice.gstNumber}</div>}
          </div>
        </div>
        {projectGroups.length === 0 ? (
          <p className={s.empty}>{t('common.noTimeEntriesWeek')}</p>
        ) : (
          <table className={s.itemsTable}>
            <thead>
              <tr>
                <th>No.</th>
                <th>{t('common.category')}</th>
                <th>Qty.</th>
                <th>Price</th>
                <th className={s.moneyHeader}>Total</th>
              </tr>
            </thead>
            <tbody>
              {projectGroups.map((group) => (
                <React.Fragment key={group.key}>
                  <tr className={s.projectHeaderRow}>
                    <td colSpan={5}>{group.projectName ? t('common.projectHeading', { name: group.projectName }) : t('common.noProjectHeading')}</td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.no}>
                      <td>{item.no}</td>
                      <td>{item.label}</td>
                      <td>{formatDuration(item.minutes)}</td>
                      <td>${formatCents(params.invoice.rateCents)}/hr</td>
                      <td className={s.money}>{formatCents(item.lineTotalCents)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
        <div className={s.footerRow}>
          <div className={s.paymentColumn}>
            <div className={s.partyHeading}>{t('common.paymentMethodHeading')}</div>
            {params.invoice.paymentDetails.split('\n').map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <table className={s.totalsTable}>
            <tbody>
              <tr>
                <td>{t('common.subtotal')}</td>
                <td className={s.money}>{formatCents(subtotalCents)}</td>
              </tr>
              {params.invoice.gstBp > 0 && (
                <tr>
                  <td>GST ({gstPercentDisplay}%)</td>
                  <td className={s.money}>{formatCents(taxCents)}</td>
                </tr>
              )}
              <tr className={s.grandTotalRow}>
                <td>{t('common.grandTotal')}</td>
                <td className={s.money}>{formatCents(grandTotalCents)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

InvoicePrint.propTypes = {
  params: PropTypes.shape({
    from: PropTypes.instanceOf(Date).isRequired,
    to: PropTypes.instanceOf(Date).isRequired,
    projectId: PropTypes.string,
    invoice: PropTypes.shape({
      number: PropTypes.string.isRequired,
      rateCents: PropTypes.number.isRequired,
      gstBp: PropTypes.number.isRequired,
      gstNumber: PropTypes.string,
      payableToName: PropTypes.string,
      payableToAddress: PropTypes.string,
      paymentDetails: PropTypes.string,
      billTo: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  viewedUserId: PropTypes.string,
  viewedUserName: PropTypes.string,
  timeEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projectsById: PropTypes.instanceOf(Map).isRequired,
  categoryTagsById: PropTypes.instanceOf(Map).isRequired,
  onFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

InvoicePrint.defaultProps = {
  viewedUserId: undefined,
  viewedUserName: undefined,
};

export default InvoicePrint;
