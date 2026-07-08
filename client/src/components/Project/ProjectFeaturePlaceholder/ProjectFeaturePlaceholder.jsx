import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { Icon, IconSize } from '../../Utils';

import * as s from './ProjectFeaturePlaceholder.module.scss';

const ProjectFeaturePlaceholder = React.memo(({ icon, titleKey }) => {
  const [t] = useTranslation();

  return (
    <div className={s.wrapper}>
      <ProjectNavContainer />
      <div className={s.content}>
        <Icon type={icon} size={IconSize.Size20} className={s.icon} />
        <h1 className={s.title}>{t(titleKey)}</h1>
        <p className={s.subtitle}>{t('common.featureComingSoon')}</p>
      </div>
    </div>
  );
});

ProjectFeaturePlaceholder.propTypes = {
  icon: PropTypes.elementType.isRequired,
  titleKey: PropTypes.string.isRequired,
};

export default ProjectFeaturePlaceholder;
