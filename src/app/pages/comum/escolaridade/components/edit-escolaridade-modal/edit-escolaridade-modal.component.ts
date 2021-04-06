import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, first, tap} from 'rxjs/operators';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import Swal from 'sweetalert2';
import {EscolaridadeModel} from 'src/app/shared/models/escolaridade.model';
import {EscolaridadeService} from 'src/app/shared/service/escolaridade.service';

@Component({
    selector: 'app-edit-escolaridade-modal',
    templateUrl: './edit-escolaridade-modal.component.html',
    styleUrls: ['./edit-escolaridade-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditEscolaridadeModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    isLoading$;
    private EMPTY_ENTITY: EscolaridadeModel;
    entity: EscolaridadeModel;
    formGroup: FormGroup;
    entityName = 'Escolaridade';
    private subscriptions: Subscription[] = [];

    constructor(
        private entityService: EscolaridadeService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new EscolaridadeModel();
        this.isLoading$ = this.entityService.isLoading$;
        this.loadEntity();
    }

    private loadEntity() {
        if (!this.id) {
            this.entity = this.EMPTY_ENTITY;
            this.loadForm();
        } else {
            const sb = this.entityService.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(this.EMPTY_ENTITY);
                })
            ).subscribe((object: EscolaridadeModel) => {
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
            descricao: [this.entity.descricao,
                Validators.compose([
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(100)
                ])],
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
        const sbUpdate = this.entityService.update(this.entity).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.EMPTY_ENTITY);
            }),
        ).subscribe(res => {
            this.entity = res;
            Swal.fire({
                title: 'Registro atualizado com sucesso!',
                icon: 'success'
            });
        });
        this.subscriptions.push(sbUpdate);
    }

    create() {
        const sbCreate = this.entityService.create(this.entity).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.entity);
            }),
        ).subscribe((res: EscolaridadeModel) => {
            this.entity = res;
            Swal.fire({
                title: 'Registro adicionado com sucesso!',
                icon: 'success'
            });
        });
        this.subscriptions.push(sbCreate);
    }

    private prepareEntity() {
        const formData = this.formGroup.value;
        if (!this.entity) {
            this.entity = this.EMPTY_ENTITY;
        }
        this.entity.descricao = formData.descricao;
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
}
