import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EscolaridadeModel} from '../models/escolaridade.model';
import {UniVidaTurmaModel} from '../models/univida-turma.model';

@Injectable({
    providedIn: 'root'
})
export class UniVidaTurmaService extends GenericCrudService<UniVidaTurmaModel> {

    entityEndpoint = 'univida/turma';
    defaultOrderBy = 'dataInicio desc';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }
}
