import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {PagamentoEncontroModel} from '../models/pagamento-encontro.model';

@Injectable({
    providedIn: 'root'
})
export class PagamentoEncontroService extends GenericCrudService<PagamentoEncontroModel> {

    entityEndpoint = 'encontro/pagamento';
    defaultOrderBy = 'id';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

}
