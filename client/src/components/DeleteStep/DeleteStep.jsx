import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonStyle, Popup } from '../Utils';

import * as styles from './DeleteStep.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const DeleteStep = React.memo(({ title, content, buttonContent, onConfirm, onBack }) => (
  <>
    <Popup.Header onBack={onBack}>{title}</Popup.Header>
    <Popup.Content>
      <div className={styles.content}>{content}</div>
      <div className={gStyles.controlsCenter}>
        <Button style={ButtonStyle.Cancel} content={buttonContent} onClick={onConfirm} className={styles.deleteButton} />
      </div>
    </Popup.Content>
  </>
));

DeleteStep.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonContent: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

DeleteStep.defaultProps = {
  onBack: undefined,
};

export default DeleteStep;
