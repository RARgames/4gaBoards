import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../../constants/LabelColors';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Input, InputStyle } from '../../Utils';

import * as bs from '../../../backgrounds.module.scss';
import * as s from './CalendarSettings.module.scss';

const INSTANCE_WIDE = 'instanceWide';

// Adds a calendar by its secret .ics address. The server proves the address reachable before
// storing it, so a typo surfaces here rather than as a calendar that silently shows nothing.
const IcalFeedForm = React.memo(({ projects, isSubmitting, onSubmit }) => {
  const [t] = useTranslation();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(LabelColors[0]);
  const [projectId, setProjectId] = useState(INSTANCE_WIDE);

  const projectOptions = [{ id: INSTANCE_WIDE, name: t('common.allProjects') }, ...projects.map((project) => ({ id: project.id, name: project.name }))];

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!url.trim() || !name.trim()) {
        return;
      }

      const created = await onSubmit({ feedUrl: url.trim(), name: name.trim(), color, projectId: projectId === INSTANCE_WIDE ? null : projectId });

      if (created) {
        setUrl('');
        setName('');
      }
    },
    [url, name, color, projectId, onSubmit],
  );

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="icalFeedUrl">
          {t('common.icalFeedUrl')}
        </label>
        <Input id="icalFeedUrl" style={InputStyle.FullWidth} value={url} placeholder={t('common.icalFeedUrlPlaceholder')} onChange={(e) => setUrl(e.target.value)} />
        <span className={s.fieldHint}>{t('common.icalFeedUrlHint')}</span>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="icalFeedName">
          {t('common.displayName')}
        </label>
        <Input id="icalFeedName" style={InputStyle.FullWidth} value={name} placeholder={t('common.icalFeedNamePlaceholder')} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className={s.fieldRow}>
        <div className={s.field}>
          <span className={s.fieldLabel}>{t('common.color')}</span>
          <div className={s.swatches}>
            {LabelColors.map((item) => (
              <button
                key={item}
                type="button"
                title={item}
                aria-label={item}
                aria-pressed={item === color}
                className={clsx(s.swatch, bs[`background${upperFirst(camelCase(item))}`], item === color && s.swatchActive)}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>

        <div className={s.field}>
          <span className={s.fieldLabel}>{t('common.showOn')}</span>
          <Dropdown
            style={DropdownStyle.Default}
            options={projectOptions}
            defaultItem={projectOptions.find((option) => option.id === projectId)}
            placeholder={t('common.allProjects')}
            onChange={(item) => setProjectId(item.id)}
          />
        </div>
      </div>

      <Button style={ButtonStyle.Submit} type="submit" content={t('action.addCalendar')} disabled={isSubmitting || !url.trim() || !name.trim()} />
    </form>
  );
});

IcalFeedForm.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default IcalFeedForm;
