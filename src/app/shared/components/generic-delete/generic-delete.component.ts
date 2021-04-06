import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, delay, finalize, tap} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {GenericCrudService} from '../../service/generic-crud.service';
import {BaseEntityModel} from '../../models/base-entity.model';

@Component({
    selector: 'app-generic-delete',
    templateUrl: './generic-delete.component.html',
    styleUrls: ['./generic-delete.component.scss']
})
export class GenericDeleteComponent implements OnInit, OnDestroy {

    @Input() id: number | string;
    @Input() entityName: string;
    @Input() service: GenericCrudService<BaseEntityModel>;

    isLoading = false;

    subscriptions: Subscription[] = [];

    constructor(public modal: NgbActiveModal) {
    }

    ngOnInit(): void {
    }

    delete() {
        this.isLoading = true;
        const sb = this.service.delete(this.id).pipe(
            delay(1000), // Remove it from your code (just for showing loading)
            tap(() => this.modal.close()),
            catchError((err) => {
                this.modal.dismiss(err);
                Swal.fire({
                    title: 'Falha ao tentar excluir esse registro!',
                    icon: 'error'
                });
                return of(undefined);
            }),
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe((res) => {
            Swal.fire({
                title: 'Registro excluído com sucesso!',
                icon: 'success'
            });
        }, err => this.onError(err));
        this.subscriptions.push(sb);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
        this.id = undefined;
    }

    private onError(err) {
        console.log('erro delete', err);
        Swal.fire({
            title: 'Falha ao excluir esse registro!',
            icon: 'error'
        });
    }
}
