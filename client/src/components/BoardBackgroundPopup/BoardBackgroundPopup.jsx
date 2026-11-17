import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import BackgroundPane from '../Settings/ProjectSettings/BackgroundPane';
import { Popup, withPopup } from '../Utils';

import * as s from './BoardBackgroundStep.module.scss';

const BoardBackgroundStep = React.memo(({ board, onUpdate, onImageUpdate, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.setBackgroundAndThumbnail')}</Popup.Header>
      <Popup.Content>
        <div>{t('common.background')}</div>
        <BackgroundPane
          item={board.background}
          imageCoverUrl={board.backgroundImage?.coverUrl}
          isImageUpdating={board.isBackgroundImageUpdating}
          onUpdate={(background) => onUpdate({ background })}
          onImageUpdate={(data) => onImageUpdate({ target: 'background', ...data })}
          onImageDelete={() => onUpdate({ backgroundImage: null })}
        />
        <div className={s.secondTitle}>{t('common.thumbnail')}</div>
        <BackgroundPane
          item={board.thumbnail}
          isThumbnail
          imageCoverUrl={board.thumbnailImage?.coverUrl}
          isImageUpdating={board.isBackgroundImageUpdating}
          onUpdate={(thumbnail) => onUpdate({ thumbnail })}
          onImageUpdate={(data) => onImageUpdate({ target: 'thumbnail', ...data })}
          onImageDelete={() => onUpdate({ thumbnailImage: null })}
        />
      </Popup.Content>
    </>
  );
});

BoardBackgroundStep.propTypes = {
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onImageUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

BoardBackgroundStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(BoardBackgroundStep);
export { BoardBackgroundStep };
