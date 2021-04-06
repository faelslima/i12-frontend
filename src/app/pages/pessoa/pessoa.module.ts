import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PessoaComponent} from './pessoa.component';
import {PessoaService} from './pessoa.service';
import {RouterModule} from '@angular/router';
import {EditPessoaModalComponent} from './components/edit-pessoa-modal/edit-pessoa-modal.component';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {IgrejaService} from '../../shared/service/igreja.service';
import {DescendenciaService} from '../../shared/service/descendencia.service';
import {RacaCorService} from 'src/app/shared/service/raca-cor.service';
import {CidadeService} from 'src/app/shared/service/cidade.service';
import {EscolaridadeService} from 'src/app/shared/service/escolaridade.service';
import {EstadoCivilService} from 'src/app/shared/service/estado-civil.service';
import {MatInputModule} from '@angular/material/input';
import {PessoaTempService} from './pessoa-temp.service';
import {NgxMaskModule} from 'ngx-mask';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


// 2. Add your credentials from step 1
const config = {
    apiKey: 'AIzaSyA7v8mv5AHgGV6zV6cJJ3peAGtgRnkB4_o',
    authDomain: 'novafiladelfia-9804f.firebaseapp.com',
    databaseURL: 'https://novafiladelfia-9804f.firebaseio.com',
    projectId: 'novafiladelfia-9804f',
    storageBucket: 'novafiladelfia-9804f.appspot.com',
    messagingSenderId: '938207844915',
    appId: '1:938207844915:web:eea6cdb5267ba63bc7e146',
    measurementId: 'G-7T9L7MYS5Q'
};


@NgModule({
    declarations: [
        PessoaComponent,
        EditPessoaModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: PessoaComponent,
            },
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
        MatInputModule,
        // AngularFireModule.initializeApp(config),
        // AngularFirestoreModule, // firestore
        // AngularFireAuthModule, // auth
        // AngularFireStorageModule,
        NgxMaskModule.forRoot(),
        MatInputModule,
        MatAutocompleteModule
    ],
    providers: [
        PessoaService,
        PessoaTempService,
        IgrejaService,
        DescendenciaService,
        RacaCorService,
        CidadeService,
        EscolaridadeService,
        EstadoCivilService
    ]
})
export class PessoaModule {
}
