import { createContext } from 'react';

// §6.7: the live card-drag destination — `{ draggableId, destination }`, straight from
// react-beautiful-dnd's onDragUpdate payload, or `null` when no card is being dragged (or the
// drag has no valid destination). Board.jsx is the sole provider; List.jsx reads this to render
// a placement-preview ghost in whichever list is the current destination.
//
// This is deliberately NOT in Redux: it changes on every pointer move during a drag, and running
// that through the store would re-render the entire connected component tree per frame. A
// context confines re-renders to components that actually call useContext(DragPreviewContext).
const DragPreviewContext = createContext(null);

export default DragPreviewContext;
