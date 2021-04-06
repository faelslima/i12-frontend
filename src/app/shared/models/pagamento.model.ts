import {BaseEntityModel} from './base-entity.model';
import {EventoModel} from './evento.model';
import {PagamentoTipoEnum} from '../enumetrations/pagamento-tipo.enum';

export class PagamentoModel implements BaseEntityModel {
    id: string;
    evento: EventoModel;
    valorPago: number;
    pagamentoTipo: PagamentoTipoEnum;
    observacao: string;
}
