"use client";
import { BiInfiniteScroller } from "./infinite-scrollers";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";

//this can be a server action
async function fetchInfiniteData(limit: number, cursor: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `row #${i + cursor * limit}`)
    .map((i) => ({ foo: i, id: crypto.randomUUID() }));

  await new Promise((r) => setTimeout(r, 500));

  return {
    rows,
    nextCursor: cursor < 4 ? cursor + 1 : null,
    prevCursor: cursor > -4 ? cursor - 1 : null,
  };
}

export function BiInfiniteScrollSection() {
  const MAX_PAGES = 3;
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["bi-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(10, ctx.pageParam),
    initialPageParam: 0,
    getNextPageParam: (nextPage, pages) => nextPage.nextCursor,
    getPreviousPageParam: (prevPage, pages) => prevPage.prevCursor,
    maxPages: MAX_PAGES, //should only set maxPages for large list, or whenever you notice performance issues
  });

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[312px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Bi-directional Infinite Scroll</h1>
      <BiInfiniteScroller
        fetchNextPage={fetchNextPage}
        fetchPreviousPage={fetchPreviousPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        endingMessage="end"
        loadingMessage="loading..."
        useMaxPages={{
          maxPages: MAX_PAGES,
          pageParamsLength: data.pageParams.length,
        }}
        className="h-72 overflow-auto border-2 p-2 text-xl"
      >
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.rows.map((el) => (
              <p key={el.id} id={el.id}>
                {el.foo}
              </p>
            ))}
          </React.Fragment>
        ))}
      </BiInfiniteScroller>
    </section>
  );
}
