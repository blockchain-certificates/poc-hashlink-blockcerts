function createHeaders (): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  return headers;
}

export function setFormHeaders (): Headers {
  const headers = createHeaders();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');
  return headers;
}

export function setHeaders (): Headers {
  const headers = createHeaders();
  headers.append('Content-Type', 'application/json');
  return headers;
}

export function setAuthorizationHeaders (token: string): Headers {
  const headers = createHeaders();
  headers.append('Authorization', `Bearer ${token}`);
  return headers;
}
