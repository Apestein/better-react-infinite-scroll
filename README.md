Intended to be a complete guide to infinite scroll in React. Nothing to install, just copy & paste then customize. Examples with Next.js / Tailwind / Tanstack Query / and Tanstack Virtual. This will be the best repo to reference when implementing an infinite scroll feature in React. Infinite scroll feature can be quite hard, especially for bi-directional scroll and virtual scroll (for very large list) support. I hope this repo can save people some time. Please star this repo if you find it helpful, thanks.

## [Demo](https://stackblitz.com/~/github.com/Apestein/better-react-infinite-scroll)

## Intersection observer API (good for small list)

### Copy & paste this [component](https://github.com/Apestein/better-react-infinite-scroll/blob/main/src/app/components/infinite-scrollers.tsx) into your codebase and use like below👇

### Normal Scroll Example

```tsx
"use client";
import { InfiniteScroller } from "./infinite-scrollers";
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
  };
}

export function NormalInfiniteScrollSection() {
  const { data, error, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["normal-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(10, ctx.pageParam),
    initialPageParam: 0,
    getNextPageParam: (nextPage, pages) => nextPage.nextCursor,
  });

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[312px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Normal Infinite Scroll</h1>
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
```

### Inverse Scroll Example

```tsx
"use client";
import { InfiniteScroller } from "./infinite-scrollers";
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
    prevCursor: cursor > 0 ? cursor - 1 : null,
  };
}

export function InverseInfiniteScrollSection() {
  const { data, error, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["inverse-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(10, ctx.pageParam),
    initialPageParam: 4,
    getNextPageParam: (nextPage, pages) => nextPage.prevCursor,
  });

  if (status === "error") return <p>Error {error.message}</p>;
  if (status === "pending")
    return <p className="h-[312px]">Loading from client...</p>;
  return (
    <section>
      <h1 className="font-bold">Inverse Infinite Scroll</h1>
      <InfiniteScroller
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        endingMessage="end"
        loadingMessage="loading..."
        className="flex h-72 flex-col-reverse overflow-auto border-2 p-2 text-xl" //use flex flex-col-reverse
      >
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.rows
              .map((el) => (
                <p key={el.id} id={el.id}>
                  {el.foo}
                </p>
              ))
              .reverse()}{" "}
            //reverse the array
          </React.Fragment>
        ))}
      </InfiniteScroller>
    </section>
  );
}
```

### Bi-directional Scroll Example (supports large list by setting maxPages)

```tsx
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
```

## Tanstack Virtual (good for large list)

### Normal Virtual Scroll Example

```tsx
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

async function fetchInfiniteData(limit: number, offset: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `row #${i + offset * limit}`);

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
```

### Bi-directional Virtual Scroll Example (doesn't work for dynamic size list items)

```tsx
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

async function fetchInfiniteData(limit: number, offset: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `row #${i + offset * limit}`);

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
```

## More Examples

### Prefetch Suspense with Next.js server actions (prefetch on the server, initial load will be faster)

```tsx
///page.tsx
import React, { Suspense } from "react";
import { NormalInfiniteScrollSection } from "./components/normal-infinite-scroll-section";
import { InverseInfiniteScrollSection } from "./components/inverse-infinite-scroll-section";
import { BiInfiniteScrollSection } from "./components/bi-infinite-scroll-section";
import { ApiInfiniteScrollSection } from "./components/api-infinite-scroll-section";
import { PreInfiniteScrollSection } from "./components/prefetch-infinite-scroll-section";
import { UniVirtualInfiniteScrollSection } from "./components/uni-virtual-infinite-scroll-section";
import { BiVirtualInfiniteScrollSection } from "./components/bi-virtual-infinite-scroll-section";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getInfiniteDataAction } from "./actions";

export default async function Home() {
  return (
    <main className="container mx-auto">
      <div className="grid grid-cols-3 border-2 p-8">
        <h1 className="col-span-3 justify-self-center text-2xl font-bold">
          Good for small list
        </h1>
        <NormalInfiniteScrollSection />
        <InverseInfiniteScrollSection />
        <BiInfiniteScrollSection />
      </div>
      <div className="grid grid-cols-2 border-2 p-8">
        <h1 className="col-span-2 justify-self-center text-2xl font-bold">
          Good for large list
        </h1>
        <UniVirtualInfiniteScrollSection />
        <BiVirtualInfiniteScrollSection />
      </div>
      <div className="grid grid-cols-3 border-2 p-8">
        <h1 className="col-span-3 justify-self-center text-2xl font-bold">
          More examples
        </h1>
        <Suspense fallback="Loading from server...">
          <PrefetchWrapper />
        </Suspense>
        <ApiInfiniteScrollSection />
      </div>
    </main>
  );
}

async function PrefetchWrapper() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["prefetch-infinite-data"],
    queryFn: (ctx) => getInfiniteDataAction(10, ctx.pageParam),
    initialPageParam: 0,
    // getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    // pages: 3, //number of pages to prefetch
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PreInfiniteScrollSection />
    </HydrationBoundary>
  );
}

//prefetch-infinite-scroll-section.tsx
("use client");
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
```

### Route handler example with Next.js

```tsx
//app/api/foo/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = Number(searchParams.get("cursor"));
  const limit = Number(searchParams.get("limit"));
  if (cursor == null || limit == null)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 400 },
    );
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `row #${i + cursor * limit}`)
    .map((i) => ({ foo: i, id: crypto.randomUUID() }));

  await new Promise((r) => setTimeout(r, 500));

  const res = {
    rows,
    nextCursor: cursor < 4 ? cursor + 1 : null,
  };
  return NextResponse.json(res);
}

//api-infinite-scroll-section.tsx
("use client");
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
```
