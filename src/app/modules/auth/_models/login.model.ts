import {UsuarioModel} from './usuario.model';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import {DescendenciaModel} from 'src/app/shared/models/descendencia.model';
import {AuthModel} from './auth.model';

export class LoginModel extends AuthModel {
    prefixo: string;
    token: string;
    usuario: UsuarioModel;
    igreja: IgrejaModel;
    descendencia: DescendenciaModel;
    permissions: [];
}
