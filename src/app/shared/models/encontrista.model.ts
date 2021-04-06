import {BaseEntityModel} from './base-entity.model';
import {EncontroModel} from './encontro.model';
import {PessoaModel} from './pessoa.model';
import {PagamentoEncontroModel} from './pagamento-encontro.model';

export class EncontristaModel implements BaseEntityModel {
    id: string;
    encontro: EncontroModel;
    pessoa: PessoaModel;
    pagamento: PagamentoEncontroModel;
}
