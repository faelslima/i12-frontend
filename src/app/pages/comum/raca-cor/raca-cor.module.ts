import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditRacaCorModalComponent} from './components/edit-raca-cor-modal/edit-raca-cor-modal.component';
import {RacaCorComponent} from './raca-cor.component';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import {CRUDTableModule} from '../../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {RacaCorService} from 'src/app/shared/service/raca-cor.service';


@NgModule({
  declarations: [
      RacaCorComponent,
      EditRacaCorModalComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: RacaCorComponent,
            },
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
    ],
    providers: [
        RacaCorService
    ]
})
export class RacaCorModule { }
