import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Checkbox, Popup, withPopup } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './WikiDeleteStep.module.scss';

const WikiDeleteStep = React.memo(({ page, onConfirm, onClose }) => {
  const [t] = useTranslation();
  const [withChildren, setWithChildren] = useState(false);

  const handleConfirm = useCallback(() => {
    onConfirm(withChildren);
    onClose();
  }, [withChildren, onConfirm, onClose]);

  return (
    <>
      <Popup.Header>{t('common.deleteWikiPage', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <div className={s.content}>{t('common.deleteWikiPageContent', { title: page.title })}</div>
        <label htmlFor="wikiDeleteWithChildren" className={s.checkboxLabel}>
          <Checkbox id="wikiDeleteWithChildren" checked={withChildren} onChange={(e) => setWithChildren(e.target.checked)} />
          {t('common.deleteWikiSubpagesToo')}
        </label>
        <div className={gs.controlsCenter}>
          <Button style={ButtonStyle.Cancel} content={t('action.delete')} onClick={handleConfirm} />
        </div>
      </Popup.Content>
    </>
  );
});

WikiDeleteStep.propTypes = {
  page: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(WikiDeleteStep);
