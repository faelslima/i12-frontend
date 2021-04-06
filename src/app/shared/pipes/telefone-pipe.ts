import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'telefone',
})
export class TelefonePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        console.log('value', value);
        return '122345 245';
    }
}
