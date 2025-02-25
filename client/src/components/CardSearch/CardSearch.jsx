import React, { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useField } from '../../hooks';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';

import * as s from './CardSearch.module.scss';

const CardSearch = React.memo(({ defaultValue, onBoardSearchParamsUpdate }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);

  const submit = useCallback(
    (val) => {
      onBoardSearchParamsUpdate({ query: val });
    },
    [onBoardSearchParamsUpdate],
  );

  const handleSubmit = useCallback(() => {
    submit(value);
  }, [submit, value]);

  const handleCancel = useCallback(() => {
    setValue('');
    submit('');
  }, [setValue, submit]);

  const handleChange = useCallback(
    (event) => {
      handleFieldChange(event);
      submit(event.target.value);
    },
    [handleFieldChange, submit],
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          handleSubmit();
          break;
        case 'Escape':
          handleCancel();
          break;
        default:
      }
    },
    [handleCancel, handleSubmit],
  );

  useEffect(() => {
    setValue(defaultValue);
    submit(defaultValue);
  }, [defaultValue, setValue, submit]);

  return (
    <div>
      <Form onKeyDown={handleKeyDown}>
        <Input ref={field} value={value} className={s.field} onChange={handleChange} placeholder={t('common.filterCards')} onFocus={handleFocus} />
        {value !== '' && (
          <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleCancel} className={s.clearButton}>
            <Icon type={IconType.Close} size={IconSize.Size10} />
          </Button>
        )}
      </Form>
    </div>
  );
});

CardSearch.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onBoardSearchParamsUpdate: PropTypes.func.isRequired,
};

export default CardSearch;
