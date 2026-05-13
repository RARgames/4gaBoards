import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useField, useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import RenameStep from '../RenameStep';
import { Popup, Input, InputStyle, Button, ButtonVariant, Icon, IconSize, IconType } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './BoardTemplateManagerStep.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  DELETE: 'DELETE',
};

const BoardTemplateManagerStep = React.memo(({ templates, isAdmin, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const searchField = useRef(null);

  const filteredTemplates = useMemo(() => templates.filter((template) => template.name.toLowerCase().includes(cleanSearch)), [templates, cleanSearch]);

  useEffect(() => {
    searchField.current?.focus({ preventScroll: true });
  }, []);

  const handleRenameClick = useCallback(
    (template) => {
      openStep(StepTypes.RENAME, { template });
    },
    [openStep],
  );

  const handleDeleteClick = useCallback(
    (template) => {
      openStep(StepTypes.DELETE, { template });
    },
    [openStep],
  );

  const handleToggleTemplateScopeClick = useCallback(
    (template) => {
      onUpdate(template.id, { isGlobal: !template.isGlobal });
    },
    [onUpdate],
  );

  const handleRename = useCallback(
    (templateId, data) => {
      onUpdate(templateId, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (templateId) => {
      onDelete(templateId);
      handleBack();
    },
    [onDelete, handleBack],
  );

  if (step) {
    switch (step.type) {
      case StepTypes.RENAME:
        return (
          <RenameStep
            title={t('common.renameTemplate')}
            defaultData={{ name: step.params.template.name }}
            placeholder={t('common.enterTemplateName')}
            onUpdate={(name) => handleRename(step.params.template.id, name)}
            onBack={handleBack}
            onClose={handleBack}
          />
        );
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteTemplate_title', { name: step.params.template.name })}
            content={t('common.areYouSureYouWantToDeleteThisTemplate')}
            buttonContent={t('action.delete')}
            onConfirm={() => handleDelete(step.params.template.id)}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.boardTemplates')}</Popup.Header>
      <Popup.Content className={s.content}>
        <div className={s.inputWrapper}>
          <Input ref={searchField} style={InputStyle.FullWidth} value={search} placeholder={t('common.filterTemplates')} onChange={handleSearchChange} />
        </div>
        {filteredTemplates.length > 0 ? (
          <div className={clsx(s.items, gs.scrollableY)}>
            {filteredTemplates.map((template) => {
              const canManage = !template.isGlobal || isAdmin;
              const listNames = template.data?.lists?.map((list) => list.name).filter(Boolean) || [];
              const labelNames = template.data?.labels?.map((label) => label.name).filter(Boolean) || [];
              const listsText = listNames.length > 0 ? `${t('common.lists', { count: listNames.length })}: ${listNames.join(', ')}` : t('common.lists', { count: 0 });
              const labelsText = labelNames.length > 0 ? `${t('common.labels', { count: labelNames.length })}: ${labelNames.join(', ')}` : t('common.labels', { count: 0 });

              return (
                <div key={template.id} className={s.item}>
                  <div className={s.itemHeader}>
                    <div className={s.name}>
                      {template.isGlobal && <Icon type={IconType.Star} size={IconSize.Size12} className={s.globalIcon} />}
                      <span className={s.nameText}>{template.name}</span>
                      {template.isGlobal && <span className={s.globalBadge}>{t('common.global')}</span>}
                    </div>
                    <div className={s.actions}>
                      {isAdmin && (
                        <Button variant={ButtonVariant.Icon} title={t('common.toggleGlobal')} onClick={() => handleToggleTemplateScopeClick(template)} className={s.button}>
                          <Icon type={template.isGlobal ? IconType.StarOutline : IconType.Star} size={IconSize.Size12} />
                        </Button>
                      )}
                      {canManage && (
                        <Button variant={ButtonVariant.Icon} title={t('common.renameTemplate')} onClick={() => handleRenameClick(template)} className={s.button}>
                          <Icon type={IconType.Pencil} size={IconSize.Size12} />
                        </Button>
                      )}
                      {canManage && (
                        <Button variant={ButtonVariant.Icon} title={t('common.deleteTemplate')} onClick={() => handleDeleteClick(template)} className={s.button}>
                          <Icon type={IconType.Trash} size={IconSize.Size12} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className={s.meta}>
                    <div className={s.metaDetails} title={listsText}>
                      {listsText}
                    </div>
                    <div className={s.metaDetails} title={labelsText}>
                      {labelsText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={s.noTemplates}>{t('common.noTemplates')}</div>
        )}
      </Popup.Content>
    </>
  );
});

BoardTemplateManagerStep.propTypes = {
  templates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

BoardTemplateManagerStep.defaultProps = {
  onBack: undefined,
};

export default BoardTemplateManagerStep;
