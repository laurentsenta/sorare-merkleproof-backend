import { head, pickBy } from 'lodash';
import { logger } from './log';

// https://stackoverflow.com/a/10050831/843194
export function range(size: number, startAt: number = 0): number[] {
  // tslint:disable-next-line:prefer-array-literal
  return Array.from(Array(size).keys()).map((i: number) => i + startAt);
}

export const lpad = (n: number, length: number = 2) =>
  ('' + n).padStart(length, '0');

export const firstLine = (x: string): string => head(x.split('\n')) || '';

export const withoutUndefined = (xs: any) => pickBy(xs, v => v !== undefined);

export const noop = () => { };

const singletonerLog = logger('singletoner');

export function singletoner(
  target: any,
  propertyName: string,
  propertyDescription: PropertyDescriptor
): void {
  const internalName = `_${propertyName}`;
  const { get } = propertyDescription;

  if (!get) {
    throw new Error('Invalid Singletoned, get is undefined');
  }

  propertyDescription.get = function (this: any): any {
    singletonerLog('getting the field:', target, propertyName);

    if (!this[internalName]) {
      singletonerLog('creating the internal value for', propertyName);
      this[internalName] = get.call(this);
    }
    singletonerLog('returning the internal value for', propertyName);
    return this[internalName];
  };
}

export const defaultToFalse = (x?: boolean) => {
  if (x === undefined) {
    return false;
  }
  return x;
};

export const defaultToTrue = (x?: boolean) => {
  if (x === undefined) {
    return true;
  }
  return x;
};

export const replaceAll = (
  str: string,
  search: string,
  replace: string
): string => str.split(search).join(replace);
