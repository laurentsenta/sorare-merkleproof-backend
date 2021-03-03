/**
 * Return the string and add a suffix like "..." at the end if it's over a given length.b
 *
 * @param x
 * @param maxLength
 * @param suffix
 */
export function withMaxLength(
  x: string,
  maxLength: number,
  suffix = '...'
): string {
  if (x.length <= maxLength) {
    return x;
  }

  // TODO: test, there might be a few "over by 1" errors there.
  return x.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Return XS or a subset of XS so that it contains at least MAXCONT items,
 * and if we have to remove items, add WITHMORE as the last element.
 *
 * atLeastWithMore(['John', 'Bob'], 3, 'more') returns ['John', 'Bob']
 * atLeastWithMore(['John', 'Bob', 'Doe', ...], 3, 'and more') returns ['John', 'Bob', 'more']
 */
export function atLeastWithMore<T>(
  xs: T[],
  maxCount: number,
  withMore: T
): T[] {
  if (xs.length > maxCount) {
    return [...xs.slice(0, maxCount), withMore];
  }
  return xs;
}

/**
 * join the given XS using COMA for all the items but the last one, then use AND for the last item.
 *
 * joinComaAndAnd([], ', ', ' and ') returns ''
 * joinComaAndAnd(['John'], ', ', ' and ') returns 'John'
 * joinComaAndAnd(['John', 'Bob'], ', ', ' and ') returns 'John and Bob'
 * joinComaAndAnd(['John', 'Bob', 'Tom'], ', ', ', and ') returns 'John, Bob, and Tom'
 */
export function joinComaAndAnd<T>(xs: T[], coma: string, and: string) {
  if (xs.length === 0) {
    return '';
  } else if (xs.length === 1) {
    return xs[0];
  } else if (xs.length === 2) {
    return xs[0] + and + xs[1];
  } else {
    const firsts = xs.slice(0, xs.length - 1);
    return firsts.join(coma) + and + xs[xs.length - 1];
  }
}
