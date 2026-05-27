import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { isLink, normalizeLink, beautifyLink } from '../../../utils/url';
import ExternalLink from '../ExternalLink';
import { Icon, IconType, IconSize } from '../Icon';

import * as s from './LinkifiedTextRenderer.module.scss';

const LinkifiedTextRenderer = React.memo(({ text, isInline, wrapperClassName, linkClassName, iconClassName }) => {
  const parts = text?.split(/(\s+)/);

  return parts?.map((part, i) => {
    if (isLink(part)) {
      const normalized = normalizeLink(part);

      if (normalized) {
        const key = `${part}-${i}`;

        if (isInline) {
          return (
            <ExternalLink key={key} href={normalized.href} className={clsx(s.wrapper, wrapperClassName, linkClassName)} data-prevent-card-switch>
              {beautifyLink(part)}
            </ExternalLink>
          );
        }

        return (
          <span key={key} className={clsx(s.wrapper, wrapperClassName)}>
            <ExternalLink href={normalized.href} className={linkClassName} data-prevent-card-switch>
              <Icon type={IconType.Link} size={IconSize.Size13} className={clsx(s.icon, iconClassName)} />
            </ExternalLink>
            {beautifyLink(part)}
          </span>
        );
      }
    }

    return part;
  });
});

LinkifiedTextRenderer.propTypes = {
  text: PropTypes.string,
  isInline: PropTypes.bool,
  wrapperClassName: PropTypes.string,
  linkClassName: PropTypes.string,
  iconClassName: PropTypes.string,
};

LinkifiedTextRenderer.defaultProps = {
  text: '',
  isInline: false,
  wrapperClassName: undefined,
  linkClassName: undefined,
  iconClassName: undefined,
};

export default LinkifiedTextRenderer;
