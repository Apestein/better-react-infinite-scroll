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
    nextOffset: offset + 1,
  };
}

export function UniVirtualInfiniteScrollSection() {
  const PAGE_SIZE = 10000;
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["uni-virtual-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(PAGE_SIZE, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    initialPageParam: 0,
  });

  const parentRef = React.useRef<HTMLDivElement>(null);

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const rowVirtualizer = useVirtualizer({
    count: allRows.length + 1, //plus 1 for bottom loader row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 0,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[500px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Virtual Infinite Scroll</h1>
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
            const isLoaderBottom = virtualRow.index > allRows.length - 1;
            const post = allRows[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 top-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderBottom
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
