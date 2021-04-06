import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, first, tap} from 'rxjs/operators';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import Swal from 'sweetalert2';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {UniVidaTurmaModel} from '../../../../../../shared/models/univida-turma.model';
import {UniVidaTurmaService} from '../../../../../../shared/service/univida-turma.service';
import {IgrejaService} from '../../../../../../shared/service/igreja.service';
import {DiaSemanaEnum} from '../../../../../../shared/enumetrations/dia-semana.enum';

@Component({
    selector: 'app-edit-nova-vida-modal',
    templateUrl: './edit-univida-turma-modal.component.html',
    styleUrls: ['./edit-univida-turma-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditUniVidaTurmaModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    isLoading$;
    private EMPTY_ENTITY: UniVidaTurmaModel;
    entity: UniVidaTurmaModel;
    formGroup: FormGroup;
    igrejas: Array<IgrejaModel>;
    diasSemana: Array<DiaSemanaEnum>;
    isLoadingCidade = false;
    isLoadingPessoa = false;
    private subscriptions: Subscription[] = [];

    constructor(
        private service: UniVidaTurmaService,
        private igrejaService: IgrejaService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new UniVidaTurmaModel();
        this.isLoading$ = this.service.isLoading$;
        this.loadEntity();

        this.diasSemana = new Array<DiaSemanaEnum>();
        this.diasSemana.push(DiaSemanaEnum.DOMINGO);
        this.diasSemana.push(DiaSemanaEnum.SEGUNDA_FEIRA);
        this.diasSemana.push(DiaSemanaEnum.TERCA_FEIRA);
        this.diasSemana.push(DiaSemanaEnum.QUARTA_FEIRA);
        this.diasSemana.push(DiaSemanaEnum.QUINTA_FEIRA);
        this.diasSemana.push(DiaSemanaEnum.SEXTA_FEIRA);
        this.diasSemana.push(DiaSemanaEnum.SABADO);
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
            ).subscribe((object: UniVidaTurmaModel) => {
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
            dataInicio: [this.entity.dataInicio, Validators.compose([Validators.required])],
            horaAula: [this.entity.horaAula, Validators.compose([Validators.required])],
            diaSemana: [this.entity.diaSemana, Validators.compose([Validators.required])],
            igreja: [this.entity.igreja?.id],
            local: [this.entity.local],
        });
        console.log(this.entity);
        this.loadIgrejas();
    }

    save() {
        this.prepareNovaVida();
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
                return of(this.EMPTY_ENTITY);
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
        ).subscribe((res: UniVidaTurmaModel) => {
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

    private prepareNovaVida() {
        const formData = this.formGroup.value;

        if (!this.entity) {
            this.entity = this.EMPTY_ENTITY;
        }
        if (!this.entity.igreja || !this.entity.igreja.id) {
            this.entity.igreja = new IgrejaModel();
            this.entity.igreja.id = '2f38fa31-106e-4582-b748-0faaaf751677'; // sede
        }

        this.entity.dataInicio = formData.dataInicio;
        this.entity.horaAula = formData.horaAula;
        this.entity.diaSemana = formData.diaSemana;
        this.entity.local = formData.local;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
        this.EMPTY_ENTITY = undefined;
        this.entity = undefined;
    }

    private onError(err) {
        console.log(err);
        Swal.fire({
            title: 'Houve uma falha no servidor, tente novamente.',
            icon: 'error'
        });
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
}
