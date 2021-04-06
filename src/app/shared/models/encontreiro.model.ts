import {BaseEntityModel} from './base-entity.model';
import {EncontroModel} from './encontro.model';
import {PessoaModel} from './pessoa.model';
import {EncontroEquipeEnum} from '../enumetrations/encontro-equipe.enum';
import {PagamentoEncontroModel} from './pagamento-encontro.model';

export class EncontreiroModel implements BaseEntityModel {
    id: string;
    encontro: EncontroModel;
    pessoa: PessoaModel;
    equipe: EncontroEquipeEnum;
    pagamento: PagamentoEncontroModel;
}
