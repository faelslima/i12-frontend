import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {NovaVidaModel} from '../models/nova-vida.model';
import {EnderecoModel} from '../models/endereco.model';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NovaVidaService extends GenericCrudService<NovaVidaModel> {

    entityEndpoint = 'novavida';
    defaultOrderBy = 'nome';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

}
