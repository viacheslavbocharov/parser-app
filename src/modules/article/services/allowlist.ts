export const allowedHosts = new Set<string>([
  "www.theregister.com",
  "theregister.com",
  "science.nasa.gov",
  "www.science.nasa.gov",
]);

export function isAllowedHost(host: string) {
  return allowedHosts.has(host);
}
