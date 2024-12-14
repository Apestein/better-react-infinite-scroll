"use server";
/*
Mock database access, returns next 10 numbers.
Cursor will be automatically passed when calling fetchNextPage & fetchPreviousPage
*/
export async function getFooAction(cursor: number) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => ({
      foo: start + i * step,
      id: crypto.randomUUID().toString(),
    }));
  return {
    data: range(cursor, cursor + 9, 1),
    nextCursor: cursor < 40 ? cursor + 9 + 1 : null,
    prevCursor: cursor > 0 ? cursor - 9 - 1 : null,
  };
}

//reverse data for inverse scroll
export async function getLatestFooAction(cursor: number) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => ({
      foo: start + i * step,
      id: crypto.randomUUID().toString(),
    }));
  return {
    data: range(cursor, cursor + 9, 1).reverse(),
    nextCursor: cursor < 40 ? cursor + 9 + 1 : null,
    prevCursor: cursor > 0 ? cursor - 9 - 1 : null,
  };
}

export async function getInfiniteDataAction(limit: number, cursor: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `Async loaded row #${i + cursor * limit}`)
    .map((i) => ({ foo: i, id: crypto.randomUUID() }));

  await new Promise((r) => setTimeout(r, 500));

  return {
    rows,
    nextCursor: cursor < 4 ? cursor + 1 : null,
    prevCursor: cursor > -4 ? cursor - 1 : null,
  };
}
