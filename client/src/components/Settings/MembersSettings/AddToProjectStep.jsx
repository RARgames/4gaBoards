import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, Form, Popup, withPopup } from '../../Utils';

import * as gs from '../../../global.module.scss';

const AddToProjectStep = React.memo(({ projects, onSelect, onClose }) => {
  const [t] = useTranslation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [asManager, setAsManager] = useState(false);

  const options = projects.map((project) => ({ id: project.id, name: project.name }));

  const handleAsManagerChange = useCallback((e) => {
    setAsManager(e.target.checked);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedItems.length === 0) {
      return;
    }

    onSelect(
      selectedItems.map((item) => item.id),
      asManager,
    );
    onClose();
  }, [selectedItems, asManager, onSelect, onClose]);

  return (
    <>
      <Popup.Header>{t('common.addToProject', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent>
        <Form>
          <Dropdown style={DropdownStyle.FullWidth} options={options} placeholder={t('common.pickProject')} isMultiple defaultItems={selectedItems} onChange={setSelectedItems} />
          <div className={gs.controlsSpaceBetween}>
            <label htmlFor="asProjectManager">
              <Checkbox id="asProjectManager" checked={asManager} onChange={handleAsManagerChange} />
              {t('common.asProjectManager')}
            </label>
          </div>
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.addMember')} onClick={handleSubmit} disabled={selectedItems.length === 0} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddToProjectStep.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(AddToProjectStep);
