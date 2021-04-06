import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {ActivatedRoute} from '@angular/router';
import {GenericDeleteComponent} from '../../../../shared/components/generic-delete/generic-delete.component';
import {EditEncontristaModalComponent} from './edit-encontrista-modal/edit-encontrista-modal.component';
import {EncontroModel} from '../../../../shared/models/encontro.model';
import {EncontroService} from '../../../../shared/service/encontro.service';
import {EncontristaService} from '../../../../shared/service/encontrista.service';

@Component({
  selector: 'app-encontreiros',
  templateUrl: './encontristas.component.html',
  styleUrls: ['./encontristas.component.scss']
})
export class EncontristasComponent implements OnInit,
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
  private encontroId: string;
  private subscriptions: Subscription[] = [];

  entityName = 'Encontristas';
  encontro: EncontroModel;

  constructor(
      private fb: FormBuilder,
      private modalService: NgbModal,
      public entityService: EncontristaService,
      private encontroService: EncontroService,
      private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(param => {
      this.encontroId = param.encontro;
      this.encontroService.getItemById(this.encontroId).subscribe(value => {
        this.encontro = value;
      });
    });
  }

  ngOnInit(): void {
    const filter: Array<FilterState> = [];
    filter.push({column: 'encontro', value: this.encontroId});
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
    const modalRef = this.modalService.open(EditEncontristaModalComponent, {size: 'xl', scrollable: true});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.encontro = this.encontro;
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

  pagar(id: number | string) {
    console.log(id);
  }

}
