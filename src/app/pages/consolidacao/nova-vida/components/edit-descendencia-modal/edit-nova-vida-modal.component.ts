import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {Observable, of, Subscription} from 'rxjs';
import {catchError, debounceTime, finalize, first, map, startWith, switchMap, tap} from 'rxjs/operators';
import {DescendenciaModel} from 'src/app/shared/models/descendencia.model';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import Swal from 'sweetalert2';
import {DescendenciaService} from 'src/app/shared/service/descendencia.service';
import {NovaVidaModel} from 'src/app/shared/models/nova-vida.model';
import {NovaVidaService} from 'src/app/shared/service/nova-vida.service';
import {CustomAdapter, CustomDateParserFormatter} from 'src/app/_metronic/core';
import {IgrejaService} from 'src/app/shared/service/igreja.service';
import {PessoaModel} from 'src/app/shared/models/pessoa.model';
import {EnderecoModel} from 'src/app/shared/models/endereco.model';
import {CidadeModel} from '../../../../../shared/models/cidade.model';
import {PessoaService} from '../../../../pessoa/pessoa.service';
import {CidadeService} from '../../../../../shared/service/cidade.service';
import {PedidoOracaoEnum} from '../../../../../shared/enumetrations/pedido-oracao.enum';
import {TipoConfissaoEnum} from '../../../../../shared/enumetrations/tipo-confissao.enum';

const EMPTY_ENTITY: NovaVidaModel = new NovaVidaModel();
EMPTY_ENTITY.igreja = new IgrejaModel();
EMPTY_ENTITY.descendencia = new DescendenciaModel();
EMPTY_ENTITY.lider = new PessoaModel();
EMPTY_ENTITY.endereco = new EnderecoModel();

@Component({
    selector: 'app-edit-nova-vida-modal',
    templateUrl: './edit-nova-vida-modal.component.html',
    styleUrls: ['./edit-nova-vida-modal.component.scss'],
    providers: [
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
    ]
})
export class EditNovaVidaModalComponent implements OnInit, OnDestroy {
    @Input() id: number | string;
    isLoading$;
    novaVidaModel: NovaVidaModel;
    formGroup: FormGroup;
    igrejas: Array<IgrejaModel>;
    descendencias: Array<DescendenciaModel>;
    pessoas: PessoaModel[];
    cidades: CidadeModel[];
    pedidosOracao: Array<PedidoOracaoEnum>;
    tiposConfissao: Array<TipoConfissaoEnum>;
    isLoadingCidade = false;
    isLoadingPessoa = false;
    formControlCidade = new FormControl();
    tipoSexo = [{value: 'M', descricao: 'Masculino'}, {value: 'F', descricao: 'Feminino'}];
    private subscriptions: Subscription[] = [];

    constructor(
        private igrejaService: IgrejaService,
        private novaVidaService: NovaVidaService,
        private descendenciaService: DescendenciaService,
        private pessoaService: PessoaService,
        private cidadeService: CidadeService,
        private fb: FormBuilder, public modal: NgbActiveModal
    ) {
    }

    ngOnInit(): void {
        this.isLoading$ = this.descendenciaService.isLoading$;
        this.loadNovaVida();
        this.loadDescendenciasDefault();

        this.initEnums();
    }

    private loadNovaVida() {
        if (!this.id) {
            this.novaVidaModel = EMPTY_ENTITY;
            this.loadForm();
        } else {
            const sb = this.novaVidaService.getItemById(this.id).pipe(
                first(),
                catchError((errorMessage) => {
                    this.modal.dismiss(errorMessage);
                    return of(EMPTY_ENTITY);
                })
            ).subscribe((object: NovaVidaModel) => {
                this.novaVidaModel = object;
                if (object.endereco?.cidade?.id) {
                    this.cidades = [];
                    this.cidades.push(object.endereco.cidade);
                }
                if (object.lider?.id) {
                    this.pessoas = [];
                    this.pessoas.push(object.lider);
                }
                this.loadForm();
            });
            this.subscriptions.push(sb);
        }
    }

    private loadForm() {
        if (!this.novaVidaModel) {
            this.novaVidaModel = EMPTY_ENTITY;
        }
        this.formGroup = this.fb.group({
            nome: [this.novaVidaModel.nome, Validators.compose([Validators.required, Validators.minLength(3)])],
            igreja: [this.novaVidaModel.igreja?.id],
            dataNascimento: [this.novaVidaModel.dataNascimento],
            telefone: [this.novaVidaModel.telefone],
            email: [this.novaVidaModel.email],
            descendencia: [this.novaVidaModel.descendencia?.id],
            pedidoOracao: [this.novaVidaModel.pedidoOracao],
            tipoConfissao: [this.novaVidaModel.tipoConfissao, Validators.compose([Validators.required])],
            sexo: [this.novaVidaModel.sexo, Validators.compose([Validators.required])],
            lider: [this.novaVidaModel.lider],
            enderecoCidade: [this.novaVidaModel.endereco?.cidade],
            enderecoBairro: [this.novaVidaModel.endereco?.bairro],
            enderecoLogradouro: [this.novaVidaModel.endereco?.logradouro],
            enderecoLogradouroNumero: [this.novaVidaModel.endereco?.numero],
            enderecoLogradouroCep: [this.novaVidaModel.endereco?.cep]
        });
        this.loadIgrejas();
        this.createFilters();
    }

