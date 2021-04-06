import {DescendenciaModel} from './descendencia.model';
import {IgrejaModel} from './igreja.model';
import {BaseEntityModel} from './base-entity.model';

export class PessoaModel implements BaseEntityModel{
    id: string;
    nome: string;
    apelido: string;
    dataNascimento: string;
    sexo: string;
    email: string;
    telefoneCelular: string;
    igreja: IgrejaModel;
    descendencia: DescendenciaModel;
    lider: PessoaModel;
}
