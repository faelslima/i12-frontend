import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {EstadoCivilModel} from '../models/estado-civil.model';

@Injectable({
    providedIn: 'root'
})
export class EstadoCivilService extends GenericCrudService<EstadoCivilModel> {

    entityEndpoint = 'estadocivil';
    defaultOrderBy = 'descricao';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }
}
