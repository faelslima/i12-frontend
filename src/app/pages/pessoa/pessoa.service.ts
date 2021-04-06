import {Inject, Injectable} from '@angular/core';
import {GenericCrudService} from '../../shared/service/generic-crud.service';
import {PessoaModel} from '../../shared/models/pessoa.model';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PessoaService extends GenericCrudService<PessoaModel> {

    entityEndpoint = 'pessoa';
    defaultOrderBy = 'igreja.sigla desc, nome asc';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

    getPessoaByName(nome: string): Observable<PessoaModel[]> {
        const authModel = this.getAuthFromLocalStorage();
        const header = {
            headers: new HttpHeaders({
                Authorization: `Bearer ${authModel.accessToken}`
            }),
            params: new HttpParams({
                fromObject: {
                    $orderBy: (this.defaultOrderBy ? this.defaultOrderBy : 'id desc'),
                    $limit: '12'
                }
            })
        };
        return this.http.get<Array<PessoaModel>>(this.getBaseUrl() + `/basic/nome/${nome}/limit/12`, header);
    }
}
