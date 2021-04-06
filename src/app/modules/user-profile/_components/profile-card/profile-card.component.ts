import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth';
import {UsuarioModel} from '../../../auth/_models/usuario.model';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  user$: Observable<UsuarioModel>;
  constructor(public userService: AuthService) {
    this.user$ = this.userService.currentUserSubject.asObservable();
  }
}
