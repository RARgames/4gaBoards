import React, { useLayoutEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import User from '../../User';
import { Button, ButtonVariant } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';
import { formatLocalDate } from './mentionUtils';

import * as gs from '../../../global.module.scss';
import * as s from './MentionPopup.module.scss';

const DEFAULT_RENDERERS = {
  users: (su) => (
    <>
      <User name={su.name} avatarUrl={su.avatarUrl} size="micro" skipTitle />
      <span className={s.name}>{su.name}</span>
    </>
  ),
  labels: (su) => (
    <>
      <span className={s.labelColor} style={{ backgroundColor: su.color }} />
      <span className={s.name}>{su.name}</span>
    </>
  ),
};

const renderPlain = (su) => <span className={s.name}>{su.name}</span>;

// 2-step calendar: date and time, 15-minute steps
const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`);
const FIRST_VISIBLE_SLOT = TIME_SLOTS.indexOf('08:00');

function DatePanel({ pickedDay, onPickDay, onBackToCalendar, onSelectDate }) {
  const [t] = useTranslation();
  const listRef = useRef(null);

  useLayoutEffect(() => {
    if (pickedDay && listRef.current) {
      const row = listRef.current.children[FIRST_VISIBLE_SLOT];
      listRef.current.scrollTop = row ? row.offsetTop - listRef.current.offsetTop : 0;
    }
  }, [pickedDay]);

  if (!pickedDay) {
    return <DatePicker inline disabledKeyboardNavigation onChange={onPickDay} />;
  }

  return (
    <div className={s.timeStep}>
      <Button variant={ButtonVariant.NoBackground} title={t('common.back')} onClick={onBackToCalendar} className={s.backButton}>
        <Icon type={IconType.AngleLeft} size={IconSize.Size14} />
        <span>{formatLocalDate(pickedDay)}</span>
      </Button>
      <Button variant={ButtonVariant.NoBackground} content={t('common.noTime')} onClick={() => onSelectDate(pickedDay)} className={clsx(s.timeSlotButton, s.timeNone)}>
        <span>{formatLocalDate(pickedDay)}</span>
      </Button>
      <div ref={listRef} className={clsx(s.timeList, gs.scrollableY)}>
        {TIME_SLOTS.map((time) => (
          <Button key={time} variant={ButtonVariant.NoBackground} className={s.timeSlotButton} content={time} onClick={() => onSelectDate(pickedDay, time)} />
        ))}
      </div>
    </div>
  );
}

DatePanel.propTypes = {
  pickedDay: PropTypes.instanceOf(Date),
  onPickDay: PropTypes.func.isRequired,
  onBackToCalendar: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
};

DatePanel.defaultProps = {
  pickedDay: null,
};

function MentionPopup({ popup }) {
  if (!popup) {
    return null;
  }

  const { trigger, isDate, suggestions, selectedIndex, itemRef, setFloating, floatingStyles, onSelect, onSelectDate, pickedDay, onPickDay, onBackToCalendar } = popup;
  const render = DEFAULT_RENDERERS[trigger.type] || renderPlain;

  return (
    <FloatingPortal>
      {isDate ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div ref={setFloating} style={floatingStyles} className={s.datePicker} onMouseDown={(e) => e.preventDefault()}>
          {/* Prevent input onBlur */}
          <DatePanel pickedDay={pickedDay} onPickDay={onPickDay} onBackToCalendar={onBackToCalendar} onSelectDate={onSelectDate} />
        </div>
      ) : (
        <div ref={setFloating} style={floatingStyles} className={clsx(s.dropdown, gs.scrollableY)}>
          {suggestions.map((suggestion, index) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={suggestion.id}
              ref={itemRef(index)}
              className={clsx(s.dropdownItem, index === selectedIndex && s.dropdownItemSelected)}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input onBlur
                onSelect(suggestion);
              }}
            >
              {render(suggestion)}
            </div>
          ))}
        </div>
      )}
    </FloatingPortal>
  );
}

MentionPopup.propTypes = {
  popup: PropTypes.shape({
    trigger: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }).isRequired,
    isDate: PropTypes.bool.isRequired,
    suggestions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedIndex: PropTypes.number.isRequired,
    itemRef: PropTypes.func.isRequired,
    setFloating: PropTypes.func.isRequired,
    floatingStyles: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onSelect: PropTypes.func.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    pickedDay: PropTypes.instanceOf(Date),
    onPickDay: PropTypes.func.isRequired,
    onBackToCalendar: PropTypes.func.isRequired,
  }),
};

MentionPopup.defaultProps = {
  popup: null,
};

export default React.memo(MentionPopup);
