import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {UniVidaAlunoModel} from '../models/univida-aluno.model';
import {FilterState} from '../../_metronic/shared/crud-table';

@Injectable({
    providedIn: 'root'
})
export class UniVidaAlunoService extends GenericCrudService<UniVidaAlunoModel> {

    entityEndpoint = 'univida/aluno';
    defaultOrderBy = 'pessoa.nome desc';
    defaultQueryParam: FilterState;

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

    setDefaultQueryParam(param: FilterState): void {
        this.defaultQueryParam = param;
    }
}
