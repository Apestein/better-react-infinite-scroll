/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

async function fetchInfiniteData(limit: number, offset: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `Async loaded row #${i + offset * limit}`);

  await new Promise((r) => setTimeout(r, 500));

  return {
    rows,
    nextOffset: offset < 4 ? offset + 1 : null,
    prevOffset: offset > -4 ? offset - 1 : null,
  };
}

export function BiVirtualInfiniteScrollSection() {
  const PAGE_SIZE = 10;
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["bi-virtual-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(PAGE_SIZE, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    getPreviousPageParam: (firstGroup) => firstGroup.prevOffset,
    initialPageParam: 0,
  });

  const parentRef = React.useRef<HTMLDivElement>(null);
  const backwardScrollRef = React.useRef<string | null>(null);
  const dirtyHack = React.useRef(false);

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const rowVirtualizer = useVirtualizer({
    count: allRows.length + 2, //plus 2 for top & bottom loader row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 0,
  });

  React.useEffect(() => {
    const [firstItem] = [...rowVirtualizer.getVirtualItems()];
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem || !firstItem) return;

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    } else if (
      firstItem.index === 0 &&
      hasPreviousPage &&
      !isFetchingPreviousPage
    ) {
      if (dirtyHack.current) {
        dirtyHack.current = false;
        return;
      }
      fetchPreviousPage().finally(() => {
        // rowVirtualizer.scrollToIndex(10, { align: "start" }) //trying to scroll here seems to cause race condition that sometimes will prevent fetching next page
        backwardScrollRef.current = crypto.randomUUID(); //hack to prevent race condition
        dirtyHack.current = true; //dirty hack to prevent double fetch
      });
    }
  }, [
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    allRows.length,
    isFetchingNextPage,
    isFetchingPreviousPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  //preserve scroll position for backwards scroll, forward scroll is already handled automatically
  React.useEffect(() => {
    if (!backwardScrollRef.current) return;
    rowVirtualizer.scrollToIndex(PAGE_SIZE, { align: "start" });
  }, [backwardScrollRef.current]);

  //scroll to bottom on initial load, delete if you don't want this behavior
  React.useEffect(() => {
    dirtyHack.current = false; //more hacky shit...
    if (allRows.length === PAGE_SIZE) {
      rowVirtualizer.scrollToIndex(PAGE_SIZE);
    }
  }, [allRows.length]);

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[500px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Bi-directional Virtual Infinite Scroll</h1>
      <div
        ref={parentRef}
        className="h-[500px] w-full overflow-auto border-2 p-2 text-xl"
      >
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, //not possible with tailwind
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderTop = virtualRow.index === 0;
            const isLoaderBottom = virtualRow.index > allRows.length;
            const post = allRows[virtualRow.index - 1];
            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 top-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderTop
                  ? hasPreviousPage
                    ? "Loading previous page..."
                    : "No more previous page"
                  : isLoaderBottom
                    ? hasNextPage
                      ? "Loading next page..."
                      : "No more next page"
                    : post}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
