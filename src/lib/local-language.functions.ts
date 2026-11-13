import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

// Only return an approximate country; never an IP address or location coordinates.
export const getLocalCountry = createServerFn({ method: 'GET' }).handler(() => {
  const request = getRequest() as Request & { cf?: { country?: string } };
  const country = request.cf?.country;
  return country && /^[A-Z]{2}$/.test(country) ? country.toLowerCase() : null;
});