import type { RowSelectionState, Updater } from "@tanstack/react-table";

/**
 * Very simple utility but meant to pair with
 * @see getReactTableOnSelectionChange
 */
export function getRowSelectionState(selectedIndex: number) {
  return {
    [selectedIndex.toString()]: true,
  };
}

/**
 * Pass to DataTable table options with the results from useState<number>.
 *
 * ```tsx
 *  table={{
 *    onRowSelectionChange: getOnRowSelectionChange(selectedRow, setSelectedRow),
 *    state: {
 *      rowSelection: getRowSelectionState(selectedRow),
 *    },
 *  }}
 * ```
 */
export function getOnRowSelectionChange(
  currentIndex: number,
  setSelectedIndex: (index: number) => void,
): (updater: Updater<RowSelectionState>) => void {
  return (updater: Updater<RowSelectionState>) => {
    // The react state set* functions can accept a value or a function that returns
    // the value
    const newSelectionState =
      updater instanceof Function
        ? updater(getRowSelectionState(currentIndex))
        : updater;

    const [selection, ...rest] = Object.entries(newSelectionState)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => parseInt(id));

    // Require a row to be selected always
    if (selection != null && rest.length == 0) {
      setSelectedIndex(selection);
    }
  };
}
