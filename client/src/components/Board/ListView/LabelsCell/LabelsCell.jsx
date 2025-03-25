import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Label from '../../../Label';
import LabelsPopup from '../../../LabelsPopup';

import * as s from './LabelsCell.module.scss';

const LabelsCell = React.memo(({ labels, allLabels, cellClassName, canEdit, onLabelAdd, onLabelRemove, onLabelCreate, onLabelUpdate, onLabelMove, onLabelDelete }) => {
  const labelIds = labels.map((label) => label.id);

  const labelsNode = labels.map((label) => (
    <div key={label.id} className={s.attachment}>
      <Label name={label.name} color={label.color} variant="card" />
    </div>
  ));

  return (
    <div className={classNames(cellClassName, s.labels)}>
      {canEdit ? (
        <LabelsPopup
          items={allLabels}
          currentIds={labelIds}
          onSelect={onLabelAdd}
          onDeselect={onLabelRemove}
          onCreate={onLabelCreate}
          onUpdate={onLabelUpdate}
          onMove={onLabelMove}
          onDelete={onLabelDelete}
          canEdit={canEdit}
          offset={0}
        >
          {labelsNode}
        </LabelsPopup>
      ) : (
        labelsNode
      )}
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
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

LabelsCell.defaultProps = {
  cellClassName: '',
};

export default LabelsCell;
