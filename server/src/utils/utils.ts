export function expireStringToNumber(expireString: string): number {
  switch (expireString) {
    case '1d':
      return 86400;
    case '1w':
      return 604800;
    case '1m':
      return 2592000;
    case '1y':
      return 31536000;
    case "never":
      return -1;
    case '1h':
    default:
      return 3600;
  }
}
