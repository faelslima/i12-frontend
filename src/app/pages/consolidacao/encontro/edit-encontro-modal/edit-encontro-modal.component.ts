import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, first, tap} from 'rxjs/operators';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import Swal from 'sweetalert2';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {IgrejaService} from 'src/app/shared/service/igreja.service';
import {EncontroService} from '../../../../shared/service/encontro.service';
import {EncontroModel} from '../../../../shared/models/encontro.model';
import {EventoTipoEnum} from '../../../../shared/enumetrations/evento-tipo.enum';

@Component({
    selector: 'app-edit-encontro-modal',
    templateUrl: './edit-encontro-modal.component.html',
    styleUrls: ['./edit-encontro-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditEncontroModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    EMPTY_ENTITY: EncontroModel;
    isLoading$;
    entityModel: EncontroModel;
    formGroup: FormGroup;
    igrejas: Array<IgrejaModel>;
    private subscriptions: Subscription[] = [];

    constructor(
        private igrejaService: IgrejaService,
        private entityService: EncontroService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new EncontroModel();
        this.EMPTY_ENTITY.igreja = new IgrejaModel();
        this.isLoading$ = this.entityService.isLoading$;
        this.loadEntity();
    }

    private loadEntity() {
        if (!this.id) {
            this.entityModel = this.EMPTY_ENTITY;
            this.loadForm();
        } else {
            const sb = this.entityService.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(this.EMPTY_ENTITY);
                })
            ).subscribe((object: EncontroModel) => {
                this.entityModel = object;
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.entityModel) {
            this.entityModel = this.EMPTY_ENTITY;
        }
        this.formGroup = this.fb.group({
            dataInicio: [this.entityModel.dataInicio, Validators.compose([Validators.required])],
            dataFim: [this.entityModel.dataFim, Validators.compose([Validators.required])],
            local: [this.entityModel.local, Validators.compose([Validators.required])],
            descricao: [this.entityModel.descricao, Validators.compose([Validators.required, Validators.minLength(5)])]
        });
        this.loadIgrejas();
    }

    save() {
        this.prepareEntity();
        if (this.entityModel.id) {
            this.edit();
        } else {
            this.create();
        }
    }

    edit() {
        const sbUpdate = this.entityService.update(this.entityModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.entityModel);
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
        const sbCreate = this.entityService.create(this.entityModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.entityModel);
            }),
        ).subscribe((res: EncontroModel) => {
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

    private loadIgrejas() {
        const subs = this.igrejaService.listAll().pipe(
            first(),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of([]);
            })
        ).subscribe((object: Array<IgrejaModel>) => this.igrejas = object);
        this.subscriptions.push(subs);
    }

    private prepareEntity() {
        const formData = this.formGroup.value;

        if (!this.entityModel) {
            this.entityModel = this.EMPTY_ENTITY;
        }
        if (!this.entityModel.igreja || !this.entityModel.igreja.id) {
            this.entityModel.igreja = new IgrejaModel();
            this.entityModel.igreja.id = '2f38fa31-106e-4582-b748-0faaaf751677'; // sede
        }
        this.entityModel.dataInicio = formData.dataInicio;
        this.entityModel.dataFim = formData.dataFim;
        this.entityModel.descricao = formData.descricao;
        this.entityModel.local = formData.local;
        this.entityModel.eventoTipo = EventoTipoEnum.ENCONTRO;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
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
