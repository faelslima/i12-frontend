import {BaseEntityModel} from './base-entity.model';

export class CidadeModel implements BaseEntityModel {
    id: string;
    descricao: string;
    uf: string;
}
