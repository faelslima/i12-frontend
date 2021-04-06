import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {of, Subscription} from 'rxjs';
import {catchError, debounceTime, finalize, first, switchMap, tap} from 'rxjs/operators';
import {DescendenciaModel} from 'src/app/shared/models/descendencia.model';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import Swal from 'sweetalert2';
import {DescendenciaService} from 'src/app/shared/service/descendencia.service';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {IgrejaService} from 'src/app/shared/service/igreja.service';
import {PessoaModel} from 'src/app/shared/models/pessoa.model';
import {PessoaService} from '../../../../pessoa/pessoa.service';
import {PagamentoTipoEnum} from '../../../../../shared/enumetrations/pagamento-tipo.enum';
import {PagamentoEncontroModel} from '../../../../../shared/models/pagamento-encontro.model';
import {EncontroModel} from '../../../../../shared/models/encontro.model';
import {EncontristaModel} from '../../../../../shared/models/encontrista.model';
import {EncontristaService} from '../../../../../shared/service/encontrista.service';

@Component({
    selector: 'app-edit-encontreiro-modal',
    templateUrl: './edit-encontrista-modal.component.html',
    styleUrls: ['./edit-encontrista-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditEncontristaModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    @Input() encontro: EncontroModel;
    isLoading$;
    entity: EncontristaModel;
    formGroup: FormGroup;
    formGroupEncontrista: FormGroup;
    igrejas: Array<IgrejaModel>;
    descendencias: Array<DescendenciaModel>;
    encontristas: PessoaModel[];
    pessoas: PessoaModel[];
    tiposPagamento: Array<PagamentoTipoEnum>;
    isLoadingPessoa = false;
    tipoSexo = [{value: 'M', descricao: 'Masculino'}, {value: 'F', descricao: 'Feminino'}];
    private EMPTY_ENTITY: EncontristaModel;
    private subscriptions: Subscription[] = [];

    constructor(
        private igrejaService: IgrejaService,
        private entityService: EncontristaService,
        private descendenciaService: DescendenciaService,
        private pessoaService: PessoaService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.EMPTY_ENTITY = new EncontristaModel();
        this.EMPTY_ENTITY.encontro = this.encontro;
        this.EMPTY_ENTITY.pessoa = new PessoaModel();
        this.EMPTY_ENTITY.pagamento = new PagamentoEncontroModel();

        this.isLoading$ = this.entityService.isLoading$;
        this.initEnums();
        this.loadEntity();
        this.loadFilterEncontreiros();
        this.loadDescendenciasDefault();
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
            ).subscribe((object: EncontristaModel) => {
                this.entity = object;
                if (object.pessoa?.lider?.id) {
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
        this.formGroup = this.fb.group({
            nome: [this.entity?.pessoa?.nome, Validators.compose([Validators.required, Validators.minLength(3)])],
            igreja: [this.entity?.pessoa?.igreja?.id, Validators.compose([Validators.required])],
            descendencia: [this.entity?.pessoa?.descendencia?.id],
            lider: [this.entity?.pessoa?.lider],
            dataNascimento: [this.entity?.pessoa?.dataNascimento, Validators.compose([Validators.required])],
            apelido: [this.entity?.pessoa?.apelido],
            sexo: [this.entity?.pessoa?.sexo, Validators.compose([Validators.required])],
            email: [this.entity?.pessoa?.email, Validators.compose([Validators.email])],
            telefone: [this.entity?.pessoa?.telefoneCelular],
            pagamentoTipo: [this.entity?.pagamento?.pagamentoTipo],
            observacao: [this.entity?.pagamento?.observacao],
            valorPago: [this.entity?.pagamento?.valorPago],
        });
        this.loadIgrejas();
        this.createFilters();
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
        const sbUpdate = this.entityService.update(this.entity).pipe(
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
        const sbCreate = this.entityService.create(this.entity).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.EMPTY_ENTITY);
            }),
        ).subscribe((res: EncontristaModel) => {
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
        if (!this.entity.encontro?.igreja || !this.entity.encontro?.igreja?.id) {
            this.entity.encontro.igreja = new IgrejaModel();
            this.entity.encontro.igreja.id = '2f38fa31-106e-4582-b748-0faaaf751677'; // sede
        }

        if (!this.entity.pessoa?.igreja || !this.entity.pessoa?.igreja?.id) {
            this.entity.pessoa.igreja = new IgrejaModel();
            this.entity.pessoa.igreja.id = '2f38fa31-106e-4582-b748-0faaaf751677'; // sede
        }

        if (!this.entity.pessoa?.descendencia && formData.descendencia) {
            this.entity.pessoa.descendencia = new DescendenciaModel();
            this.entity.pessoa.descendencia.id = formData.descendencia;
        }

        if (!this.entity.pessoa?.lider) {
            this.entity.pessoa.lider = new PessoaModel();
        }

        this.entity.pessoa.nome = formData.nome;
        this.entity.pessoa.igreja.id = formData.igreja ? formData.igreja : '2f38fa31-106e-4582-b748-0faaaf751677';
        if (formData.descendencia) {
            this.entity.pessoa.descendencia = new DescendenciaModel();
            this.entity.pessoa.descendencia.id = formData.descendencia;
        }
        this.entity.pessoa.lider = formData.lider;
        this.entity.pessoa.dataNascimento = formData.dataNascimento;
        this.entity.pessoa.apelido = formData.apelido;
        this.entity.pessoa.sexo = formData.sexo;
        this.entity.pessoa.email = formData.email;
        this.entity.pessoa.telefoneCelular = formData.telefone;
        if (formData.pagamentoTipo) {
            if (!this.entity.pagamento) {
                this.entity.pagamento = new PagamentoEncontroModel();
            }
            this.entity.pagamento.pagamentoTipo = formData.pagamentoTipo;
        }
        this.entity.pagamento.observacao = formData.observacao;
        this.entity.pagamento.valorPago = formData.valorPago;

        if (!this.entity.pessoa.lider || !this.entity.pessoa.lider.id) {
            this.entity.pessoa.lider = undefined;
        }
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

    // igreja sede
    private loadDescendenciasDefault() {
        const sedeId = '2f38fa31-106e-4582-b748-0faaaf751677';
        const subs = this.descendenciaService.listByIgreja(sedeId).pipe(
            first(),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of([]);
            })
        ).subscribe((object: Array<DescendenciaModel>) => this.descendencias = object);
        this.subscriptions.push(subs);
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

    private loadFilterEncontreiros() {
        this.formGroupEncontrista = this.fb.group({
            pessoa: ['']
        });

        this.formGroupEncontrista.controls.pessoa.valueChanges.pipe(
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
                this.encontristas = values;
            }
        });
    }

    onChangeFilterEncontrista(value) {
        if (value) {
            this.entity = value;
        }
    }

    displayPessoa(pessoa: PessoaModel): string {
        return pessoa && pessoa.nome ? pessoa.nome : '';
    }

    private onError(err) {
        console.log(err);
        Swal.fire({
            title: 'Houve uma falha no servidor, tente novamente.',
            icon: 'error'
        });
    }
}
