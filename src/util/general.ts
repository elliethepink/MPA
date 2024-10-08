/**
 * Get a random element from an array of objects
 */
export function RandomElement<T>(array: T[]): T | null
{
    if (array.length == 0) { return null; }
    return array[Math.floor(Math.random() * array.length)];
}
