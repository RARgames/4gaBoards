import { DefaultCellRenderer, NumberCellRenderer, BoolCellRenderer, DivCellRenderer, ImageCellRenderer, MarkdownCellRenderer, DateCellRenderer, ActionsHeaderRenderer } from './Renderers';
import Table from './Table';
import { Container, Wrapper, Header, HeaderRow, HeaderCell, Resizer, SortingIndicator, Body, Row, Cell } from './TableElements';
import TablePagination from './TablePagination';
import TableStyle from './TableStyle';
import useTableHooksPost from './use-table-hooks-post';
import useTableHooksPre from './use-table-hooks-pre';
import useTableHooksSorting from './use-table-hooks-sorting';
import useTableHooksState from './use-table-hooks-state';

Table.Container = Container;
Table.Wrapper = Wrapper;
Table.Header = Header;
Table.HeaderRow = HeaderRow;
Table.HeaderCell = HeaderCell;
Table.Resizer = Resizer;
Table.SortingIndicator = SortingIndicator;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Pagination = TablePagination;
Table.Style = TableStyle;
Table.Renderers = {
  DefaultCellRenderer,
  NumberCellRenderer,
  BoolCellRenderer,
  DivCellRenderer,
  ImageCellRenderer,
  MarkdownCellRenderer,
  DateCellRenderer,
  ActionsHeaderRenderer,
};
Table.HooksSorting = useTableHooksSorting;
Table.HooksState = useTableHooksState;
Table.HooksPre = useTableHooksPre;
Table.HooksPost = useTableHooksPost;

export default Table;
