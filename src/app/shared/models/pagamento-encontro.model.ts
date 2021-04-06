import {PagamentoModel} from './pagamento.model';
import {EncontreiroModel} from './encontreiro.model';
import {EncontristaModel} from './encontrista.model';

export class PagamentoEncontroModel extends PagamentoModel {
    encontreiro: EncontreiroModel;
    encontrista: EncontristaModel;
}
