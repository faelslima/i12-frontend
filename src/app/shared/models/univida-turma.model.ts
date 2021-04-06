import {BaseEntityModel} from './base-entity.model';
import {IgrejaModel} from './igreja.model';
import {DiaSemanaEnum} from '../enumetrations/dia-semana.enum';

export class UniVidaTurmaModel implements BaseEntityModel {
    id: string;
    igreja: IgrejaModel;
    dataInicio: string;
    dataTermino: string;
    horaAula: string;
    diaSemana: DiaSemanaEnum;
    local: string;
    qtdAlunos: number;

}
