import React, { useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import remarkGithub from 'remark-github';

import MDSettings from './MDSettings';

const MDPreview = React.forwardRef(({ source, isGithubConnected, githubRepo, className, ...props }, ref) => {
  const remarkPlugins = isGithubConnected ? [[remarkGithub, { repository: githubRepo }]] : null;

  const handleClick = useCallback((e) => {
    const link = e.target?.closest('a');
    if (link) {
      e.stopPropagation(); // Prevent opening MDEditor, prevent card switch in ListView
    }
  }, []);

  return (
    // TODO temp removed s.preview
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={handleClick}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <MDEditor.Markdown ref={ref} source={source} remarkPlugins={remarkPlugins} rehypePlugins={MDSettings.rehypePlugins} className={classNames(className)} {...props} />
    </div>
  );
});

MDPreview.propTypes = {
  source: PropTypes.string,
  isGithubConnected: PropTypes.bool,
  githubRepo: PropTypes.string,
  className: PropTypes.string,
};

MDPreview.defaultProps = {
  source: undefined,
  isGithubConnected: false,
  githubRepo: '',
  className: undefined,
};

export default React.memo(MDPreview);
