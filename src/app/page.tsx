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
