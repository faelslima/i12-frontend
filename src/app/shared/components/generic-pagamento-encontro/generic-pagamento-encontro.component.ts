import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PagamentoEncontroService} from '../../service/pagamento-encontro.service';
import {
    FilterState,
    GroupingState,
    ICreateAction,
    IDeleteAction,
    IEditAction,
    ISortView,
    PaginatorState,
    SortState
} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IgrejaModel} from '../../models/igreja.model';
import {GenericDeleteComponent} from '../generic-delete/generic-delete.component';
import {GenericCrudService} from '../../service/generic-crud.service';
import {BaseEntityModel} from '../../models/base-entity.model';
import {EditPagamentoEncontroModalComponent} from './edit-pagamento-encontro-modal/edit-pagamento-encontro-modal.component';

@Component({
    selector: 'app-generic-delete',
    templateUrl: './generic-pagamento-encontro.component.html',
    styleUrls: ['./generic-pagamento-encontro.component.scss']
})
export class GenericPagamentoEncontroComponent implements OnInit,
    OnDestroy,
    ICreateAction,
    IEditAction,
    IDeleteAction,
    ISortView {

    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;
    isLoading: boolean;
    private subscriptions: Subscription[] = [];

    @Input() id: string;
    @Input() entityName: string;
    @Input() entityService: GenericCrudService<BaseEntityModel>;
    entity: BaseEntityModel;

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public service: PagamentoEncontroService,
    ) {
    }

    // angular lifecircle hooks
    ngOnInit(): void {
        this.entityService.getItemById(this.id).subscribe(obj => this.entity = obj);
        const filter: Array<FilterState> = [];
        if (this.entityName === 'Encontreiro') {
            filter.push({column: 'encontreiro', value: this.id});
        } else {
            filter.push({column: 'encontrista', value: this.id});
        }
        this.service.patchState({filter});
        this.grouping = this.service.grouping;
        this.paginator = this.service.paginator;
        this.sorting = this.service.sorting;
        const sb = this.service.isLoading$.subscribe(res => this.isLoading = res);
        this.subscriptions.push(sb);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
        this.service.setDefaults();
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
        this.service.patchState({sorting});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.service.patchState({paginator});
    }

    // form actions
    create() {
        this.edit(undefined);
    }

    edit(id: number | string) {
        const modalRef = this.modalService.open(EditPagamentoEncontroModalComponent, {size: 'xl'});
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.pessoa = this.entity;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.result.then(() =>
                this.service.fetch(),
            () => {
            }
        );
    }

    delete(id: number | string) {
        const modalRef = this.modalService.open(GenericDeleteComponent);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.service = this.service;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.result.then(() => this.service.fetch(), () => {
        });
    }
}
