const getEditableElement = (target) => {
  if (!(target instanceof window.HTMLElement)) {
    return null;
  }

  if (target.matches('input, textarea')) {
    return target;
  }

  return target.isContentEditable ? target.closest('[contenteditable]') || target : null;
};

const firefoxDndFix = (element) => {
  if (typeof navigator === 'undefined' || !navigator.userAgent.includes('Firefox')) {
    return () => {};
  }

  let isOverridden = false;
  let previousValue = null;

  const restore = () => {
    if (!isOverridden) {
      return;
    }

    if (previousValue === null) {
      element.removeAttribute('draggable');
    } else {
      element.setAttribute('draggable', previousValue);
    }

    isOverridden = false;
    previousValue = null;
  };

  const handleMouseOver = (event) => {
    const editableElement = getEditableElement(event.target);

    if (!editableElement) {
      // Also recovers if the editable element was removed while hovered (no mouseout fired)
      restore();
      return;
    }

    if (isOverridden) {
      return;
    }

    previousValue = element.getAttribute('draggable');
    isOverridden = true;
    element.setAttribute('draggable', 'false');
  };

  const handleMouseOut = (event) => {
    if (!isOverridden) {
      return;
    }

    const editableElement = getEditableElement(event.target);
    const nextTarget = event.relatedTarget;

    if (editableElement && nextTarget instanceof window.Node && editableElement.contains(nextTarget)) {
      return;
    }

    restore();
  };

  element.addEventListener('mouseover', handleMouseOver);
  element.addEventListener('mouseout', handleMouseOut);

  return () => {
    element.removeEventListener('mouseover', handleMouseOver);
    element.removeEventListener('mouseout', handleMouseOut);
    restore();
  };
};

export default firefoxDndFix;
