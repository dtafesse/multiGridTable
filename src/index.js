import React, {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  Fragment
} from "react";
import ReactDOM from "react-dom";
import range from "lodash/range";
import makeStyles from "@material-ui/styles/makeStyles";
import AutoSizer from "react-virtualized-auto-sizer";

import { FixedSizeList as List } from "react-window";
import { FixedSizeGrid as Grid } from "react-window";
import { TableCell, Table, Paper } from "@material-ui/core";

const cellHeight = 40;
const cellWidth = 200;

// some css-in-jss courtesy of `@material-ui/styles`
const useStyles = makeStyles({
  app: {
    display: "flex",
    flexDirection: "column"
  },
  multigrid: {
    marginTop: 8,
    flexGrow: 1,
    height: 500,
    position: "relative"
  },
  columnLabels: {
    // absolutely position the label and move it down `cellWidth`
    position: "absolute !important",
    borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#eeeeee",

    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  grid: {
    // absolutely position the label and move it down `cellWidth` and `cellHeight`
    position: "absolute !important",
    top: cellHeight + 2
  },
  cell: {
    height: cellHeight,
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    fontFamily: "Arial"
  }
});

// some `const`s for the fake data
const rows = 1000;
const columns = 15;

// set up the fake data
const bunchOfData = range(rows).map(i =>
  range(columns)
    .map(j => String.fromCharCode(j + 65))
    .map(letter => `${letter}${i}`)
);

// this is the render function for the column labels
function ColumnLabel({ index: columnIndex, style }) {
  const classes = useStyles();

  const column = String.fromCharCode(columnIndex + 65);
  return (
    <TableCell component="div" className={classes.cell} style={style}>
      {column}
    </TableCell>
  );
}

// this is the render function for the grid labels
function GridCell({ columnIndex, rowIndex, style }) {
  const classes = useStyles();

  const cell = bunchOfData[rowIndex][columnIndex];

  return (
    <TableCell className={classes.cell} style={style} component="div">
      Item {cell}
    </TableCell>
  );
}

// this is the main App component
function App() {
  const classes = useStyles();

  // set up some shared state between the scrollX and scrollY
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // set up some refs so we can have access to `.scrollTo`
  // https://react-window.now.sh/#/examples/list/scroll-to-item
  const columnLabelRef = useRef(null);
  const gridRef = useRef(null);

  // create event handlers for the `onScroll` events.
  // NOTE: they are wrapped in `useCallback` for performance reasons
  const handleGridScroll = useCallback(e => {
    // from the official docs:
    // > scrollUpdateWasRequested is a boolean.
    // > This value is true if the scroll was caused by scrollTo() or scrollToItem(),
    // > And false if it was the result of a user interaction in the browser.
    //
    // so we want to ignore events that were from `scrollTo`
    if (e.scrollUpdateWasRequested) return;

    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
  }, []);

  const handleColumnLabelScroll = useCallback(e => {
    // see comment above
    if (e.scrollUpdateWasRequested) return;

    setScrollX(e.scrollOffset);
  }, []);

  // last, but not least, add an effect to watch for changes in `scrollX` or `scrollY`.
  // if there is a change, then call `scrollTo`
  useLayoutEffect(() => {
    if (columnLabelRef && columnLabelRef.current) {
      columnLabelRef.current.scrollTo(scrollX);
    }

    if (gridRef && gridRef.current) {
      gridRef.current.scrollTo({
        scrollLeft: scrollX,
        scrollTop: scrollY
        // behavior: 'auto'
      });
    }
  }, [scrollY, scrollX]);

  return (
    <Paper>
      <Table component="div" className={classes.multigrid}>
        <AutoSizer>
          {({ width, height }) => {
            return (
              <Fragment>
                <List
                  className={classes.columnLabels}
                  height={cellHeight}
                  itemSize={cellWidth}
                  width={width}
                  layout="horizontal"
                  itemCount={columns}
                  onScroll={handleColumnLabelScroll}
                  ref={columnLabelRef}
                >
                  {ColumnLabel}
                </List>
                <Grid
                  className={classes.grid}
                  columnCount={columns}
                  columnWidth={cellWidth}
                  height={height - cellHeight}
                  width={width}
                  rowCount={rows}
                  rowHeight={cellHeight}
                  onScroll={handleGridScroll}
                  ref={gridRef}
                >
                  {GridCell}
                </Grid>
              </Fragment>
            );
          }}
        </AutoSizer>
      </Table>
    </Paper>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
