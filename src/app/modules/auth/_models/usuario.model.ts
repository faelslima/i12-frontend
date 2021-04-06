import {AuthModel} from './auth.model';
import {PessoaModel} from 'src/app/shared/models/pessoa.model';
import {IgrejaModel} from 'src/app/shared/models/igreja.model';
import {BaseEntityModel} from 'src/app/shared/models/base-entity.model';

export class UsuarioModel implements BaseEntityModel {
    id: string;
    dataCadastro: string;
    nome: string;
    email: string;
    userPassword: string;
    userLogin: string;
    igreja: IgrejaModel;
    pessoa: PessoaModel;
    pic: any;

    setUsuario(user: any) {
        this.id = user.id;
        this.nome = user.nome;
        this.email = user.email;
    }
}
