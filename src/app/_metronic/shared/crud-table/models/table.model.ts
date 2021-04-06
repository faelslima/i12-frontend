import {GroupingState} from './grouping.model';
import {PaginatorState} from './paginator.model';
import {SortState} from './sort.model';
import {FilterState} from './filter.model';

export interface ITableState {
    filter: Array<FilterState> | {};
    paginator: PaginatorState;
    sorting: SortState;
    searchTerm: string;
    grouping: GroupingState;
    entityId: number | undefined;
}

export interface TableResponseModel<T> {
    items: T[];
    total: number;
}

export interface ICreateAction {
    create(): void;
}

export interface IEditAction {
    edit(id: number): void;
}

export interface IDeleteAction {
    delete(id: number): void;
}

export interface IDeleteSelectedAction {
    grouping: GroupingState;

    ngOnInit(): void;

    deleteSelected(): void;
}

export interface IFetchSelectedAction {
    grouping: GroupingState;

    ngOnInit(): void;

    fetchSelected(): void;
}

export interface IUpdateStatusForSelectedAction {
    grouping: GroupingState;

    ngOnInit(): void;

    updateStatusForSelected(): void;
}

