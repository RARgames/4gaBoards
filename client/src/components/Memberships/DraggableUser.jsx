import React, { useEffect, useRef } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { dragKey, getDragData } from '../../lib/hooks/use-drop-animation';

import * as s from './DraggableUser.module.scss';

const DraggableUser = React.memo(({ id, name, avatarUrl, isDraggable, className, children }) => {
  const ref = useRef(null);
  const key = dragKey(DroppableTypes.USER, id);

  useEffect(() => {
    // DnD: user is drag handle
    const wrapper = ref.current;

    if (!wrapper) {
      return undefined;
    }

    return combine(
      draggable({
        element: wrapper,
        canDrag: () => isDraggable,
        getInitialData: ({ input }) => ({ type: DroppableTypes.USER, userId: id, name, avatarUrl, noCollapse: true, ...getDragData(wrapper, input, key) }),
      }),
    );
  }, [id, isDraggable, name, avatarUrl, key]);

  return (
    <span ref={ref} className={clsx(s.wrapper, className)}>
      {children}
    </span>
  );
});

DraggableUser.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  isDraggable: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

DraggableUser.defaultProps = {
  avatarUrl: undefined,
  isDraggable: true,
  className: undefined,
};

export default DraggableUser;
