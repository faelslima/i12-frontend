import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EncontreiroModel} from '../models/encontreiro.model';

@Injectable({
    providedIn: 'root'
})
export class EncontreiroService extends GenericCrudService<EncontreiroModel> {

    entityEndpoint = 'encontro/encontreiro';
    defaultOrderBy = 'pessoa.nome';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

}
