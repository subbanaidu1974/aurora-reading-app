import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserRegistryService } from '../services/user-registry.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (pwd && confirm && pwd !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup-card.css'],
  standalone: false
})
export class SignupComponent {
  csvData: string | null = null;
  savedUserName: string | null = null;
  submitting = false;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    passwordGroup: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }),
    firstName: ['', [Validators.required]],
    lastName: [''],
    phone: ['', [Validators.pattern(/^[0-9+\-() ]{7,20}$/)]],
    city: [''],
    country: [''],
    dateOfBirth: [''],
    newsletter: [false],
    aboutMe: ['',[Validators.maxLength(500)]]
  });

  constructor(private fb: FormBuilder,
              private registry: UserRegistryService,
              private auth: AuthService,
              private router: Router) {}

  get f() { return this.form.controls; }
  get pg() { return (this.form.get('passwordGroup') as any).controls; }

  usernameTaken(): boolean {
    const ctrl = this.f.username;
    return ctrl.value && this.registry.isUsernameTaken(ctrl.value);
  }

  submit() {
    if (this.form.invalid || this.usernameTaken()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.form.value;
    const passwordGroup: any = val.passwordGroup || {};
    const user = {
      username: val.username!,
      password: passwordGroup.password!,
      email: val.email!,
      firstName: val.firstName!,
      lastName: val.lastName || '',
      phone: val.phone || '',
      city: val.city || '',
      country: val.country || '',
      dateOfBirth: val.dateOfBirth || '',
      newsletter: !!val.newsletter,
      aboutMe: val.aboutMe || '',
      createdAt: new Date().toISOString()
    };
    this.csvData = this.registry.addUser(user);
    this.savedUserName = user.username;
    this.auth.login(user.firstName + ' ' + (user.lastName || '')); // update auth user
    // Navigate to tasks after signup
    this.router.navigate(['/tasks']);
  }

  downloadCsv() {
    if (!this.csvData) return;
    const blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aurora-users.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
