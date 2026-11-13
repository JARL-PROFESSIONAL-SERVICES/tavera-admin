import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowRight,
  lucideBoxes,
  lucideCheckCircle2,
  lucideEye,
  lucideEyeOff,
  lucideLock,
  lucidePackage,
  lucideReceipt,
  lucideShieldCheck,
  lucideStore,
  lucideUser,
} from '@ng-icons/lucide';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowRight,
      lucideBoxes,
      lucideCheckCircle2,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucidePackage,
      lucideReceipt,
      lucideShieldCheck,
      lucideStore,
      lucideUser,
    }),
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  @Output() loginSuccess = new EventEmitter<void>();

  username = 'owner';
  password = 'TaveraOwner2026!';
  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  setPreset(u: string, p: string): void {
    this.username = u;
    this.password = p;
    this.errorMessage.set(null);
  }

  handleLogin(): void {
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p) {
      this.errorMessage.set('Por favor ingrese usuario y contraseña.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.api.login(u, p).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.loginSuccess.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message ??
            'Credenciales no válidas o el servidor de Tavera API no responde.',
        );
      },
    });
  }
}
