import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, debounceTime, finalize, first, switchMap, tap} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {UniVidaTurmaModel} from '../../../../../../shared/models/univida-turma.model';
import {UniVidaAlunoModel} from '../../../../../../shared/models/univida-aluno.model';
import {PessoaModel} from '../../../../../../shared/models/pessoa.model';
import {UniVidaAlunoService} from '../../../../../../shared/service/univida-aluno.service';
import {DescendenciaModel} from '../../../../../../shared/models/descendencia.model';
import {DescendenciaService} from '../../../../../../shared/service/descendencia.service';
import {PessoaService} from '../../../../../pessoa/pessoa.service';

@Component({
    selector: 'app-edit-nova-vida-modal',
    templateUrl: './edit-univida-aluno-modal.component.html',
    styleUrls: ['./edit-univida-aluno-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditUniVidaAlunoModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    @Input() turma: UniVidaTurmaModel;

    isLoading$;
    private EMPTY_ENTITY: UniVidaAlunoModel;
    entity: UniVidaAlunoModel;
    descendencias: Array<DescendenciaModel>;
    pessoas: PessoaModel[];
    isLoadingPessoa = false;
    formGroup: FormGroup;
    yesNo = [{value: true, descricao: 'Sim'}, {value: false, descricao: 'Não'}];
    private subscriptions: Subscription[] = [];

    constructor(
        private service: UniVidaAlunoService,
        private descendenciaService: DescendenciaService,
        private pessoaService: PessoaService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new UniVidaAlunoModel();
        this.isLoading$ = this.service.isLoading$;
        this.loadEntity();
        if (this.turma.igreja?.id) {
            this.carregarDescendenciasPorIgreja(this.turma.igreja.id);
        }
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
            ).subscribe((object: UniVidaAlunoModel) => {
                this.entity = object;
                if (object.pessoa.lider?.id) {
                    this.pessoas = [];
                    this.pessoas.push(object.pessoa.lider);
                }
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.entity) {
            this.entity = this.EMPTY_ENTITY;
        }
        if (!this.entity.pessoa) {
            this.entity.pessoa = new PessoaModel();
        }
        this.formGroup = this.fb.group({
            adquiriuLivro: [this.entity.adquiriuLivro, Validators.compose([Validators.required])],
            adquiriuCamisa: [this.entity.adquiriuCamisa, Validators.compose([Validators.required])],
            valorPagoLivro: [this.entity.valorPagoLivro],
            valorPagoCamisa: [this.entity.valorPagoCamisa],
            descendencia: [this.entity.pessoa?.descendencia?.id],
            lider: [this.entity.pessoa.lider],
            nome: [this.entity.pessoa?.nome, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
            dataHoraInscricao: [this.entity.dataHoraInscricao],
            dataNascimento: [this.entity.pessoa?.dataNascimento, Validators.compose([Validators.required])],
            apelido: [this.entity.pessoa?.apelido],
            sexo: [this.entity.pessoa?.sexo, Validators.compose([Validators.required])],
            email: [this.entity.pessoa?.email, Validators.compose([Validators.email])],
            telefone: [this.entity.pessoa?.telefoneCelular]
        });
        this.createFilters();
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
        ).subscribe((res: UniVidaAlunoModel) => {
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
        if (!this.entity.turma || !this.entity.turma.id) {
            this.entity.turma = this.turma;
        }

        if (!this.entity.pessoa) {
            this.entity.pessoa = new PessoaModel();
        }

        if (!this.entity.pessoa.descendencia) {
            this.entity.pessoa.descendencia = new DescendenciaModel();
        }

        this.entity.dataHoraInscricao = formData.dataHoraInscricao;
        this.entity.adquiriuLivro = formData.adquiriuLivro;
        this.entity.adquiriuCamisa = formData.adquiriuCamisa;
        this.entity.valorPagoLivro = formData.valorPagoLivro;
        this.entity.valorPagoCamisa = formData.valorPagoCamisa;
        this.entity.pessoa.nome = formData.nome;
        this.entity.pessoa.dataNascimento = formData.dataNascimento;
        this.entity.pessoa.apelido = formData.apelido;
        this.entity.pessoa.lider = formData.lider;
        this.entity.pessoa.sexo = formData.sexo;
        this.entity.pessoa.email = formData.email;
        this.entity.pessoa.telefoneCelular = formData.telefone;
        this.entity.pessoa.descendencia.id = formData.descendencia;
    }

    private carregarDescendenciasPorIgreja(igrejId: string) {
        const subs = this.descendenciaService.listByIgreja(igrejId).subscribe((val: Array<DescendenciaModel>) => {
            this.descendencias = val;
        });
        this.subscriptions.push(subs);
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

    private createFilters() {
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

    displayPessoa(pessoa: PessoaModel): string {
        return pessoa && pessoa.nome ? pessoa.nome : '';
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
