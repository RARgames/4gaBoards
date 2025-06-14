import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { MDPreview } from '../../Markdown';

import * as gs from '../../../../global.module.scss';
import * as s from './MarkdownCell.module.scss';

const MarkdownCell = React.memo(({ value, cellClassName, isGithubConnected, githubRepo, preferredDetailsFont }) => {
  return (
    <div className={cellClassName}>
      <div className={classNames(s.markdownWrapper, gs.scrollableY)}>
        {value && <MDPreview source={value} isGithubConnected={isGithubConnected} githubRepo={githubRepo} preferredDetailsFont={preferredDetailsFont} className={s.markdown} />}
      </div>
    </div>
  );
});

MarkdownCell.propTypes = {
  value: PropTypes.string,
  cellClassName: PropTypes.string,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
};

MarkdownCell.defaultProps = {
  value: '',
  cellClassName: '',
};

export default MarkdownCell;
