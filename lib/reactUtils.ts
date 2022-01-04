export function classNames(...classes: Array<string>): string {
  return classes.filter(Boolean).join(" ");
}

export function appendToArray<ItemType>(
  array: Array<ItemType>,
  extraElement: ItemType
): Array<ItemType> {
  if (extraElement) array.push(extraElement);
  return array;
}
