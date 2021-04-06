import {Inject, Injectable} from '@angular/core';
import {GenericCrudService} from '../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {PessoaTempModel} from './pessoa-temp.model';

@Injectable({
    providedIn: 'root'
})
export class PessoaTempService extends GenericCrudService<PessoaTempModel> {

    entityEndpoint = 'univida/aluno';
    defaultOrderBy = 'nome';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

    saveList(pessoas: Array<PessoaTempModel>) {
        if (pessoas && pessoas.length > 0) {
            // tslint:disable-next-line:prefer-for-of
            for (let x = 0; x < pessoas.length; x++) {
                const item = pessoas[x];
                console.log('item', item);
                this.http.post<PessoaTempModel>(`${this.getBaseUrl()}/add/temp`, item, this.getHeaderToken()).pipe(
                    catchError(err => {
                        this._errorMessage.next(err);
                        console.log('err', err);
                        const ret = new PessoaTempModel();
                        return of(ret);
                    }),
                    finalize(() => this._isLoading$.next(false))
                );
            }
        }
    }

    saveTemp(pessoa) {
        const url = `${this.getBaseUrl()}/add/temp`;
        this.http.post<any>(url, pessoa, this.getHeaderTokenSemParametros()).subscribe();
    }
}
