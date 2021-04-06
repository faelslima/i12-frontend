import {BaseEntityModel} from './base-entity.model';
import {PessoaModel} from './pessoa.model';
import {UniVidaTurmaModel} from './univida-turma.model';

export class UniVidaAlunoModel implements BaseEntityModel {
    id: string;
    dataHoraInscricao: string;
    adquiriuLivro: boolean;
    adquiriuCamisa: boolean;
    valorPagoLivro: number;
    valorPagoCamisa: number;
    pessoa: PessoaModel;
    turma: UniVidaTurmaModel;
    frequentaOutraIgreja: boolean;
    nomeOutraIgreja: string;
}
