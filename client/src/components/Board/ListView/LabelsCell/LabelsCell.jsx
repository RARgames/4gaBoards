import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Label from '../../../Label';
import LabelsPopup from '../../../LabelsPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './LabelsCell.module.scss';

const LabelsCell = React.memo(({ labels, allLabels, cellClassName, canEdit, onLabelAdd, onLabelRemove, onLabelCreate, onLabelUpdate, onLabelDelete }) => {
  const [t] = useTranslation();
  const labelIds = labels.map((label) => label.id);

  const labelsNode = labels.map((label) => (
    <div key={label.id} className={s.attachment}>
      <Label name={label.name} color={label.color} variant="card" />
    </div>
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
      <Button style={ButtonStyle.Icon} title={t('common.addLabel')} className={classNames(cellClassName, s.addButton)}>
        <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
      </Button>
    </LabelsPopup>
  );

  if (!canEdit) {
    return <div className={classNames(cellClassName, s.labels)}>{labelsNode}</div>;
  }

  if (labels.length === 0) {
    return addLabelNode;
  }

  return (
    <div className={classNames(cellClassName, s.labels)}>
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
      >
        {labelsNode}
      </LabelsPopup>
    </div>
  );
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
