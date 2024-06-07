import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Grid } from 'semantic-ui-react';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { ProjectBackgroundTypes } from '../../constants/Enums';

import styles from './Projects.module.scss';
import globalStyles from '../../styles.module.scss';
import ProjectAddPopup from '../ProjectAddPopup';

const Projects = React.memo(({ items, canAdd, defaultData, isSubmitting, onCreate }) => {
  const [t] = useTranslation();
  const projectAdd = useRef(null);

  const handleProjectAdd = useCallback(() => {
    if (canAdd) {
      projectAdd.current?.open();
    }
  }, [canAdd]);

  return (
    <Container className={styles.cardsWrapper}>
      <Grid className={styles.gridFix}>
        {items.map((item) => (
          <Grid.Column key={item.id} mobile={8} computer={4}>
            <Link to={item.firstBoardId ? Paths.BOARDS.replace(':id', item.firstBoardId) : Paths.PROJECTS.replace(':id', item.id)}>
              <div
                className={classNames(
                  styles.card,
                  styles.open,
                  item.background && item.background.type === ProjectBackgroundTypes.GRADIENT && globalStyles[`background${upperFirst(camelCase(item.background.name))}`],
                )}
                style={{
                  background: item.background && item.background.type === 'image' && `url("${item.backgroundImage.coverUrl}") center / cover`,
                }}
              >
                {item.notificationsTotal > 0 && <span className={styles.notification}>{item.notificationsTotal}</span>}
                <div className={styles.cardOverlay} />
                <div className={styles.openTitle}>{item.name}</div>
              </div>
            </Link>
          </Grid.Column>
        ))}
        {canAdd && (
          <Grid.Column mobile={8} computer={4}>
            <ProjectAddPopup ref={projectAdd} defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate}>
              <Button style={ButtonStyle.Icon} title={t('common.createProject')} onClick={handleProjectAdd} className={classNames(styles.card, styles.add)}>
                <Icon type={IconType.Plus} size={IconSize.Size20} className={styles.addGridIcon} />
                {t('common.createProject')}
              </Button>
            </ProjectAddPopup>
          </Grid.Column>
        )}
      </Grid>
    </Container>
  );
});

Projects.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canAdd: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default Projects;
