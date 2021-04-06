import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {AuthModel} from '../../modules/auth/_models/auth.model';
import {environment} from 'src/environments/environment';
import {FilterState, GroupingState, ITableState, PaginatorState, SortState, TableResponseModel} from '../../_metronic/shared/crud-table';
import {catchError, finalize, tap} from 'rxjs/operators';
import {BaseEntityModel} from '../models/base-entity.model';
import {RestrictionTypeEnum} from '../../_metronic/shared/crud-table/models/restriction-type-enum';

const DEFAULT_STATE: ITableState = {
    filter: new Array<FilterState>(),
    paginator: new PaginatorState(),
    sorting: new SortState(),
    searchTerm: '',
    grouping: new GroupingState(),
    entityId: undefined
};

export abstract class GenericCrudService<T> {
    // Private fields
    private _items$ = new BehaviorSubject<T[]>([]);
    private entity: T;
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    protected _isLoading$ = new BehaviorSubject<boolean>(false);
    private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
    private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
    protected _errorMessage = new BehaviorSubject<string>('');
    private _subscriptions: Subscription[] = [];

    // Abstract fields
    abstract entityEndpoint: string;
    abstract defaultOrderBy: string;
    defaultQueryParam: FilterState;

    // Getters
    get items$() {
        return this._items$.asObservable();
    }

    get isLoading$() {
        return this._isLoading$.asObservable();
    }

    get isFirstLoading$() {
        return this._isFirstLoading$.asObservable();
    }

    get errorMessage$() {
        return this._errorMessage.asObservable();
    }

    get subscriptions() {
        return this._subscriptions;
    }

    // State getters
    get paginator() {
        return this._tableState$.value.paginator;
    }

    get filter() {
        return this._tableState$.value.filter;
    }

    get sorting() {
        return this._tableState$.value.sorting;
    }

    get searchTerm() {
        return this._tableState$.value.searchTerm;
    }

    get grouping() {
        return this._tableState$.value.grouping;
    }

    protected http: HttpClient;

    protected constructor(http: HttpClient) {
        this.http = http;
    }

    create(entity: T): Observable<T> {
        this._isLoading$.next(true);
        this._errorMessage.next('');
        return this.http.post<T>(`${this.getBaseUrl()}/save`, entity, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                return of(this.entity);
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }

    update(entity: T): Observable<T> {
        this._isLoading$.next(true);
        this._errorMessage.next('');
        return this.http.put<T>(`${this.getBaseUrl()}/edit`, entity, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                return of(this.entity);
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }

    delete(id: string | number): Observable<any> {
        this._isLoading$.next(true);
        this._errorMessage.next('');
        return this.http.delete(`${this.getBaseUrl()}/delete/${id}`, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                return of(this.entity);
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }

    listAll(): Observable<Array<T>> {
        return this.http.get<Array<T>>(this.getBaseUrl() + `/list`, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                return of([]);
            })
        );
    }

    find(tableState: ITableState): Observable<TableResponseModel<T>> {
        const url = `${this.getBaseUrl()}/metronic/list`;
        this._errorMessage.next('');
        return this.http.post<TableResponseModel<T>>(url, tableState, this.getHeaderToken())
            .pipe(
                catchError(err => {
                    this._errorMessage.next(err);
                    return of({items: [], total: 0});
                })
            );
    }

    getItemById(id: string | number): Observable<T> {
        this._isLoading$.next(true);
        this._errorMessage.next('');
        return this.http.get<T>(this.getBaseUrl() + `/find/${id}`, this.getHeaderToken()).pipe(
            catchError(err => {
                this._errorMessage.next(err);
                return of(this.entity);
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }

    protected getBaseUrl(): string {
        return `${environment.apiUrl}/${this.entityEndpoint}`;
    }

    getHeaderToken(): object {
        const authModel = this.getAuthFromLocalStorage();
        if (authModel) {

            let filter = '';
            if (this.defaultQueryParam) {
                filter = ``;
            }

            return {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${authModel.accessToken}`
                }),
                params: new HttpParams({
                    fromObject: {
                        $orderBy: (this.defaultOrderBy ? this.defaultOrderBy : 'id desc'),
                        $filter: filter
                    }
                })
            };
        }
        return null;
    }

    getHeaderTokenSemParametros(): object {
        const authModel = this.getAuthFromLocalStorage();
        if (authModel) {
            return {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${authModel.accessToken}`
                })
            };
        }
        return null;
    }

    getHeaderTokenWithFilter(filter: Array<FilterState>): object {
        const authModel = this.getAuthFromLocalStorage();
        if (authModel) {
            const httpParams = new HttpParams();
            httpParams.append('$orderBy', (this.defaultOrderBy ? this.defaultOrderBy : 'id desc'));

            if (filter && filter.length > 0) {
                let queryString = '';
                filter.forEach(it => {
                    const condition = it.restrictionType ? RestrictionTypeEnum[it.restrictionType] : 'equals';
                    queryString += `${it.column} ${condition} ${it.value} and `;
                });
                if (queryString && queryString.trim().length > 0) {
                    httpParams.append('$filter', queryString);
                }
            }
            const header = new HttpHeaders({Authorization: `Bearer ${authModel.accessToken}`});

            return {
                headers: header,
                params: httpParams
            };
        }
        return null;
    }

    protected getAuthFromLocalStorage(): AuthModel {
        try {
            const authData = JSON.parse(
                localStorage.getItem(this.authLocalStorageToken)
            );
            return authData;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public fetch() {
        this._isLoading$.next(true);
        this._errorMessage.next('');
        const request = this.find(this._tableState$.value)
            .pipe(
                tap((res: TableResponseModel<T>) => {
                    this._items$.next(res.items);
                    this.patchStateWithoutFetch({
                        paginator: this._tableState$.value.paginator.recalculatePaginator(
                            res.total
                        ),
                    });
                }),
                catchError((err) => {
                    this._errorMessage.next(err);
                    return of({
                        items: [],
                        total: 0
                    });
                }),
                finalize(() => {
                    this._isLoading$.next(false);
                    const itemIds = this._items$.value.map((el: T) => {
                        const item = (el as unknown) as BaseEntityModel;
                        return item.id;
                    });
                    this.patchStateWithoutFetch({
                        grouping: this._tableState$.value.grouping.clearRows(itemIds),
                    });
                })
            )
            .subscribe();
        this._subscriptions.push(request);
    }

    public setDefaults() {
        this.patchStateWithoutFetch({filter: new Array<FilterState>()});
        this.patchStateWithoutFetch({sorting: new SortState()});
        this.patchStateWithoutFetch({grouping: new GroupingState()});
        this.patchStateWithoutFetch({searchTerm: ''});
        this.patchStateWithoutFetch({
            paginator: new PaginatorState()
        });
        this._isFirstLoading$.next(true);
        this._isLoading$.next(true);
        this._tableState$.next(DEFAULT_STATE);
        this._errorMessage.next('');
    }

    // Base Methods
    public patchState(patch: Partial<ITableState>) {
        this.patchStateWithoutFetch(patch);
        this.fetch();
    }

    public patchStateWithoutFetch(patch: Partial<ITableState>) {
        const newState = Object.assign(this._tableState$.value, patch);
        this._tableState$.next(newState);
    }
}
