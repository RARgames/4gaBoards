import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Progress } from 'semantic-ui-react';
import { useToggle } from '../../lib/hooks';
import { Icon, IconType, IconSize } from '../Utils/Icon';

import styles from './Tasks.module.scss';

const Tasks = React.memo(({ items }) => {
  const [t] = useTranslation();
  const [isOpened, toggleOpened] = useToggle();

  const handleToggleClick = useCallback(
    (event) => {
      event.preventDefault();

      toggleOpened();
    },
    [toggleOpened],
  );

  const completedItems = items.filter((item) => item.isCompleted);

  const getTaskbarColor = () => {
    const percentage = (completedItems.length / items.length) * 100;
    if (percentage < 25) {
      return 'red';
    }
    if (percentage < 50) {
      return 'orange';
    }
    if (percentage < 75) {
      return 'yellow';
    }
    if (percentage < 90) {
      return 'olive';
    }
    return 'green';
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-static-element-interactions */}
      <div className={styles.button} onClick={handleToggleClick}>
        <span className={styles.progressWrapper}>
          <Progress autoSuccess value={completedItems.length} total={items.length} color={getTaskbarColor()} size="tiny" className={styles.progress} />
        </span>
        <span className={styles.count} title={isOpened ? t('common.hideTasks') : t('common.showTasks')}>
          {completedItems.length}/{items.length}
          <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={classNames(styles.countToggleIcon, isOpened && styles.countToggleIconOpened)} />
        </span>
      </div>
      {isOpened && (
        <ul className={styles.tasks}>
          {items.map((item) => (
            <li key={item.id} className={classNames(styles.task, item.isCompleted && styles.taskCompleted)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
});

Tasks.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Tasks;
