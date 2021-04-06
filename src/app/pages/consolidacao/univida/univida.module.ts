import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniVidaTurmasComponent} from './turmas/univida-turmas.component';
import {UniVidaAlunosComponent} from './alunos/univida-alunos.component';
import {UniVidaFrequenciaComponent} from './frequencia/univida-frequencia.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from '../../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {NgxMaskModule} from 'ngx-mask';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {UniVidaComponent} from './univida.component';
import {EditUniVidaTurmaModalComponent} from './turmas/components/edit-univida-turma-modal/edit-univida-turma-modal.component';
import {EditUniVidaAlunoModalComponent} from './alunos/components/edit-univida-aluno-modal/edit-univida-aluno-modal.component';
import {PessoaService} from '../../pessoa/pessoa.service';


@NgModule({
    declarations: [
        UniVidaComponent,
        UniVidaTurmasComponent,
        UniVidaAlunosComponent,
        UniVidaFrequenciaComponent,
        EditUniVidaTurmaModalComponent,
        EditUniVidaAlunoModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: UniVidaTurmasComponent,
            },
            {
                path: 'alunos',
                component: UniVidaAlunosComponent
            }
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
        NgxMaskModule.forRoot(),
        MatInputModule,
        MatAutocompleteModule
    ],
    providers: [
        PessoaService
    ]
})
export class UnividaModule {
}
