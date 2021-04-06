import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EncontreiroModel} from '../models/encontreiro.model';
import {EncontristaModel} from '../models/encontrista.model';

@Injectable({
    providedIn: 'root'
})
export class EncontristaService extends GenericCrudService<EncontristaModel> {

    entityEndpoint = 'encontro/encontrista';
    defaultOrderBy = 'pessoa.nome';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

}
