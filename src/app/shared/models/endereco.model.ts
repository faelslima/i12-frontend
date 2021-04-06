import {BaseEntityModel} from './base-entity.model';
import {CidadeModel} from './cidade.model';
import {PessoaModel} from './pessoa.model';

export class EnderecoModel implements BaseEntityModel {
    id: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cep: string;
    cidade: CidadeModel;
    pessoa: PessoaModel;
}
