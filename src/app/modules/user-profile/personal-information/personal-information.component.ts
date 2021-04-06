import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {first} from 'rxjs/operators';
import {AuthService} from '../../auth';
import {UsuarioModel} from '../../auth/_models/usuario.model';

@Component({
    selector: 'app-personal-information',
    templateUrl: './personal-information.component.html',
    styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnInit, OnDestroy {
    formGroup: FormGroup;
    user: UsuarioModel;
    firstUserState: UsuarioModel;
    subscriptions: Subscription[] = [];
    avatarPic = 'none';
    isLoading$: Observable<boolean>;

    constructor(private userService: AuthService, private fb: FormBuilder) {
        this.isLoading$ = this.userService.isLoadingSubject.asObservable();
    }

    ngOnInit(): void {
        const sb = this.userService.currentUserSubject.asObservable().pipe(
            first(user => !!user)
        ).subscribe(user => {
            this.user = Object.assign({}, user);
            this.firstUserState = Object.assign({}, user);
            this.loadForm();
        });
        this.subscriptions.push(sb);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sb => sb.unsubscribe());
    }

    loadForm() {
        this.formGroup = this.fb.group({
            pic: [''],
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            companyName: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.email])],
            website: ['', Validators.required]
        });
    }

    save() {
        this.formGroup.markAllAsTouched();
        if (!this.formGroup.valid) {
            return;
        }

        const formValues = this.formGroup.value;
        this.user = Object.assign(this.user, formValues);

        // Do request to your server for user update, we just imitate user update there
        this.userService.isLoadingSubject.next(true);
        setTimeout(() => {
            this.userService.currentUserSubject.next(Object.assign({}, this.user));
            this.userService.isLoadingSubject.next(false);
        }, 2000);
    }

    cancel() {
        this.user = Object.assign({}, this.firstUserState);
        this.loadForm();
    }

    deletePic() {
    }

    getPic() {
        return null;
    }

    // helpers for View
    isControlValid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.valid && (control.dirty || control.touched);
    }

    isControlInvalid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.invalid && (control.dirty || control.touched);
    }
}
