import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DescendenciaComponent} from './descendencia.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from 'src/app/_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {IgrejaService} from '../../../shared/service/igreja.service';
import {DescendenciaService} from '../../../shared/service/descendencia.service';
import {EditDescendenciaModalComponent} from './components/edit-descendencia-modal/edit-descendencia-modal.component';


@NgModule({
    declarations: [
        DescendenciaComponent,
        EditDescendenciaModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: DescendenciaComponent,
            },
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
    ],
    providers: [
        DescendenciaService,
        IgrejaService
    ]
})
export class DescendenciaModule {
}
