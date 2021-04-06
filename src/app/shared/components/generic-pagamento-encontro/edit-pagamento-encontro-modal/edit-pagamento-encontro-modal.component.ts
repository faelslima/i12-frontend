import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, first, tap} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {EncontreiroModel} from 'src/app/shared/models/encontreiro.model';
import {PagamentoTipoEnum} from 'src/app/shared/enumetrations/pagamento-tipo.enum';
import {PagamentoEncontroModel} from 'src/app/shared/models/pagamento-encontro.model';
import {EncontristaModel} from 'src/app/shared/models/encontrista.model';
import {PagamentoEncontroService} from '../../../service/pagamento-encontro.service';
import {BaseEntityModel} from '../../../models/base-entity.model';

@Component({
    selector: 'app-edit-encontreiro-modal',
    templateUrl: './edit-pagamento-encontro-modal.component.html',
    styleUrls: ['./edit-pagamento-encontro-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditPagamentoEncontroModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    @Input() entityName: string;
    @Input() pessoa;
    isLoading$;
    entity: PagamentoEncontroModel;
    formGroup: FormGroup;
    formGroupEncontreiros: FormGroup;
    tiposPagamento: Array<PagamentoTipoEnum>;
    private EMPTY_ENTITY: PagamentoEncontroModel;
    private subscriptions: Subscription[] = [];

    constructor(private fb: FormBuilder,
                public modal: NgbActiveModal,
                private service: PagamentoEncontroService,
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new PagamentoEncontroModel();
        this.isLoading$ = this.service.isLoading$;
        this.initEnums();
        this.loadEntity();
    }

    private loadEntity() {
        if (!this.id) {
            this.entity = this.EMPTY_ENTITY;
            this.loadForm();
        } else {
            const sb = this.service.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(this.EMPTY_ENTITY);
                })
            ).subscribe((object: PagamentoEncontroModel) => {
                this.entity = object;
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.entity) {
            this.entity = this.EMPTY_ENTITY;
        }
        this.formGroup = this.fb.group({
            pagamentoTipo: [this.entity.pagamentoTipo, Validators.compose([Validators.required])],
            observacao: [this.entity.observacao],
            valorPago: [this.entity.valorPago, Validators.compose([Validators.required])],
        });
    }

    save() {
        this.prepareEntity();
        if (this.entity.id) {
            this.edit();
        } else {
            this.create();
        }
    }

    edit() {
        const sbUpdate = this.service.update(this.entity).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.entity);
            }),
        ).subscribe(res => {
            if (res) {
                Swal.fire({
                    title: 'Registro atualizado com sucesso!',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Houve uma falha no servidor, tente novamente.',
                    icon: 'error'
                });
            }
        }, err => this.onError(err));
        this.subscriptions.push(sbUpdate);
    }

    create() {
        const sbCreate = this.service.create(this.entity).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.EMPTY_ENTITY);
            }),
        ).subscribe((res: PagamentoEncontroModel) => {
            if (res) {
                Swal.fire({
                    title: 'Registro adicionado com sucesso!',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Houve uma falha no servidor, tente novamente.',
                    icon: 'error'
                });
            }
        }, err => this.onError(err));
        this.subscriptions.push(sbCreate);
    }

    private prepareEntity() {
        const formData = this.formGroup.value;

        if (!this.entity) {
            this.entity = this.EMPTY_ENTITY;
        }

        if (this.entityName === 'Encontreiro') {
            this.entity.encontreiro = new EncontreiroModel();
            this.entity.encontreiro = this.pessoa;
        }
        if (this.entityName === 'Encontrista') {
            this.entity.encontrista = new EncontristaModel();
            this.entity.encontrista = this.pessoa;
        }

        this.entity.pagamentoTipo = formData.pagamentoTipo;
        this.entity.observacao = formData.observacao;
        this.entity.valorPago = formData.valorPago;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
    }

    private initEnums() {
        this.tiposPagamento = [];
        this.tiposPagamento.push(PagamentoTipoEnum.DINHEIRO);
        this.tiposPagamento.push(PagamentoTipoEnum.CARTAO);
        this.tiposPagamento.push(PagamentoTipoEnum.TRANSFERENCIA);
        this.tiposPagamento.push(PagamentoTipoEnum.PIX);
        this.tiposPagamento.push(PagamentoTipoEnum.TED);
        this.tiposPagamento.push(PagamentoTipoEnum.DOC);
        this.tiposPagamento.push(PagamentoTipoEnum.CHEQUE);
        this.tiposPagamento.push(PagamentoTipoEnum.OUTRO);
    }

    // helpers for View
    isControlValid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.valid && (control.dirty || control.touched);
    }

    isControlInvalid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.invalid && (control.dirty || control.touched);
    }

    controlHasError(validation, controlName): boolean {
        const control = this.formGroup.controls[controlName];
        return control.hasError(validation) && (control.dirty || control.touched);
    }

    isControlTouched(controlName): boolean {
        const control = this.formGroup.controls[controlName];
        return control.dirty || control.touched;
    }

    private onError(err) {
        console.log(err);
        Swal.fire({
            title: 'Houve uma falha no servidor, tente novamente.',
            icon: 'error'
        });
    }
}
