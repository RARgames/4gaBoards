import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../../containers/ActionsCellContainer';
import DueDateCellContainer from '../../../../containers/DueDateCellContainer';
import LabelsCellContainer from '../../../../containers/LabelsCellContainer';
import MembersCellContainer from '../../../../containers/MembersCellContainer';
import TimerCellContainer from '../../../../containers/TimerCellContainer';
import ActionsHeader from '../ActionsHeader';
import BoolCell from '../BoolCell';
import DefaultCell from '../DefaultCell';
import ListViewStyle from '../ListViewStyle';

import * as s from './Renderers.module.scss';

function NameCellRenderer({ table, row }) {
  return <DefaultCell value={row.original.name} title={row.original.name} cellClassName={s[table.options.listViewStyle]} />;
}

NameCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function LabelsCellRenderer({ table, row }) {
  return <LabelsCellContainer id={row.original.id} labels={row.original.labels} cellClassName={s[table.options.listViewStyle]} />;
}

LabelsCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
  }).isRequired,
};

function MembersCellRenderer({ table, row }) {
  return <MembersCellContainer id={row.original.id} users={row.original.users} cellClassName={s[table.options.listViewStyle]} />;
}

MembersCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
  }).isRequired,
};

function ListNameCellRenderer({ table, row }) {
  return <DefaultCell value={row.original.listName} title={row.original.listName} cellClassName={s[table.options.listViewStyle]} />;
}

ListNameCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      listName: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function HasDescriptionCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <BoolCell value={row.original.hasDescription} title={t('common.detailsDescription')} cellClassName={s[table.options.listViewStyle]} />;
}

HasDescriptionCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      hasDescription: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

function AttachmentsCountCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.attachmentsCount} title={t('common.detailsAttachments', { count: row.original.attachmentsCount })} cellClassName={s[table.options.listViewStyle]} />;
}

AttachmentsCountCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      attachmentsCount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

function CommentCountCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.commentCount} title={t('common.detailsComments', { count: row.original.commentCount })} cellClassName={s[table.options.listViewStyle]} />;
}

CommentCountCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      commentCount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

function DueDateCellRenderer({ table, row }) {
  return <DueDateCellContainer id={row.original.id} dueDate={row.original.dueDate} cellClassName={s[table.options.listViewStyle]} />;
}

DueDateCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      dueDate: PropTypes.instanceOf(Date),
    }).isRequired,
  }).isRequired,
};

function TimerCellRenderer({ table, row }) {
  return <TimerCellContainer id={row.original.id} timer={row.original.timer} cellClassName={s[table.options.listViewStyle]} />;
}

TimerCellRenderer.propTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
  }).isRequired,
};

function ActionsHeaderRenderer({ table }, handleResetColumnSortingClick, handleResetColumnWidths, handleResetColumnVisibilityClick) {
  return <ActionsHeader table={table} onResetColumnSorting={handleResetColumnSortingClick} onResetColumnWidths={handleResetColumnWidths} onResetColumnVisibility={handleResetColumnVisibilityClick} />;
}

ActionsHeaderRenderer.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function ActionsCellRenderer({ row }) {
  return <ActionsCellContainer id={row.original.id} />;
}

ActionsCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export {
  NameCellRenderer,
  LabelsCellRenderer,
  MembersCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  AttachmentsCountCellRenderer,
  CommentCountCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  ActionsCellRenderer,
  ActionsHeaderRenderer,
};
