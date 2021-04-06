import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NovaVidaComponent} from './nova-vida.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from 'src/app/_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {EditNovaVidaModalComponent} from './components/edit-descendencia-modal/edit-nova-vida-modal.component';
import {NovaVidaService} from '../../../shared/service/nova-vida.service';
import {IgrejaService} from '../../../shared/service/igreja.service';
import {DescendenciaService} from '../../../shared/service/descendencia.service';
import {PessoaService} from '../../pessoa/pessoa.service';
import {CidadeService} from '../../../shared/service/cidade.service';
import {NgxMaskModule} from 'ngx-mask';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
    declarations: [
        NovaVidaComponent,
        EditNovaVidaModalComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: NovaVidaComponent,
            },
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
        NovaVidaService,
        IgrejaService,
        DescendenciaService,
        PessoaService,
        CidadeService
    ]
})
export class NovaVidaModule {
}
