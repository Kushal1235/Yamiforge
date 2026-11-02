import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpAuthApi } from './http-auth-api';

describe('HttpAuthApi', () => {
  let api: HttpAuthApi;
  let http: HttpTestingController;

  /** The call goes out a tick later (after the CSRF check), so wait for it to appear. */
  const next = (url: string, method: string) =>
    vi.waitFor(() => http.expectOne((r) => r.url === url && r.method === method));

  const clearCsrfCookie = () => {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpAuthApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(HttpAuthApi);
    http = TestBed.inject(HttpTestingController);
    document.cookie = 'XSRF-TOKEN=token; path=/';
  });

  afterEach(() => {
    http.verify();
    clearCsrfCookie();
  });

  describe('me', () => {
    it('returns the member for a live session', async () => {
      const result = api.me();
      (await next('/api/auth/me', 'GET')).flush({ username: 'ravi', name: 'ravi' });

      expect(await result).toEqual({ username: 'ravi', name: 'ravi' });
    });

    it('returns null when there is no session', async () => {
      const result = api.me();
      (await next('/api/auth/me', 'GET')).flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(await result).toBeNull();
    });
  });

  describe('requestOtp', () => {
    it('posts the method and identifier', async () => {
      const result = api.requestOtp('phone', '9876543210');
      const req = await next('/api/auth/otp/request', 'POST');
      expect(req.request.body).toEqual({ method: 'phone', identifier: '9876543210' });
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(await result).toEqual({ ok: true });
    });

    it('maps 404 to not-found and anything else to unavailable', async () => {
      let result = api.requestOtp('email', 'ghost@x.com');
      (await next('/api/auth/otp/request', 'POST')).flush(
        { error: 'not-found' },
        { status: 404, statusText: 'Not Found' },
      );
      expect(await result).toEqual({ ok: false, error: 'not-found' });

      result = api.requestOtp('email', 'a@b.com');
      (await next('/api/auth/otp/request', 'POST')).flush(null, {
        status: 500,
        statusText: 'Server Error',
      });
      expect(await result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  describe('verifyOtp', () => {
    it('returns the member on success', async () => {
      const result = api.verifyOtp('email', 'a@b.com', '123456');
      const req = await next('/api/auth/otp/verify', 'POST');
      expect(req.request.body).toEqual({ method: 'email', identifier: 'a@b.com', otp: '123456' });
      req.flush({ username: 'ravi', name: 'ravi' });

      expect(await result).toEqual({ ok: true, member: { username: 'ravi', name: 'ravi' } });
    });

    it('maps 401 to wrong-code and anything else to unavailable', async () => {
      let result = api.verifyOtp('email', 'a@b.com', '000000');
      (await next('/api/auth/otp/verify', 'POST')).flush(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
      expect(await result).toEqual({ ok: false, error: 'wrong-code' });

      result = api.verifyOtp('email', 'a@b.com', '000000');
      (await next('/api/auth/otp/verify', 'POST')).error(new ProgressEvent('error'));
      expect(await result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  describe('register', () => {
    it('posts the new account', async () => {
      const result = api.register('ravi', '9876500001', 'ravi@example.com');
      const req = await next('/api/auth/register', 'POST');
      expect(req.request.body).toEqual({
        username: 'ravi',
        phone: '9876500001',
        email: 'ravi@example.com',
      });
      req.flush(null, { status: 201, statusText: 'Created' });

      expect(await result).toEqual({ ok: true });
    });

    it.each(['username-taken', 'phone-taken', 'email-taken'] as const)(
      'passes a 409 %s through',
      async (code) => {
        const result = api.register('ravi', '9876500001', 'ravi@example.com');
        (await next('/api/auth/register', 'POST')).flush(
          { error: code },
          { status: 409, statusText: 'Conflict' },
        );

        expect(await result).toEqual({ ok: false, error: code });
      },
    );

    it('treats a rejected body or an unknown 409 as unavailable', async () => {
      let result = api.register('r', '1', 'x');
      (await next('/api/auth/register', 'POST')).flush(null, {
        status: 400,
        statusText: 'Bad Request',
      });
      expect(await result).toEqual({ ok: false, error: 'unavailable' });

      result = api.register('ravi', '9876500001', 'ravi@example.com');
      (await next('/api/auth/register', 'POST')).flush(
        { error: 'something-else' },
        { status: 409, statusText: 'Conflict' },
      );
      expect(await result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  describe('CSRF cookie', () => {
    it('asks the server for one first when it is missing', async () => {
      clearCsrfCookie();
      const result = api.requestOtp('email', 'a@b.com');

      (await next('/api/auth/me', 'GET')).flush(null, { status: 401, statusText: 'Unauthorized' });
      (await next('/api/auth/otp/request', 'POST')).flush(null, {
        status: 204,
        statusText: 'No Content',
      });

      expect(await result).toEqual({ ok: true });
    });

    it('does not ask when it is already there', async () => {
      const result = api.requestOtp('email', 'a@b.com');
      (await next('/api/auth/otp/request', 'POST')).flush(null, {
        status: 204,
        statusText: 'No Content',
      });
      await result;

      http.expectNone('/api/auth/me');
    });
  });

  describe('logout', () => {
    it('ends the session, then refreshes the CSRF cookie the server just cleared', async () => {
      const result = api.logout();
      (await next('/api/auth/logout', 'POST')).flush(null, {
        status: 204,
        statusText: 'No Content',
      });
      (await next('/api/auth/me', 'GET')).flush(null, { status: 401, statusText: 'Unauthorized' });

      await expect(result).resolves.toBeUndefined();
    });

    it('does not throw when the server is unreachable', async () => {
      const result = api.logout();
      (await next('/api/auth/logout', 'POST')).error(new ProgressEvent('error'));

      await expect(result).resolves.toBeUndefined();
    });
  });
});
