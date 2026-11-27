import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function VideoItem({ url, className, errorClassName }) {
  const [t] = useTranslation();
  const [isFailed, setIsFailed] = useState(false);

  const handleError = useCallback(() => {
    setIsFailed(true);
  }, []);

  if (isFailed) {
    return <span className={errorClassName}>{t('common.thereIsNoPreviewAvailableForThisAttachment')}</span>;
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={url} controls preload="metadata" className={className} onError={handleError} />
  );
}

VideoItem.propTypes = {
  url: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  errorClassName: PropTypes.string.isRequired,
};

export default VideoItem;
