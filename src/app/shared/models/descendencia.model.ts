import {BaseEntityModel} from './base-entity.model';
import {IgrejaModel} from './igreja.model';

export class DescendenciaModel implements BaseEntityModel{
    id: string;
    descricao: string;
    sigla: string;
    igreja: IgrejaModel;
}
