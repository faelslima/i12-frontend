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
} from '../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {of, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, debounceTime, distinctUntilChanged, first} from 'rxjs/operators';
import {PessoaService} from './pessoa.service';
import {EditPessoaModalComponent} from './components/edit-pessoa-modal/edit-pessoa-modal.component';
import {RestrictionTypeEnum} from '../../_metronic/shared/crud-table/models/restriction-type-enum';
import {IgrejaModel} from '../../shared/models/igreja.model';
import {IgrejaService} from '../../shared/service/igreja.service';
import {PessoaTempModel} from './pessoa-temp.model';
import {PessoaTempService} from './pessoa-temp.service';
import {GenericDeleteComponent} from '../../shared/components/generic-delete/generic-delete.component';

@Component({
    selector: 'app-pessoa',
    templateUrl: './pessoa.component.html',
    styleUrls: ['./pessoa.component.scss']
})
export class PessoaComponent implements OnInit,
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
    arrayPessoas = new Array<PessoaTempModel>();
    entityName = 'Pessoa';

    private subscriptions: Subscription[] = [];

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public pessoaService: PessoaService,
        public pessoaTempService: PessoaTempService,
        private igrejaService: IgrejaService,
        // private db: AngularFirestore
    ) {
    }

    // angular lifecircle hooks
    ngOnInit(): void {
        this.loadIgrejas();
        this.filterForm();
        this.searchForm();
        this.pessoaService.fetch();
        this.grouping = this.pessoaService.grouping;
        this.paginator = this.pessoaService.paginator;
        this.sorting = this.pessoaService.sorting;
        const sb = this.pessoaService.isLoading$.subscribe(res => this.isLoading = res);

        this.subscriptions.push(sb);

        // this.initTablePessoas();
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
        this.pessoaService.setDefaults();
    }

    // filtration
    filterForm() {
        this.filterGroup = this.fb.group({
            nome: [''],
            igreja: ['']
        });
        this.subscriptions.push(this.filterGroup.controls.nome.valueChanges.subscribe(() => this.filter()));
        this.subscriptions.push(this.filterGroup.controls.igreja.valueChanges.subscribe(() => this.filter()));
    }

    filter() {
        const filter: Array<FilterState> = [];
        const nome = this.filterGroup.get('nome').value;
        const igreja = this.filterGroup.get('igreja').value;
        if (nome) {
            filter.push({column: 'nome', value: nome, restrictionType: RestrictionTypeEnum.LIKE});
        }
        if (igreja && igreja !== '') {
            filter.push({column: 'igreja', value: igreja});
        }
        this.pessoaService.patchState({filter});
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
        this.pessoaService.patchState({searchTerm});
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
        this.pessoaService.patchState({sorting});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.pessoaService.patchState({paginator});
    }

    // form actions
    create() {
        this.edit(undefined);
    }

    edit(id: number) {
        const modalRef = this.modalService.open(EditPessoaModalComponent, {size: 'xl'});
        modalRef.componentInstance.id = id;
        modalRef.result.then(() =>
                this.pessoaService.fetch(),
            () => {
            }
        );
    }

    delete(id: number | string) {
        const modalRef = this.modalService.open(GenericDeleteComponent);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.service = this.pessoaService;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.result.then(() => this.pessoaService.fetch(), () => {
        });
    }

    updatePessoas() {
        this.arrayPessoas.forEach(item => {
            this.pessoaTempService.saveTemp(item);
        });
    }
}
