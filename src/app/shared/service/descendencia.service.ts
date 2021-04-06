import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DescendenciaModel} from 'src/app/shared/models/descendencia.model';
import {GenericCrudService} from 'src/app/shared/service/generic-crud.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DescendenciaService extends GenericCrudService<DescendenciaModel> {

    entityEndpoint = 'descendencia';
    defaultOrderBy = 'igreja.sigla, sigla';

    constructor(@Inject(HttpClient) http) {
        super(http);
    }

    listByIgreja(igrejaId: string): Observable<Array<DescendenciaModel>> {
        return this.http.get<Array<DescendenciaModel>>(this.getBaseUrl() + `/basic/${igrejaId}`, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                const args: any = new Array<DescendenciaModel>();
                return of(args);
            })
        );
    }
}
