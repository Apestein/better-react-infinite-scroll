/*
  Attempt to use Tanstack Virtual with Intersection Observer, which will reduced complexity and eliminate the use of hacks. 
  Failed, but I will leave this here incase anyone wants to have a go at it.
*/

"use client"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"

async function fetchInfiniteData(limit: number, offset: number = 0) {
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `Async loaded row #${i + offset * limit}`)

  await new Promise((r) => setTimeout(r, 500))

  return {
    rows,
    nextOffset: offset < 4 ? offset + 1 : null,
    prevOffset: offset > -4 ? offset - 1 : null,
  }
}

export function VirtualObserverSection() {
  const PAGE_SIZE = 10
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
    queryKey: ["virtual-infinite-data"],
    queryFn: (ctx) => fetchInfiniteData(PAGE_SIZE, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    getPreviousPageParam: (firstGroup) => firstGroup.prevOffset,
    initialPageParam: 0,
  })

  const nextObserverTarget = React.useRef(null)
  const prevObserverTarget = React.useRef(null)
  const parentRef = React.useRef<HTMLDivElement>(null)

  const allRows = data ? data.pages.flatMap((d) => d.rows) : []

  const rowVirtualizer = useVirtualizer({
    count: allRows.length + 2,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 0,
  })

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(0)?.isIntersecting) {
          if (
            entries.at(0)?.target === nextObserverTarget.current &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage()
          } else if (
            entries.at(0)?.target === prevObserverTarget.current &&
            hasPreviousPage &&
            !isFetchingPreviousPage
          ) {
            fetchPreviousPage()
          }
        }
      },
      { threshold: 1 }
    )

    if (nextObserverTarget.current) {
      observer.observe(nextObserverTarget.current)
    }
    if (prevObserverTarget.current) {
      observer.observe(prevObserverTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage])

  if (status === "error") return <p>Error {error.message}</p>
  if (status === "pending")
    return <p className="h-[500px]">Loading from client...</p>
  return (
    <section>
      <div ref={parentRef} className="h-[500px] w-full overflow-auto">
        <div
          className="w-full relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, //not possible with tailwind
          }}
        >
          {/* <div ref={prevObserverTarget}>prev observer</div> 
            unfortunately, both next and prev observer div will be rendered on top, so this doesn't work
          */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderTop = virtualRow.index === 0
            const isLoaderBottom = virtualRow.index > allRows.length
            const post = allRows[virtualRow.index - 1]

            // doing it this way will not trigger intersection observer
            // if (isLoaderTop)
            //   return (
            //     <div key={virtualRow.index} ref={prevObserverTarget}>
            //       ...
            //     </div>
            //   )
            // else if (isLoaderBottom)
            //   return <div key={virtualRow.index} ref={nextObserverTarget} />
            // else
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full"
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
            )
          })}
          {/* <div ref={nextObserverTarget}>next observer</div> 
            unfortunately, both next and prev observer div will be rendered on top, so this doesn't work
          */}
        </div>
      </div>
    </section>
  )
}
