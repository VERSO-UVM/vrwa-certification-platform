import { useState } from "react";
import type {
  RowSelectionState,
  Updater,
  OnChangeFn,
} from "@tanstack/react-table";

/**
 * Utility for managing a single selected row with react table.
 *
 * @returns two arrays that are the same as react useState results. The first
 *          contains the actual selected row (and a setter), and the second
 *          contains the values that must be passed to react table in order to
 *          hoist the state.
 * Pass to react table options
 * ```tsx
 *  {
 *    onRowSelectionChange: reactTableSelectionChange,
 *    state: {
 *      rowSelection: reactTableRowSelection,
 *    },
      enableMultiRowSelection: false,
 *  }
 * ```
 * 
 */
export function useReactTableRowSelect(): [
  [number, OnChangeFn<number>],
  [RowSelectionState, OnChangeFn<RowSelectionState>],
] {
  // TODO: cache default/initial row selection in browser storage
  const [selectedRow, setSelectedRow] = useState<number>(0);

  const reactTableSelectionState = {
    [selectedRow.toString()]: true,
  } as RowSelectionState;

  const reactTableOnSelectionChange = (updater: Updater<RowSelectionState>) => {
    // The react state set* functions can accept a value or a function that returns
    // the value
    const newSelectionState =
      updater instanceof Function ? updater(reactTableSelectionState) : updater;

    const [selection, ...rest] = Object.entries(newSelectionState)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => parseInt(id));

    // Require a row to be selected always
    if (selection != null && rest.length == 0) {
      setSelectedRow(selection);
    }
  };

  return [
    [selectedRow, setSelectedRow],
    [reactTableSelectionState, reactTableOnSelectionChange],
  ];
}
