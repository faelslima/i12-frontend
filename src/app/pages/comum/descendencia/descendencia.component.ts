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
import {of, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RestrictionTypeEnum} from '../../../_metronic/shared/crud-table/models/restriction-type-enum';
import {catchError, debounceTime, distinctUntilChanged, first} from 'rxjs/operators';
import {DescendenciaService} from '../../../shared/service/descendencia.service';
import {IgrejaModel} from '../../../shared/models/igreja.model';
import {IgrejaService} from '../../../shared/service/igreja.service';
import {EditDescendenciaModalComponent} from './components/edit-descendencia-modal/edit-descendencia-modal.component';
import {GenericDeleteComponent} from '../../../shared/components/generic-delete/generic-delete.component';

@Component({
    selector: 'app-descendencia',
    templateUrl: './descendencia.component.html',
    styleUrls: ['./descendencia.component.scss']
})
export class DescendenciaComponent implements OnInit,
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
    igrejas: Array<IgrejaModel>;
    private subscriptions: Subscription[] = [];

    entityName = 'Descendência';

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public descendenciaService: DescendenciaService,
        private igrejaService: IgrejaService
    ) {
    }

    // angular lifecircle hooks
    ngOnInit(): void {
        this.loadIgrejas();
        this.filterForm();
        this.searchForm();
        this.descendenciaService.fetch();
        this.grouping = this.descendenciaService.grouping;
        this.paginator = this.descendenciaService.paginator;
        this.sorting = this.descendenciaService.sorting;
        const sb = this.descendenciaService.isLoading$.subscribe(res => this.isLoading = res);
        this.subscriptions.push(sb);
    }

    loadIgrejas() {
        const subs = this.igrejaService.listAll().pipe(
            first(),
            catchError((errorMessage) => {
                return of([]);
            })
        ).subscribe((object: Array<IgrejaModel>) => {
            this.igrejas = object;
        });
        this.subscriptions.push(subs);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
        this.descendenciaService.setDefaults();
    }

    // filtration
    filterForm() {
        this.filterGroup = this.fb.group({
            descricao: [''],
            igreja: ['']
        });
        this.subscriptions.push(this.filterGroup.controls.descricao.valueChanges.subscribe(() => this.filter()));
        this.subscriptions.push(this.filterGroup.controls.igreja.valueChanges.subscribe(() => this.filter()));
    }

    filter() {
        const filter: Array<FilterState> = [];
        const descricao = this.filterGroup.get('descricao').value;
        const igreja = this.filterGroup.get('igreja').value;
        if (descricao) {
            filter.push({column: 'nome', value: descricao, restrictionType: RestrictionTypeEnum.LIKE});
        }
        if (igreja && igreja !== '') {
            filter.push({column: 'igreja', value: igreja});
        }
        this.descendenciaService.patchState({filter});
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
        this.descendenciaService.patchState({searchTerm});
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
        this.descendenciaService.patchState({sorting});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.descendenciaService.patchState({paginator});
    }

    // form actions
    create() {
        this.edit(undefined);
    }

    edit(id: number | string) {
        const modalRef = this.modalService.open(EditDescendenciaModalComponent, {size: 'xl'});
        modalRef.componentInstance.id = id;
        modalRef.result.then(() =>
                this.descendenciaService.fetch(),
            () => {
            }
        );
    }

    delete(id: number | string) {
        const modalRef = this.modalService.open(GenericDeleteComponent);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.service = this.descendenciaService;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.result.then(() => this.descendenciaService.fetch(), () => {
        });
    }
}

