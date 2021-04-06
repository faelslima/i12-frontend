import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EscolaridadeComponent} from './escolaridade.component';
import {EditEscolaridadeModalComponent} from './components/edit-escolaridade-modal/edit-escolaridade-modal.component';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CRUDTableModule} from '../../../_metronic/shared/crud-table';
import {InlineSVGModule} from 'ng-inline-svg';
import {EscolaridadeService} from '../../../shared/service/escolaridade.service';


@NgModule({
  declarations: [
      EscolaridadeComponent,
      EditEscolaridadeModalComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: EscolaridadeComponent,
            },
        ]),
        NgbModule,
        ReactiveFormsModule,
        CRUDTableModule,
        InlineSVGModule,
        NgbDatepickerModule,
    ],
    providers: [
        EscolaridadeService
    ]
})
export class EscolaridadeModule { }
