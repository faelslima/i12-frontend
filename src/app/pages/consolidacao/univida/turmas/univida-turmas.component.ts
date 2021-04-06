import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    GroupingState,
    ICreateAction,
    IDeleteAction,
    IEditAction,
    IGroupingView,
    ISortView,
    PaginatorState,
    SortState
} from '../../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IgrejaModel} from '../../../../shared/models/igreja.model';
import {of, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IgrejaService} from '../../../../shared/service/igreja.service';
import {catchError, first} from 'rxjs/operators';
import {GenericDeleteComponent} from '../../../../shared/components/generic-delete/generic-delete.component';
import {UniVidaTurmaService} from '../../../../shared/service/univida-turma.service';
import {EditUniVidaTurmaModalComponent} from './components/edit-univida-turma-modal/edit-univida-turma-modal.component';

@Component({
    selector: 'app-univida-turmas',
    templateUrl: './univida-turmas.component.html',
    styleUrls: ['./univida-turmas.component.scss']
})
export class UniVidaTurmasComponent implements OnInit,
    OnDestroy,
    ICreateAction,
    IEditAction,
    IDeleteAction,
    ISortView,
    IGroupingView {
    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;
    isLoading: boolean;
    filterGroup: FormGroup;
    searchGroup: FormGroup;
    igrejas: Array<IgrejaModel>;
    private subscriptions: Subscription[] = [];

    entityName = 'Turma';

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public entityService: UniVidaTurmaService,
        private igrejaService: IgrejaService
    ) {
    }

    ngOnInit(): void {
        this.loadIgrejas();
        this.entityService.fetch();
        this.grouping = this.entityService.grouping;
        this.paginator = this.entityService.paginator;
        this.sorting = this.entityService.sorting;
        const sb = this.entityService.isLoading$.subscribe(res => this.isLoading = res);
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
        this.entityService.setDefaults();
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
        const modalRef = this.modalService.open(EditUniVidaTurmaModalComponent, {size: 'xl', scrollable: true});
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
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.componentInstance.service = this.entityService;
        modalRef.result.then(() => this.entityService.fetch(), () => {
        });
    }

}
