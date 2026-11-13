import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'tavera_theme';
  readonly currentTheme = signal<ThemeMode>('system');
  readonly isDark = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  setTheme(mode: ThemeMode): void {
    this.currentTheme.set(mode);
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {
      // In restricted or iframe environments, localStorage might fail gracefully
    }
    this.applyTheme(mode);
  }

  private initTheme(): void {
    let saved: ThemeMode = 'system';
    try {
      const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        saved = stored;
      }
    } catch {
      saved = 'system';
    }

    this.currentTheme.set(saved);
    this.applyTheme(saved);

    if (typeof window !== 'undefined' && window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.currentTheme() === 'system') {
            this.applyTheme('system');
          }
        });
    }
  }

  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') {
      return;
    }

    let shouldBeDark = false;
    if (mode === 'dark') {
      shouldBeDark = true;
    } else if (mode === 'light') {
      shouldBeDark = false;
    } else {
      shouldBeDark =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    }

    this.isDark.set(shouldBeDark);
    const root = document.documentElement;

    if (shouldBeDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  }
}
