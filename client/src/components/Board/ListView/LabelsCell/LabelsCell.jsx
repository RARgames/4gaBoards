import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Label from '../../../Label';
import LabelsPopup from '../../../LabelsPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './LabelsCell.module.scss';

const LabelsCell = React.memo(({ labels, allLabels, cellClassName, canEdit, onLabelAdd, onLabelRemove, onLabelCreate, onLabelUpdate, onLabelDelete }) => {
  const [t] = useTranslation();
  const labelIds = labels.map((label) => label.id);

  const labelsNode = labels.map((label) => (
    <LabelsPopup
      key={label.id}
      items={allLabels}
      currentIds={labelIds}
      onSelect={onLabelAdd}
      onDeselect={onLabelRemove}
      onCreate={onLabelCreate}
      onUpdate={onLabelUpdate}
      onDelete={onLabelDelete}
      canEdit={canEdit}
      offset={0}
      wrapperClassName={s.labelWrapper}
      disabled={!canEdit}
    >
      <Label name={label.name} color={label.color} variant="card" isClickable={canEdit} />
    </LabelsPopup>
  ));

  const addLabelNode = (
    <LabelsPopup
      items={allLabels}
      currentIds={labelIds}
      onSelect={onLabelAdd}
      onDeselect={onLabelRemove}
      onCreate={onLabelCreate}
      onUpdate={onLabelUpdate}
      onDelete={onLabelDelete}
      canEdit={canEdit}
      offset={0}
      wrapperClassName={s.popupWrapper}
    >
      <Button style={ButtonStyle.Icon} title={t('common.addLabel')} className={clsx(cellClassName, s.addButton)}>
        <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
      </Button>
    </LabelsPopup>
  );

  if (labels.length === 0 && canEdit) {
    return addLabelNode;
  }

  return <div className={clsx(cellClassName)}>{labelsNode}</div>;
});

LabelsCell.propTypes = {
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

LabelsCell.defaultProps = {
  cellClassName: '',
};

export default LabelsCell;
