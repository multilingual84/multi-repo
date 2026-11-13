import { createServerFn } from '@tanstack/react-start';
import { getRequest, setResponseHeader } from '@tanstack/react-start/server';
import { getShareDescription, resolveShareLocale } from './share-metadata';

// Public metadata only; no session, invitation token, or recipient data is read.
export const getShareMetadata = createServerFn({ method: 'GET' }).handler(() => {
  const request = getRequest();
  const url = new URL(request.url);
  const forwardedHost = url.hostname === 'localhost' ? request.headers.get('x-forwarded-host') : null;
  const origin = forwardedHost ? `https://${forwardedHost}` : url.origin;
  const locale = resolveShareLocale(request.headers.get('accept-language') ?? '');
  setResponseHeader('Vary', 'Accept-Language');
  return {
    description: getShareDescription(locale),
    locale: locale.replace('-', '_'),
    image: new URL('/social/multilingual-workforce.jpg', origin).href,
  };
});