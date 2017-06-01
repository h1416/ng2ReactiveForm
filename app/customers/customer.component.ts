import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import { Customer } from './customer';

function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
        if (c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
            return { 'range': true }; // something is wrong
        };
        return null; // if the validation passes
    };
}

function emailMatcher(c: AbstractControl) {
    let email = c.get('email');
    let confirmEmail = c.get('confirmEmail');
    if (email.pristine || confirmEmail.pristine) { // either one has not been touched
        return null;
    }
    if (email.value === confirmEmail.value) { // values are matched
        return null;
    }

    return { 'match': true }; // both controls have been touched and their values do not match
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    customer: Customer = new Customer();
    emailMessage: string;

    // this can come from a service instead of hardcoded in here
    private validationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.customerForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.formBuilder.group({
                email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: ['', Validators.required],
            }, { validator: emailMatcher }),
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1, 5)],
            sendCatalog: true,
            addresses: this.buildAddress()
        });

        // watch for notification value changes
        this.customerForm.get('notification').valueChanges
            .subscribe(value => this.setNotification(value));

        // watch for email form control value changes
        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value =>
            this.setMessage(emailControl));
    }

    buildAddress(): FormGroup {
        return this.formBuilder.group({
            addressType: 'home',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: ''
        })
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
        }
    }

    setNotification(notifyVia: string): void {
        const phoneControl = this.customerForm.get('phone');

        if (notifyVia === 'text') {
            phoneControl.setValidators(Validators.required);
        } else {
            phoneControl.clearValidators();
        }

        phoneControl.updateValueAndValidity();
    }
}
