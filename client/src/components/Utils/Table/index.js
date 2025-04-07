import { DefaultCellRenderer, NumberCellRenderer, BoolCellRenderer, ImageCellRenderer, MarkdownCellRenderer, DateCellRenderer, ActionsHeaderRenderer } from './Renderers';
import SortingFns from './SortingFns';
import Table from './Table';
import { Wrapper, Header, HeaderRow, HeaderCell, Resizer, SortingIndicator, Body, Row, Cell } from './TableElements';
import TableStyle from './TableStyle';

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

export default Table;
