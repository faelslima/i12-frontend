import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EncontroComponent} from './encontro.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from '../../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {NgxMaskModule} from 'ngx-mask';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {EncontreirosComponent} from './encontreiros/encontreiros.component';
import {EncontristasComponent} from './encontristas/encontristas.component';
import {EditEncontreiroModalComponent} from './encontreiros/edit-encontreiro-modal/edit-encontreiro-modal.component';
import {EditEncontroModalComponent} from './edit-encontro-modal/edit-encontro-modal.component';
import {EditEncontristaModalComponent} from './encontristas/edit-encontrista-modal/edit-encontrista-modal.component';


@NgModule({
    declarations: [
        EncontroComponent,
        EditEncontroModalComponent,
        EncontreirosComponent,
        EncontristasComponent,
        EditEncontreiroModalComponent,
        EditEncontristaModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: EncontroComponent,
            },
            {
                path: 'encontreiros',
                component: EncontreirosComponent,
            },
            {
                path: 'encontristas',
                component: EncontristasComponent,
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
    ]
})
export class EncontroModule {
}
