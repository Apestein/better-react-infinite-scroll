A react infinite scroll component made with modern Intersection Observer API, meaning it will be much more performant. Small and easy to customize, written with typescript as a functional component. Supports both cjs and mjs.

I made this component because I found other solutions such as react-finite-scroll-component and react-infinite-scroller was large, written as class component, and unnecessarily hard to customize.

## How to use

```js
import InfiniteScroller from "better-react-infinite-scroll"

return (
  <InfiniteScroller
    fetchNextPage={fetchNextPage}
    hasNextPage={true}
    loadingMessage={<p>Loading...</p>}
    endingMessage={<p>The beginning of time...</p>}
  >
    {elements.map((el) => (
      <li key={el.id}>{el}</li>
    ))}
  </InfiniteScroller>
)
```

## Install or just copy and paste...

```js
import React, { useEffect, useRef } from "react"

interface InfiniteScrollProps extends React.ComponentPropsWithRef<"div"> {
  fetchNextPage: () => any
  hasNextPage: boolean
  loadingMessage: React.ReactNode
  endingMessage: React.ReactNode
}

export default function InfiniteScroller(props: InfiniteScrollProps) {
  const {
    fetchNextPage,
    hasNextPage,
    loadingMessage,
    endingMessage,
    children,
    ...rest
  } = props
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { threshold: 1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [observerTarget])

  return (
    <div {...rest}>
      <ul>{children}</ul>
      <div ref={observerTarget}></div>
      {hasNextPage && loadingMessage}
      {!hasNextPage && endingMessage}
    </div>
  )
}
```

## Full example with tRPC and React Query (TanStack Query)

```js
import InfiniteScroller from "better-react-infinite-scroll"

//if using with tRPC
const { data, fetchNextPage, hasNextPage } = api.main.getAll.useInfiniteQuery(
  {
    limit: 25,
  },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
)

//if using with React Query (TanStack)
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["projects"],
  queryFn: fetchProjects,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
})

function aggregatePosts() {
  const pages = data?.pages
  const posts = pages?.reduce((prev, current) => {
    const combinedPosts = prev.posts.concat(current.posts)
    const shallowCopy = { ...prev }
    shallowCopy.posts = combinedPosts
    return shallowCopy
  }).posts
  return posts
}

return (
  <>
    <InfiniteScroller
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      loadingMessage={<p>Loading...</p>}
      endingMessage={<p>The beginning of time...</p>}
    >
      {aggregatePosts()?.map((post) => (
        <li key={post.id}>{post.content}</li>
      ))}
    </InfiniteScroller>
  </>
)
```

[tRPC docs](https://trpc.io/docs/client/react/useInfiniteQuery)

[React Query docs](https://tanstack.com/query/v4/docs/react/guides/infinite-queries)

## If you find this useful please star this repo on [Github](https://github.com/Apestein/better-react-infinite-scroll)
