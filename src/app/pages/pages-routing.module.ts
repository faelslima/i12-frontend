import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './_layout/layout.component';
import {UniVidaAlunosComponent} from './consolidacao/univida/alunos/univida-alunos.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'pessoa',
                loadChildren: () => import('./pessoa/pessoa.module').then((m) => m.PessoaModule),
            },
            {
                path: 'descendencia',
                loadChildren: () => import('./comum/descendencia/descendencia.module').then((m) => m.DescendenciaModule),
            },
            {
                path: 'nova-vida',
                loadChildren: () => import('./consolidacao/nova-vida/nova-vida.module').then((m) => m.NovaVidaModule),
            },
            {
                path: 'univida',
                loadChildren: () => import('./consolidacao/univida/univida.module').then((m) => m.UnividaModule)
            },
            {
                path: 'encontro',
                loadChildren: () => import('./consolidacao/encontro/encontro.module').then((m) => m.EncontroModule)
            },
            {
                path: '',
                redirectTo: '/nova-vida',
                pathMatch: 'full',
            },
            {
                path: '**',
                redirectTo: 'error/404',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule {
}
