import {BaseEntityModel} from './base-entity.model';

export class IgrejaModel implements BaseEntityModel {
    id: string;
    razaoSocial: string;
    sigla: string;
    cnpj: string;
}
