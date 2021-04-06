import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    FilterState,
    GroupingState,
    ICreateAction,
    IDeleteAction,
    IEditAction,
    IFilterView,
    IGroupingView,
    ISearchView,
    ISortView,
    PaginatorState,
    SortState
} from 'src/app/_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {RestrictionTypeEnum} from 'src/app/_metronic/shared/crud-table/models/restriction-type-enum';
import {EditEstadoCivilModalComponent} from './components/edit-estado-civil-modal/edit-estado-civil-modal.component';
import {EstadoCivilService} from '../../../shared/service/estado-civil.service';
import {GenericDeleteComponent} from '../../../shared/components/generic-delete/generic-delete.component';

@Component({
    selector: 'app-estado-civil',
    templateUrl: './estado-civil.component.html',
    styleUrls: ['./estado-civil.component.scss']
})
export class EstadoCivilComponent implements OnInit,
    OnDestroy,
    ICreateAction,
    IEditAction,
    IDeleteAction,
    ISortView,
    IFilterView,
    IGroupingView,
    ISearchView,
    IFilterView {
    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;
    isLoading: boolean;
    filterGroup: FormGroup;
    searchGroup: FormGroup;
    private subscriptions: Subscription[] = [];

    entityName = 'Estado Civil';

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public entityService: EstadoCivilService
    ) {
    }

    ngOnInit(): void {
        this.filterForm();
        this.searchForm();
        this.entityService.fetch();
        this.grouping = this.entityService.grouping;
        this.paginator = this.entityService.paginator;
        this.sorting = this.entityService.sorting;
        const sb = this.entityService.isLoading$.subscribe(res => this.isLoading = res);
        this.subscriptions.push(sb);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
        this.entityService.setDefaults();
    }

    // filtration
    filterForm() {
        this.filterGroup = this.fb.group({
            descricao: ['']
        });
        this.subscriptions.push(this.filterGroup.controls.descricao.valueChanges.subscribe(() => this.filter()));
    }

    filter() {
        const filter: Array<FilterState> = [];
        const descricao = this.filterGroup.get('descricao').value;
        if (descricao) {
            filter.push({column: 'descricao', value: descricao, restrictionType: RestrictionTypeEnum.LIKE});
        }
        this.entityService.patchState({filter});
    }

    // search
    searchForm() {
        this.searchGroup = this.fb.group({
            searchTerm: [''],
        });
        const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
            .pipe(
                /*
              The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
              we are limiting the amount of server requests emitted to a maximum of one every 150ms
              */
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe((val) => this.search(val));
        this.subscriptions.push(searchEvent);
    }

    search(searchTerm: string) {
        this.entityService.patchState({searchTerm});
    }

    // sorting
    sort(column: string) {
        const sorting = this.sorting;
        const isActiveColumn = sorting.column === column;
        if (!isActiveColumn) {
            sorting.column = column;
            sorting.direction = 'asc';
        } else {
            sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
        }
        this.entityService.patchState({sorting});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.entityService.patchState({paginator});
    }

    // form actions
    create() {
        this.edit(undefined);
    }

    edit(id: number | string) {
        const modalRef = this.modalService.open(EditEstadoCivilModalComponent, {size: 'xl'});
        modalRef.componentInstance.id = id;
        modalRef.result.then(() =>
                this.entityService.fetch(),
            () => {
            }
        );
    }

    delete(id: number | string) {
        const modalRef = this.modalService.open(GenericDeleteComponent);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.service = this.entityService;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.result.then(() => this.entityService.fetch(), () => {
        });
    }
}
