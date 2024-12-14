"use client";
import { InfiniteScroller } from "./infinite-scrollers";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";

async function fetchInfiniteData(limit: number, cursor: number) {
  const res = await fetch(`/api/foo?cursor=${cursor}&limit=${limit}`);
  return res.json() as Promise<{
    rows: {
      foo: string;
      id: string;
    }[];
    nextCursor: number | null;
  }>; //use return type from api route
}

export function ApiInfiniteScrollSection() {
  const { data, error, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["api-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(10, ctx.pageParam),
    initialPageParam: 0,
    getNextPageParam: (nextPage, pages) => nextPage.nextCursor,
  });

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[312px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Route-handler Example</h1>
      <p>this loads slower than prefetch</p>
      <InfiniteScroller
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        endingMessage="end"
        loadingMessage="loading..."
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
      </InfiniteScroller>
    </section>
  );
}
