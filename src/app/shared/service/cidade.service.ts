import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {GenericCrudService} from './generic-crud.service';
import {CidadeModel} from '../models/cidade.model';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CidadeService extends GenericCrudService<CidadeModel> {

    entityEndpoint = 'cidade';
    defaultOrderBy = 'descricao';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

    getCidadeByDescricao(descricao: string): Observable<CidadeModel[]> {
        const authModel = this.getAuthFromLocalStorage();
        const header =  {
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
        return this.http.get<Array<CidadeModel>>(this.getBaseUrl() + `/descricao/${descricao}`, header);
    }
}
