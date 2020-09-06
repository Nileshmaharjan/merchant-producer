import * as argon from 'argon2';
import { format } from 'date-fns';
import * as atob from 'atob';

export const isObjectEmpty = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};

export async function hashString(string): Promise<string> {
  return argon.hash(string, {
    type: argon.argon2d,
    hashLength: 50,
  });
}

export function arrayDiff(arr1, arr2) {
  return arr1.filter(x => !arr2.includes(x));
}

export async function verifyHash(string, hash): Promise<boolean> {
  return argon.verify(string, hash);
}

export function hasNext(page: number, totalPages: number, hostAddress: string) {
  if (page === totalPages) {
    return '';
  } else {
    return `${hostAddress.replace('\n', '')}?page=${page + 1}`;
  }
}

export function hasPrevious(
  page: number,
  totalPages: number,
  hostAddress: string,
) {
  if (page <= 1) {
    return '';
  } else {
    return `${hostAddress.replace('\n', '')}?page=${page - 1}`;
  }
}

export function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

export function objectArrayToArray(objectArray, attr) {
  return objectArray.map(el => {
    return el[attr];
  });
}

export function formatDate(isoString) {
  return format(new Date(isoString), 'yyyy-MM-dd');
}

export function genRandom() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateRandomUUID() {
  // tslint:disable-next-line: only-arrow-functions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // tslint:disable-next-line: no-bitwise
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function removeEmpty(obj) {
  return Object.entries(obj).reduce(
    (a, [k, v]) => (v === null ? a : { ...a, [k]: v }),
    {},
  );
}

export function transformDate(dateStr) {
  return dateStr
    .split('/')
    .reverse()
    .join('/');
}

export function cleanData(obj: {}, toRemove: Array<string>) {
  for (const key of Object.keys(obj)) {
    if (toRemove.includes(key)) {
      delete obj[key];
    }
  }
}

export function parseJwt(token) {
  const base64Url = token.split('.')[1]; // token you get
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  const decodedData = JSON.parse(
    Buffer.from(base64, 'base64').toString('binary'),
  );
  return decodedData;
}
