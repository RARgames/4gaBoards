import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useField } from '../../hooks';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';

import * as s from './CardSearch.module.scss';

const CardSearch = React.memo(({ defaultValue, matchCase, anyMatch, onBoardSearchParamsUpdate }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const [matchCaseValue, setMatchCaseValue] = useState(matchCase);
  const [anyMatchValue, setAnyMatchValue] = useState(anyMatch);

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
    (e) => {
      handleFieldChange(e);
      submit(e.target.value);
    },
    [handleFieldChange, submit],
  );

  const handleMatchCaseChange = useCallback(() => {
    setMatchCaseValue(!matchCaseValue);
    onBoardSearchParamsUpdate({ matchCase: !matchCaseValue });
  }, [matchCaseValue, onBoardSearchParamsUpdate]);

  const handleAnyMatchChange = useCallback(() => {
    setAnyMatchValue(!anyMatchValue);
    onBoardSearchParamsUpdate({ anyMatch: !anyMatchValue });
  }, [anyMatchValue, onBoardSearchParamsUpdate]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter':
          handleSubmit();
          break;
        case 'Escape':
          handleCancel();
          break;
        case 'c':
          if (e.altKey) {
            e.preventDefault();
            handleMatchCaseChange();
          }
          break;
        case 'v':
          if (e.altKey) {
            e.preventDefault();
            handleAnyMatchChange();
          }
          break;
        default:
      }
    },
    [handleAnyMatchChange, handleCancel, handleMatchCaseChange, handleSubmit],
  );

  useEffect(() => {
    setValue(defaultValue);
    setMatchCaseValue(matchCase);
    setAnyMatchValue(anyMatch);
  }, [anyMatch, defaultValue, matchCase, setValue]);

  return (
    <>
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
      <div className={s.paramsWrapper}>
        <Button title={t('common.matchCase')} className={clsx(s.paramsButton, matchCaseValue && s.paramsButtonActive)} onClick={handleMatchCaseChange}>
          <Icon type={IconType.MatchCase} size={IconSize.Size13} />
        </Button>
        <Button title={t('common.anyMatch')} className={clsx(s.paramsButton, anyMatchValue && s.paramsButtonActive)} onClick={handleAnyMatchChange}>
          <Icon type={IconType.AnyMatch} size={IconSize.Size13} />
        </Button>
      </div>
    </>
  );
});

CardSearch.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  matchCase: PropTypes.bool.isRequired,
  anyMatch: PropTypes.bool.isRequired,
  onBoardSearchParamsUpdate: PropTypes.func.isRequired,
};

export default CardSearch;
