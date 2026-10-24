import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Auth } from '../auth/auth';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(Auth).verifyOtp('email', 'member@yamiforge.com', '1234');
  });
  afterEach(() => localStorage.clear());

  it('greets the signed-in member', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hey, member');
  });

  it('signs out and returns to the login page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button.logout').click();
    await fixture.whenStable();
    expect(TestBed.inject(Auth).isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
