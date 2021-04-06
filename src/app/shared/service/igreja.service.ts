import {Inject, Injectable} from '@angular/core';
import {GenericCrudService} from './generic-crud.service';
import {IgrejaModel} from '../models/igreja.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class IgrejaService extends GenericCrudService<IgrejaModel> {

    entityEndpoint = 'igreja';
    defaultOrderBy = 'sigla desc';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }
}
