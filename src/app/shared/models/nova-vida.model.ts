import {BaseEntityModel} from './base-entity.model';
import {PessoaModel} from './pessoa.model';
import {DescendenciaModel} from './descendencia.model';
import {PedidoOracaoEnum} from '../enumetrations/pedido-oracao.enum';
import {IgrejaModel} from './igreja.model';
import {EnderecoModel} from './endereco.model';
import {TipoConfissaoEnum} from '../enumetrations/tipo-confissao.enum';

export class NovaVidaModel implements BaseEntityModel {
    id: string;
    nome: string;
    telefone: string;
    email: string;
    sexo: string;
    dataNascimento: string;
    dataConversao: string;
    tipoConfissao: TipoConfissaoEnum;
    igreja: IgrejaModel;
    descendencia: DescendenciaModel;
    lider: PessoaModel;
    pedidoOracao: PedidoOracaoEnum;
    endereco: EnderecoModel;
}
