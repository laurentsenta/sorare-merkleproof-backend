import { head, pickBy } from 'lodash';

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

export const replaceAll = (
  str: string,
  search: string,
  replace: string
): string => str.split(search).join(replace);
