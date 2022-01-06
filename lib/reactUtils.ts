export function classNames(...classes: Array<string>): string {
  return classes.filter(Boolean).join(" ");
}

export function appendToArray<ItemType>(
  array: Array<ItemType>,
  ...extraElements: ItemType[]
): Array<ItemType> {
  extraElements.forEach((extraElement) => {
    if (extraElement) array.push(extraElement);
  });
  return array;
}
