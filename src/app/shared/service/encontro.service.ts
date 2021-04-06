import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EncontroModel} from '../models/encontro.model';

@Injectable({
    providedIn: 'root'
})
export class EncontroService extends GenericCrudService<EncontroModel> {

    entityEndpoint = 'encontro';
    defaultOrderBy = 'dataInicio desc';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

}
