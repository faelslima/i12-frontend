import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {AuthModel} from '../_models/auth.model';
import {environment} from 'src/environments/environment';
import {Router} from '@angular/router';
import {UsuarioModel} from '../_models/usuario.model';
import {LoginModel} from '../_models/login.model';
import {AuthHTTPService} from './auth-http/auth-http.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService implements OnDestroy {
    // private fields
    private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

    // public fields
    currentUser$: Observable<UsuarioModel>;
    isLoading$: Observable<boolean>;
    currentUserSubject: BehaviorSubject<UsuarioModel>;
    isLoadingSubject: BehaviorSubject<boolean>;


    get currentUserValue(): UsuarioModel {
        return this.currentUserSubject.value;
    }

    set currentUserValue(user: UsuarioModel) {
        this.currentUserSubject.next(user);
    }

    constructor(
        private authHttpService: AuthHTTPService,
        private router: Router
    ) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.currentUserSubject = new BehaviorSubject<UsuarioModel>(undefined);
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const subscr = this.getUserByToken().subscribe();
        this.unsubscribe.push(subscr);
    }

    // public methods
    login(email: string, password: string): Observable<LoginModel> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.login(email, password).pipe(
            map((auth: LoginModel) => {
                const result = this.setAuthFromLocalStorage(auth);
                return result;
            }),
            switchMap(() => this.getUserByToken()),
            catchError((err) => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    logout() {
        localStorage.removeItem(this.authLocalStorageToken);
        this.router.navigate(['/auth/login'], {
            queryParams: {},
        });
    }

    getUserByToken(): Observable<LoginModel> {
        const auth = this.getAuthFromLocalStorage();
        if (!auth || !auth.accessToken) {
            return of(undefined);
        }

        this.isLoadingSubject.next(true);
        return this.authHttpService.getUserByToken(auth.accessToken).pipe(
            map((obj: LoginModel) => {
                if (obj) {
                    this.currentUserSubject = new BehaviorSubject<UsuarioModel>(obj.usuario);
                } else {
                    this.logout();
                }
                return obj;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // need create new user then login
    registration(user: UsuarioModel): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.createUser(user).pipe(
            map(() => {
                this.isLoadingSubject.next(false);
            }),
            switchMap(() => this.login(user.email, user.userPassword)),
            catchError((err) => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    forgotPassword(email: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.authHttpService
            .forgotPassword(email)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    // private methods
    private setAuthFromLocalStorage(auth: LoginModel): boolean {
        if (auth && auth.token) {
            const authModel = new AuthModel();
            authModel.accessToken = auth.token;
            authModel.expiresIn = new Date(Date.now() * 24 * 60 * 1000);
            localStorage.setItem(this.authLocalStorageToken, JSON.stringify(authModel));
            return true;
        }
        return false;
    }

    private getAuthFromLocalStorage(): AuthModel {
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

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
