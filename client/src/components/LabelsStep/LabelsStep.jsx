import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import { useField, useSteps } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle, Icon, IconSize, IconType } from '../Utils';
import AddStep from './AddStep';
import EditStep from './EditStep';
import Item from './Item';

import * as gs from '../../global.module.scss';
import * as s from './LabelsStep.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const LabelsStep = React.memo(({ items, currentIds, title, canEdit, onSelect, onDeselect, onCreate, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [sortedItems, setSortedItems] = useState([]);

  const sortItems = useCallback(() => {
    setSortedItems(
      [...items].sort((a, b) => {
        const aIsActive = currentIds.includes(a.id);
        const bIsActive = currentIds.includes(b.id);
        return bIsActive - aIsActive;
      }),
    );
  }, [items, currentIds]);

  useEffect(() => {
    sortItems();
  }, [sortItems]);

  const filteredItems = useMemo(() => sortedItems.filter((label) => (label.name && label.name.toLowerCase().includes(cleanSearch)) || label.color.includes(cleanSearch)), [sortedItems, cleanSearch]);

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
    searchField.current?.focus({ preventScroll: true });
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
        <div className={s.inputWrapper}>
          <Input ref={searchField} style={InputStyle.FullWidth} value={search} placeholder={t('common.searchLabels')} onChange={handleSearchChange} />
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('action.createNewLabel')} onClick={handleAddClick} className={s.addButton}>
              <Icon type={IconType.Plus} size={IconSize.Size14} />
            </Button>
          )}
        </div>
        <div className={classNames(s.items, gs.scrollableY)}>
          {filteredItems.map((item) => (
            <Item
              key={item.id}
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
        </div>
      </Popup.Content>
    </>
  );
});

LabelsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  title: 'common.labels',
  onBack: undefined,
};

export default LabelsStep;
