export interface IGroupingState {
  selectedRowIds: Set<number | string>;
  itemIds: (number|string)[];
  checkAreAllRowsSelected(): boolean;
  selectRow(id: number|string): IGroupingState;
  // tslint:disable-next-line:variable-name
  clearRows(_itemIds: (number|string)[]): IGroupingState;
  isRowSelected(id: number|string): boolean;
  selectAllRows(): IGroupingState;
  getSelectedRows(): (number| string)[];
  getSelectedRowsCount(): number;
}

export class GroupingState implements IGroupingState {
  selectedRowIds: Set<number | string> = new Set<number | string>();
  itemIds = [];
  checkAreAllRowsSelected(): boolean {
    if (this.itemIds.length === 0) {
      return false;
    }

    return this.selectedRowIds.size === this.itemIds.length;
  }

  selectRow(id: number): GroupingState {
    if (this.selectedRowIds.has(id)) {
      this.selectedRowIds.delete(id);
    } else {
      this.selectedRowIds.add(id);
    }
    return this;
  }

  // tslint:disable-next-line:variable-name
  clearRows(_itemIds: (number | string)[]): GroupingState {
    this.itemIds = _itemIds;
    this.selectedRowIds = new Set<number | string>();
    return this;
  }

  isRowSelected(id: number | string): boolean {
    return this.selectedRowIds.has(id);
  }

  selectAllRows(): GroupingState {
    const areAllSelected = this.itemIds.length === this.selectedRowIds.size;
    if (areAllSelected) {
      this.selectedRowIds = new Set<number>();
    } else {
      this.selectedRowIds = new Set<number>();
      this.itemIds.forEach(id => this.selectedRowIds.add(id));
    }
    return this;
  }

  getSelectedRows(): (number|string)[] {
    return Array.from(this.selectedRowIds);
  }

  getSelectedRowsCount(): number {
    return this.selectedRowIds.size;
  }
}

export interface IGroupingView  {
  grouping: GroupingState;
  ngOnInit(): void;
}
