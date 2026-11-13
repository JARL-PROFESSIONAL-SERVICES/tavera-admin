// @vitest-environment jsdom
import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeService } from './theme.service.js';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    service = new ThemeService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with system or saved mode', () => {
    expect(service.currentTheme()).toBeDefined();
  });

  it('sets dark mode correctly', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets light mode correctly', () => {
    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
