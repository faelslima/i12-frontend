import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {Observable, of, Subscription} from 'rxjs';
import {catchError, debounceTime, finalize, first, switchMap, tap} from 'rxjs/operators';
import {CustomAdapter, CustomDateParserFormatter} from '../../../../_metronic/core';
import {PessoaModel} from 'src/app/shared/models/pessoa.model';
import {IgrejaModel} from '../../../../shared/models/igreja.model';
import {DescendenciaModel} from '../../../../shared/models/descendencia.model';
import {PessoaService} from '../../pessoa.service';
import {IgrejaService} from '../../../../shared/service/igreja.service';
import Swal from 'sweetalert2';
import {DescendenciaService} from '../../../../shared/service/descendencia.service';

@Component({
    selector: 'app-edit-pessoa-modal',
    templateUrl: './edit-pessoa-modal.component.html',
    styleUrls: ['./edit-pessoa-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditPessoaModalComponent implements OnInit, OnDestroy {
    @Input() id: number;
    private igrejaSedeId = '2f38fa31-106e-4582-b748-0faaaf751677';
    private EMPTY_PESSOA: PessoaModel;
    isLoading$;
    pessoaModel: PessoaModel;
    formGroup: FormGroup;
    isLoadingPessoa = false;
    pessoas: PessoaModel[];
    igrejas: Array<IgrejaModel>;
    descendencias: Array<DescendenciaModel>;
    private subscriptions: Subscription[] = [];

    constructor(
        private pessoaService: PessoaService,
        private igrejaService: IgrejaService,
        private descendenciaService: DescendenciaService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_PESSOA = new PessoaModel();
        this.EMPTY_PESSOA.igreja = new IgrejaModel();
        this.EMPTY_PESSOA.igreja.id = this.igrejaSedeId;
        this.EMPTY_PESSOA.descendencia = new DescendenciaModel();

        this.isLoading$ = this.pessoaService.isLoading$;
        this.loadPessoa();
    }

    private loadPessoa() {
        if (!this.id) {
            this.pessoaModel = this.EMPTY_PESSOA;
            this.carregarDescendenciasPorIgreja(this.igrejaSedeId);
            this.loadForm();
        } else {
            const sb = this.pessoaService.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(this.EMPTY_PESSOA);
                })
            ).subscribe((object: PessoaModel) => {
                this.pessoaModel = object;
                if (object.igreja?.id) {
                    this.carregarDescendenciasPorIgreja(object.igreja.id);
                }
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.pessoaModel) {
            this.pessoaModel = this.EMPTY_PESSOA;
        }
        this.formGroup = this.fb.group({
            igreja: [this.pessoaModel.igreja?.id, Validators.compose([Validators.required])],
            lider: [this.pessoaModel.lider],
            descendencia: [this.pessoaModel.descendencia?.id],
            nome: [this.pessoaModel.nome, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
            dataNascimento: [this.pessoaModel.dataNascimento, Validators.compose([Validators.required, Validators.minLength(8)])],
            apelido: [this.pessoaModel.apelido],
            sexo: [this.pessoaModel.sexo, Validators.compose([Validators.required])],
            email: [this.pessoaModel.email, Validators.compose([Validators.email])],
            telefone: [this.pessoaModel.telefoneCelular]
        });
        this.loadIgrejas();
        this.createAutoCompleteLider();
    }

    save() {
        this.preparePessoa();
        if (this.pessoaModel.id) {
            this.edit();
        } else {
            this.create();
        }
    }

    edit() {
        const sbUpdate = this.pessoaService.update(this.pessoaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.pessoaModel);
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
        const sbCreate = this.pessoaService.create(this.pessoaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.pessoaModel);
            }),
        ).subscribe((res: PessoaModel) => {
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
        ).subscribe((object: Array<IgrejaModel>) => {
            this.igrejas = object;
        });
        this.subscriptions.push(subs);
    }

    onChangeIgreja() {
        this.descendencias = undefined;
        const value = this.formGroup.get('igreja').value;
        if (value) {
            this.carregarDescendenciasPorIgreja(value);
        }
    }

    private createAutoCompleteLider() {
        this.formGroup.controls.lider.valueChanges.pipe(
            debounceTime(500),
            tap(() => {
                this.pessoas = [];
                this.isLoadingPessoa = true;
            }),
            switchMap(value => this.pessoaService.getPessoaByName(value).pipe(
                finalize(() => this.isLoadingPessoa = false)
            ))
        ).subscribe(values => {
            if (values) {
                this.pessoas = values;
            }
        });
    }

    private carregarDescendenciasPorIgreja(igrejId: string) {
        this.descendenciaService.listByIgreja(igrejId).subscribe(val => this.descendencias = val);
    }

    private preparePessoa() {
        const formData = this.formGroup.value;

        if (!this.pessoaModel) {
            this.pessoaModel = this.EMPTY_PESSOA;
        }

        if (!this.pessoaModel.igreja) {
            this.pessoaModel.igreja = new IgrejaModel();
        }

        if (!this.pessoaModel.descendencia) {
            this.pessoaModel.descendencia = new DescendenciaModel();
        }

        this.pessoaModel.nome = formData.nome;
        this.pessoaModel.dataNascimento = formData.dataNascimento;
        this.pessoaModel.apelido = formData.apelido;
        this.pessoaModel.sexo = formData.sexo;
        this.pessoaModel.email = formData.email;
        this.pessoaModel.telefoneCelular = formData.telefone;
        this.pessoaModel.igreja.id = formData.igreja;
        this.pessoaModel.lider = formData.lider;
        this.pessoaModel.descendencia.id = formData.descendencia;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
        this.EMPTY_PESSOA = undefined;
        this.pessoaModel = undefined;
    }

    private onError(err) {
        console.log(err);
        Swal.fire({
            title: 'Houve uma falha no servidor, tente novamente.',
            icon: 'error'
        });
    }

    displayPessoa(pessoa: PessoaModel): string {
        return pessoa && pessoa.nome ? pessoa.nome : '';
    }

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
