export const SESSION_COOKIE_BASENAME = 'vrwa-session';

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV?.toLocaleLowerCase() === 'production'
    ? `__Secure-${SESSION_COOKIE_BASENAME}`
    : SESSION_COOKIE_BASENAME;
