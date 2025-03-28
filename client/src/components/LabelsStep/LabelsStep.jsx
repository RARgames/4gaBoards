import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { useField, useSteps } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle } from '../Utils';
import AddStep from './AddStep';
import EditStep from './EditStep';
import Item from './Item';

import * as gs from '../../global.module.scss';
import * as s from './LabelsStep.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const LabelsStep = React.memo(({ items, currentIds, title, canEdit, onSelect, onDeselect, onCreate, onUpdate, onMove, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredItems = useMemo(() => items.filter((label) => (label.name && label.name.toLowerCase().includes(cleanSearch)) || label.color.includes(cleanSearch)), [items, cleanSearch]);

  const searchField = useRef(null);

  const handleAddClick = useCallback(() => {
    openStep(StepTypes.ADD);
  }, [openStep]);

  const handleBackWithClear = useCallback(() => {
    handleBack();
    handleSearchChange({ target: { value: '' } });

    const timeout = setTimeout(() => {
      searchField.current?.focus();
    }, 0);
    return () => clearTimeout(timeout);
  }, [handleBack, handleSearchChange]);

  const handleEdit = useCallback(
    (id) => {
      openStep(StepTypes.EDIT, {
        id,
      });
    },
    [openStep],
  );

  const handleSelect = useCallback(
    (id) => {
      onSelect(id);
    },
    [onSelect],
  );

  const handleDeselect = useCallback(
    (id) => {
      onDeselect(id);
    },
    [onDeselect],
  );

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      if (!destination || source.index === destination.index) {
        return;
      }

      onMove(draggableId, destination.index);
    },
    [onMove],
  );

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  useEffect(() => {
    searchField.current?.focus({
      preventScroll: true,
    });
  }, []);

  if (step) {
    switch (step.type) {
      case StepTypes.ADD:
        return <AddStep defaultData={{ name: search }} onCreate={onCreate} onBack={handleBackWithClear} />;
      case StepTypes.EDIT: {
        const currentItem = items.find((item) => item.id === step.params.id);

        if (currentItem) {
          return <EditStep defaultData={pick(currentItem, ['name', 'color'])} onUpdate={(data) => handleUpdate(currentItem.id, data)} onDelete={() => handleDelete(currentItem.id)} onBack={handleBack} />;
        }

        openStep(null);

        break;
      }
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.FullWidth} value={search} placeholder={t('common.searchLabels')} onChange={handleSearchChange} />
        {filteredItems.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="labels" type={DroppableTypes.LABEL}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={classNames(s.items, gs.scrollableY)}
                >
                  {filteredItems.map((item, index) => (
                    <Item
                      key={item.id}
                      id={item.id}
                      index={index}
                      name={item.name}
                      color={item.color}
                      isPersisted={item.isPersisted}
                      isActive={currentIds.includes(item.id)}
                      canEdit={canEdit}
                      onSelect={() => handleSelect(item.id)}
                      onDeselect={() => handleDeselect(item.id)}
                      onEdit={() => handleEdit(item.id)}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>
            <Droppable droppableId="labels:hack" type={DroppableTypes.LABEL}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={s.droppableHack}
                >
                  {placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        {canEdit && <Button style={ButtonStyle.NoBackground} content={t('action.createNewLabel')} onClick={handleAddClick} />}
      </Popup.Content>
    </>
  );
});

LabelsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  canEdit: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  title: 'common.labels',
  canEdit: true, // TODO change to required here and simmilar places
  onBack: undefined,
};

export default LabelsStep;
