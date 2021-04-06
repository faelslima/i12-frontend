import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EscolaridadeModel} from '../models/escolaridade.model';

@Injectable({
    providedIn: 'root'
})
export class EscolaridadeService extends GenericCrudService<EscolaridadeModel> {

    entityEndpoint = 'escolaridade';
    defaultOrderBy = 'descricao';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }
}
