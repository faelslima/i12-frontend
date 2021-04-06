import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, first, tap} from 'rxjs/operators';
import {CustomAdapter, CustomDateParserFormatter} from '../../../../../_metronic/core';
import {DescendenciaModel} from 'src/app/shared/models/descendencia.model';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import {IgrejaService} from '../../../../../shared/service/igreja.service';
import Swal from 'sweetalert2';
import {DescendenciaService} from 'src/app/shared/service/descendencia.service';

@Component({
    selector: 'app-edit-descendencia-modal',
    templateUrl: './edit-descendencia-modal.component.html',
    styleUrls: ['./edit-descendencia-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditDescendenciaModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    isLoading$;
    private EMPTY_ENTITY: DescendenciaModel;
    descendenciaModel: DescendenciaModel;
    formGroup: FormGroup;
    igrejas: Array<IgrejaModel>;
    private subscriptions: Subscription[] = [];

    constructor(
        private igrejaService: IgrejaService,
        private descendenciaService: DescendenciaService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new DescendenciaModel();
        this.EMPTY_ENTITY.igreja = new IgrejaModel();

        this.isLoading$ = this.descendenciaService.isLoading$;
        this.loadDescendencia();
    }

    private loadDescendencia() {
        if (!this.id) {
            this.descendenciaModel = this.EMPTY_ENTITY;
            this.loadForm();
        } else {
            const sb = this.descendenciaService.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(this.EMPTY_ENTITY);
                })
            ).subscribe((object: DescendenciaModel) => {
                this.descendenciaModel = object;
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.descendenciaModel) {
            this.descendenciaModel = this.EMPTY_ENTITY;
        }
        this.formGroup = this.fb.group({
            igreja: [this.descendenciaModel.igreja?.id, Validators.compose([Validators.required])],
            descricao: [this.descendenciaModel.descricao],
            sigla: [this.descendenciaModel.sigla, Validators.compose([Validators.required, Validators.minLength(3),
                Validators.maxLength(10)])],
        });
        this.loadIgrejas();
    }

    save() {
        this.prepareDescendencia();
        if (this.descendenciaModel.id) {
            this.edit();
        } else {
            this.create();
        }
    }

    edit() {
        const sbUpdate = this.descendenciaService.update(this.descendenciaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.descendenciaModel);
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
        const sbCreate = this.descendenciaService.create(this.descendenciaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.descendenciaModel);
            }),
        ).subscribe((res: DescendenciaModel) => {
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

    private prepareDescendencia() {
        const formData = this.formGroup.value;

        if (!this.descendenciaModel) {
            this.descendenciaModel = this.EMPTY_ENTITY;
        }
        if (!this.descendenciaModel.igreja) {
            this.descendenciaModel.igreja = new IgrejaModel();
        }
        this.descendenciaModel.igreja.id = formData.igreja;
        this.descendenciaModel.descricao = formData.descricao;
        this.descendenciaModel.sigla = formData.sigla;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
        this.EMPTY_ENTITY = undefined;
        this.descendenciaModel = undefined;
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
