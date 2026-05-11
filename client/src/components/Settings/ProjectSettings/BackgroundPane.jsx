import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { dequal } from 'dequal';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { ProjectBackgroundTypes } from '../../../constants/Enums';
import ProjectBackgroundGradients from '../../../constants/ProjectBackgroundGradients';
import { Button, ButtonStyle, Icon, IconType, IconSize, FilePicker } from '../../Utils';

import * as bs from '../../../backgrounds.module.scss';
import * as s from './BackgroundPane.module.scss';

const BackgroundPane = React.memo(({ item, imageCoverUrl, isImageUpdating, onUpdate, onImageUpdate, onImageDelete }) => {
  const [t] = useTranslation();

  const field = useRef(null);

  const handleGradientClick = useCallback(
    (e) => {
      const background = {
        type: ProjectBackgroundTypes.GRADIENT,
        name: e.target.value,
      };

      if (!dequal(background, item)) {
        onUpdate(background);
      }
    },
    [item, onUpdate],
  );

  const handleImageClick = useCallback(() => {
    const background = {
      type: ProjectBackgroundTypes.IMAGE,
    };

    if (!dequal(background, item)) {
      onUpdate(background);
    }
  }, [item, onUpdate]);

  const handleFileSelect = useCallback(
    (file) => {
      onImageUpdate({
        file,
      });
    },
    [onImageUpdate],
  );

  const handleDeleteImageClick = useCallback(() => {
    onImageDelete();
  }, [onImageDelete]);

  const handleRemoveClick = useCallback(() => {
    onUpdate(null);
  }, [onUpdate]);

  useEffect(() => {
    field.current?.focus();
  }, []);

  return (
    <>
      <div className={s.gradientButtons}>
        {ProjectBackgroundGradients.map((gradient) => (
          <Button
            style={ButtonStyle.NoBackground}
            key={gradient}
            name="gradient"
            value={gradient}
            className={clsx(s.gradientButton, item && item.type === ProjectBackgroundTypes.GRADIENT && gradient === item.name && s.gradientButtonActive, bs[`background${upperFirst(camelCase(gradient))}`])}
            onClick={handleGradientClick}
          />
        ))}
      </div>
      {imageCoverUrl && (
        <Button ref={field} title={t('common.background')} onClick={handleImageClick} className={s.imageButton}>
          <div className={s.imageContainer}>
            <img src={imageCoverUrl} alt={t('common.background')} className={s.image} />
            {item && item.type === 'image' && (
              <div className={s.imageSelected}>
                <Icon type={IconType.Star} size={IconSize.Size14} className={s.imageIcon} />
              </div>
            )}
          </div>
        </Button>
      )}
      <div className={s.actions}>
        <div className={s.action}>
          <FilePicker accept="image/*" onSelect={handleFileSelect}>
            <Button style={ButtonStyle.DefaultBorder} ref={field} content={t('action.uploadNewImage', { context: 'title' })} disabled={isImageUpdating} />
          </FilePicker>
        </div>
        {imageCoverUrl && (
          <div className={s.action}>
            <Button style={ButtonStyle.DefaultBorder} content={t('action.deleteImage', { context: 'title' })} disabled={isImageUpdating} onClick={handleDeleteImageClick} />
          </div>
        )}
        {item && (
          <div className={s.action}>
            <Button style={ButtonStyle.DefaultBorder} content={t('action.removeBackground', { context: 'title' })} disabled={isImageUpdating} onClick={handleRemoveClick} />
          </div>
        )}
      </div>
    </>
  );
});

BackgroundPane.propTypes = {
  item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  imageCoverUrl: PropTypes.string,
  isImageUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onImageUpdate: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func.isRequired,
};

BackgroundPane.defaultProps = {
  item: undefined,
  imageCoverUrl: undefined,
};

export default BackgroundPane;
