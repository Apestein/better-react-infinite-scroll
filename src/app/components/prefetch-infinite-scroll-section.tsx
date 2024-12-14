"use client";
import { InfiniteScroller } from "./infinite-scrollers";
import { getInfiniteDataAction } from "../actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";

export function PreInfiniteScrollSection() {
  const { data, error, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["prefetch-infinite-data"],
    queryFn: (ctx) => getInfiniteDataAction(10, ctx.pageParam),
    initialPageParam: 0,
    getNextPageParam: (nextPage, pages) => nextPage.nextCursor,
  });

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[312px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Prefetch suspense example</h1>
      <p>this loads faster</p>
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
