import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {LoginModel} from '../../_models/login.model';
import {UsuarioModel} from '../../_models/usuario.model';

const API_LOGIN_URL = `${environment.apiUrl}/login/auth/web`;
const API_LOGIN_TOKEN = `${environment.apiUrl}/login/auth/token`;
const API_USER_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(email: string, pwd: string): Observable<any> {
    const credentials = {username: email, password: pwd};
    return this.http.post<LoginModel>(API_LOGIN_URL,   credentials);
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(API_USER_URL, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USER_URL}/forgot-password`, {
      email,
    });
  }

    getUserByToken(token): Observable<LoginModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<LoginModel>(`${API_LOGIN_TOKEN}`, {
      headers: httpHeaders,
    });
  }
}
