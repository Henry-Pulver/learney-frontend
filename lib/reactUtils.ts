export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function appendToArray(
  array: Array<any>,
  extraElement: any
): Array<any> {
  if (extraElement) array.push(extraElement);
  return array;
}
