import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComumComponent} from './comum.component';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';

@NgModule({
    declarations: [ComumComponent],
    imports: [
        CommonModule,
        NgbModule,
        ReactiveFormsModule,
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
    ]
})
export class ComumModule {
}
