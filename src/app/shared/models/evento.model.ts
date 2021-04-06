import {BaseEntityModel} from './base-entity.model';
import {IgrejaModel} from './igreja.model';
import {EventoTipoEnum} from '../enumetrations/evento-tipo.enum';

export class EventoModel implements BaseEntityModel {
    id: string;
    igreja: IgrejaModel;
    dataInicio: string;
    dataFim: string;
    descricao: string;
    local: string;
    eventoTipo: EventoTipoEnum;
}
