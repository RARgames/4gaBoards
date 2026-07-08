import React, { useCallback, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import remarkGithub from 'remark-github';

import { PreferredFonts } from '../../../constants/Enums';
import MDSettings from './MDSettings';
import wikiLinkPlugin from './wiki-link-plugin';

import * as s from './MD.module.scss';

const MDPreview = React.forwardRef(({ source, isGithubConnected, githubRepo, preferredDetailsFont, wikiPages, wikiBasePath, className, ...props }, ref) => {
  const remarkPlugins = useMemo(() => {
    const plugins = [];

    if (isGithubConnected) {
      plugins.push([remarkGithub, { repository: githubRepo }]);
    }

    if (wikiPages) {
      plugins.push([wikiLinkPlugin, { wikiPages, basePath: wikiBasePath }]);
    }

    return plugins.length > 0 ? plugins : null;
  }, [isGithubConnected, githubRepo, wikiPages, wikiBasePath]);

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
  wikiPages: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  wikiBasePath: PropTypes.string,
  className: PropTypes.string,
};

MDPreview.defaultProps = {
  source: undefined,
  isGithubConnected: false,
  githubRepo: '',
  wikiPages: undefined,
  wikiBasePath: undefined,
  className: undefined,
};

export default React.memo(MDPreview);
