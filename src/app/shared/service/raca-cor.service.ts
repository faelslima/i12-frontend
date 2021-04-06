import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {RacaCorModel} from '../models/raca-cor.model';

@Injectable({
    providedIn: 'root'
})
export class RacaCorService extends GenericCrudService<RacaCorModel> {

    entityEndpoint = 'racacor';
    defaultOrderBy = 'descricao';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }
}
