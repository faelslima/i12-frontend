import {Component, OnDestroy, OnInit} from '@angular/core';
import {UniVidaAlunoService} from 'src/app/shared/service/univida-aluno.service';
import {
    FilterState,
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
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GenericDeleteComponent} from '../../../../shared/components/generic-delete/generic-delete.component';
import {ActivatedRoute} from '@angular/router';
import {EditUniVidaAlunoModalComponent} from './components/edit-univida-aluno-modal/edit-univida-aluno-modal.component';
import {UniVidaTurmaService} from '../../../../shared/service/univida-turma.service';
import {UniVidaTurmaModel} from '../../../../shared/models/univida-turma.model';

@Component({
    selector: 'app-univida-alunos',
    templateUrl: './univida-alunos.component.html',
    styleUrls: ['./univida-alunos.component.scss']
})
export class UniVidaAlunosComponent implements OnInit,
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

    private turmaId: string;
    private subscriptions: Subscription[] = [];

    entityName = 'Aluno';
    turma: UniVidaTurmaModel;

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public entityService: UniVidaAlunoService,
        private turmaService: UniVidaTurmaService,
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe(param => {
            this.turmaId = param.turma;
            this.turmaService.getItemById(this.turmaId).subscribe(value => {
                this.turma = value;
            });
        });
    }

    ngOnInit(): void {
        const filter: Array<FilterState> = [];
        filter.push({column: 'turma', value: this.turmaId});
        this.entityService.patchState({filter});
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
        const modalRef = this.modalService.open(EditUniVidaAlunoModalComponent, {size: 'xl', scrollable: true});
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.turma = this.turma;
        modalRef.result.then(() =>
                this.entityService.fetch(),
            () => {
            }
        );
    }

    delete(id: number | string) {
        const modalRef = this.modalService.open(GenericDeleteComponent);
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.turma = this.turma;
        modalRef.componentInstance.entityName = this.entityName;
        modalRef.componentInstance.service = this.entityService;
        modalRef.result.then(() => this.entityService.fetch(), () => {
        });
    }

}
