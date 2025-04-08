import { DefaultCellRenderer, NumberCellRenderer, BoolCellRenderer, ImageCellRenderer, MarkdownCellRenderer, DateCellRenderer, ActionsHeaderRenderer } from './Renderers';
import SortingFns from './SortingFns';
import Table from './Table';
import { Wrapper, Header, HeaderRow, HeaderCell, Resizer, SortingIndicator, Body, Row, Cell } from './TableElements';
import TableStyle from './TableStyle';
import useTableHooksPost from './use-table-hooks-post';
import useTableHooksPre from './use-table-hooks-pre';
import useTableHooksState from './use-table-state-hooks';

Table.Wrapper = Wrapper;
Table.Header = Header;
Table.HeaderRow = HeaderRow;
Table.HeaderCell = HeaderCell;
Table.Resizer = Resizer;
Table.SortingIndicator = SortingIndicator;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Style = TableStyle;
Table.Renderers = {
  DefaultCellRenderer,
  NumberCellRenderer,
  BoolCellRenderer,
  ImageCellRenderer,
  MarkdownCellRenderer,
  DateCellRenderer,
  ActionsHeaderRenderer,
};
Table.SortingFns = SortingFns;
Table.HooksState = useTableHooksState;
Table.HooksPre = useTableHooksPre;
Table.HooksPost = useTableHooksPost;

export default Table;
