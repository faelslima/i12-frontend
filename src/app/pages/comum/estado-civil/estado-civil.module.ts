import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EstadoCivilComponent} from './estado-civil.component';
import {EditEstadoCivilModalComponent} from './components/edit-estado-civil-modal/edit-estado-civil-modal.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from '../../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {EstadoCivilService} from 'src/app/shared/service/estado-civil.service';


@NgModule({
    declarations: [
        EstadoCivilComponent,
        EditEstadoCivilModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: EstadoCivilComponent,
            },
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
    ],
    providers: [
        EstadoCivilService
    ]
})
export class EstadoCivilModule {
}
