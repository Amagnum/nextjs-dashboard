export function updateArrayPosition<T>(
  array: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const newArray = [...array];

  if (
    fromIndex < 0 ||
    fromIndex >= newArray.length ||
    toIndex < 0 ||
    toIndex >= newArray.length
  ) {
    // throw new Error('Invalid index provided');
    return newArray;
  }

  const [removedElement] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, removedElement);

  return newArray;
}

export const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Example usage:
const originalArray = [1, 2, 3, 4, 5];
console.log("Original Array:", originalArray);

const updatedArray = updateArrayPosition(originalArray, 2, 4);
console.log("Updated Array:", updatedArray);