    save() {
        this.prepareNovaVida();
        if (this.novaVidaModel.id) {
            this.edit();
        } else {
            this.create();
        }
        this.novaVidaModel = undefined;
    }

    edit() {
        const sbUpdate = this.novaVidaService.update(this.novaVidaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.novaVidaModel);
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
        const sbCreate = this.novaVidaService.create(this.novaVidaModel).pipe(
            tap(() => {
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.novaVidaModel);
            }),
        ).subscribe((res: NovaVidaModel) => {
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

        if (!this.novaVidaModel) {
            this.novaVidaModel = EMPTY_ENTITY;
        }
        if (!this.novaVidaModel.igreja || !this.novaVidaModel.igreja.id) {
            this.novaVidaModel.igreja = new IgrejaModel();
            this.novaVidaModel.igreja.id = '2f38fa31-106e-4582-b748-0faaaf751677'; // sede
        }
        if (!this.novaVidaModel.descendencia) {
            this.novaVidaModel.descendencia = new DescendenciaModel();
        }
        if (!this.novaVidaModel.lider) {
            this.novaVidaModel.lider = new PessoaModel();
        }
        if (!this.novaVidaModel.endereco) {
            this.novaVidaModel.endereco = new EnderecoModel();
        }

        this.novaVidaModel.nome = formData.nome;
        this.novaVidaModel.dataNascimento = formData.dataNascimento;
        this.novaVidaModel.email = formData.email;
        this.novaVidaModel.telefone = formData.telefone;
        this.novaVidaModel.pedidoOracao = formData.pedidoOracao;
        this.novaVidaModel.endereco.logradouro = formData.enderecoLogradouro;
        this.novaVidaModel.endereco.bairro = formData.enderecoBairro;
        this.novaVidaModel.endereco.numero = formData.enderecoLogradouroNumero;
        this.novaVidaModel.endereco.cep = formData.enderecoLogradouroCep;
        this.novaVidaModel.endereco.cidade = formData.enderecoCidade;
        this.novaVidaModel.igreja.id = formData.igreja ? formData.igreja : '2f38fa31-106e-4582-b748-0faaaf751677';
        this.novaVidaModel.descendencia.id = formData.descendencia;
        this.novaVidaModel.tipoConfissao = formData.tipoConfissao;
        this.novaVidaModel.sexo = formData.sexo;
        this.novaVidaModel.lider = formData.lider;

        if (!this.novaVidaModel.lider || !this.novaVidaModel.lider.id) {
            this.novaVidaModel.lider = undefined;
        }
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
        this.formGroup.controls.enderecoCidade.valueChanges.pipe(
            debounceTime(500),
            tap(() => {
                this.cidades = [];
                this.isLoadingCidade = true;
            }),
            switchMap(value => this.cidadeService.getCidadeByDescricao(value).pipe(
                finalize(() => this.isLoadingCidade = false)
            ))
        ).subscribe(values => {
            if (values) {
                this.cidades = values;
            }
        });

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

    displayCidade(cidade: CidadeModel): string {
        return cidade && cidade.descricao ? `${cidade.descricao}, ${cidade.uf}` : '';
    }

    private onError(err) {
        console.log(err);
        Swal.fire({
            title: 'Houve uma falha no servidor, tente novamente.',
            icon: 'error'
        });
    }

    private initEnums() {
        this.pedidosOracao = new Array<PedidoOracaoEnum>();
        this.pedidosOracao.push(PedidoOracaoEnum.CASAMENTO);
        this.pedidosOracao.push(PedidoOracaoEnum.FAMILIA);
        this.pedidosOracao.push(PedidoOracaoEnum.FINANCEIRA);
        this.pedidosOracao.push(PedidoOracaoEnum.MINISTERIAL);
        this.pedidosOracao.push(PedidoOracaoEnum.SAUDE);
        this.pedidosOracao.push(PedidoOracaoEnum.TRABALHO);

        this.tiposConfissao = new Array<TipoConfissaoEnum>();
        this.tiposConfissao.push(TipoConfissaoEnum.NOVA_VIDA);
        this.tiposConfissao.push(TipoConfissaoEnum.RECONCILIACAO);
        this.tiposConfissao.push(TipoConfissaoEnum.SOMENTE_VISITA);
        this.tiposConfissao.push(TipoConfissaoEnum.OUTRO);
    }
}
