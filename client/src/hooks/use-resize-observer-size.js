import { useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { ResizeObserverSizeTypes } from '../constants/Enums';

export default (target, type) => {
  const [size, setSize] = useState();

  switch (type) {
    case ResizeObserverSizeTypes.CLIENT_HEIGHT: {
      useResizeObserver(target, (entry) => setSize(entry.target.clientHeight));
      break;
    }
    case ResizeObserverSizeTypes.CLIENT_WIDTH: {
      useResizeObserver(target, (entry) => setSize(entry.target.clientWidth));
      break;
    }
    case ResizeObserverSizeTypes.OFFSET_HEIGHT: {
      useResizeObserver(target, (entry) => setSize(entry.target.offsetHeight));
      break;
    }
    case ResizeObserverSizeTypes.OFFSET_WIDTH: {
      useResizeObserver(target, (entry) => setSize(entry.target.offsetWidth));
      break;
    }
    case ResizeObserverSizeTypes.SCROLL_HEIGHT: {
      useResizeObserver(target, (entry) => setSize(entry.target.scrollHeight));
      break;
    }
    case ResizeObserverSizeTypes.SCROLL_WIDTH: {
      useResizeObserver(target, (entry) => setSize(entry.target.scrollWidth));
      break;
    }
    case ResizeObserverSizeTypes.SCROLLABLE: {
      useResizeObserver(target, (entry) => setSize(entry.target.scrollHeight > entry.target.offsetHeight));
      break;
    }
    default:
      setSize(undefined);
      break;
  }
  return [size];
};
