import React, { useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import remarkGithub from 'remark-github';

import { PreferredFonts } from '../../../constants/Enums';
import MDSettings from './MDSettings';

import * as s from './MD.module.scss';

const MDPreview = React.forwardRef(({ source, isGithubConnected, githubRepo, preferredDetailsFont, className, ...props }, ref) => {
  const remarkPlugins = isGithubConnected ? [[remarkGithub, { repository: githubRepo }]] : null;
  const isMonospaceSelected = preferredDetailsFont === PreferredFonts.MONOSPACE;

  const handleClick = useCallback((e) => {
    const link = e.target?.closest('a');
    if (link) {
      e.stopPropagation(); // Prevent opening MDEditor, prevent card switch in ListView
    }
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={handleClick}>
      {}
      <MDEditor.Markdown
        ref={ref}
        source={source}
        remarkPlugins={remarkPlugins}
        rehypePlugins={MDSettings.rehypePlugins}
        className={clsx(className, s.preview, isMonospaceSelected && s.fontMonospace)}
        {...props} // eslint-disable-line react/jsx-props-no-spreading
      />
    </div>
  );
});

MDPreview.propTypes = {
  source: PropTypes.string,
  isGithubConnected: PropTypes.bool,
  githubRepo: PropTypes.string,
  preferredDetailsFont: PropTypes.string.isRequired,
  className: PropTypes.string,
};

MDPreview.defaultProps = {
  source: undefined,
  isGithubConnected: false,
  githubRepo: '',
  className: undefined,
};

export default React.memo(MDPreview);
