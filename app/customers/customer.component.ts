import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Customer } from './customer';

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent  {
    customerForm: FormGroup;
    customer: Customer= new Customer();

    save() {
        console.log(customerForm.form);
        console.log('Saved: ' + JSON.stringify(customerForm.value));
    }
 }
