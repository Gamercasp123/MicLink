export const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

export const isValidIp = (value: string): boolean => IPV4_PATTERN.test(value.trim());

export const isValidPort = (value: string): boolean => {
  const port = Number(value.trim());
  return Number.isInteger(port) && port > 0 && port <= 65535;
};
