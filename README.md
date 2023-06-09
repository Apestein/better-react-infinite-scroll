A react infinite scroll component made with modern Intersection Observer API, meaning it will be much more performant. Small and easy to customize, written with typescript as a functional component.

I made this component because I found other solutions such as react-finite-scroll-component and react-infinite-scroller was large, written as class component, and unnecessarily hard to customize.

## [Demo](https://better-react-infinite-scroll.vercel.app/)

## [Source Code](https://github.com/Apestein/better-react-infinite-scroll/blob/main/src/App.tsx)

## Install or just copy and paste...

```js
import React, { useEffect, useRef } from "react";

interface InfiniteScrollProps extends React.ComponentPropsWithRef<"div"> {
  fetchNextPage: () => any;
  hasNextPage: boolean;
  loadingMessage: React.ReactNode;
  endingMessage: React.ReactNode;
}

export default function InfiniteScroller(props: InfiniteScrollProps) {
  const {
    fetchNextPage,
    hasNextPage,
    loadingMessage,
    endingMessage,
    children,
    ...rest
  } = props;
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget]);

  return (
    <div {...rest} style={{ overflowAnchor: "none" }}>
      {children}
      <div ref={observerTarget}></div>
      {hasNextPage && loadingMessage}
      {!hasNextPage && endingMessage}
    </div>
  );
}
```

## How to use: normal scroll

```js
import InfiniteScroller from "better-react-infinite-scroll";

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
);
```

## How to use: inverse scroll

For inverse scroll, use flex-direction: column-reverse. Scoller height must be defined. Here we use tailwind flex-1 (flex: 1 1 0%) but height: 300px would also work for example.

```js
<div className="flex h-screen flex-col">
  <InfiniteScroller
    fetchNextPage={fetchNextPage}
    hasNextPage={hasNextPage}
    loadingMessage={<p>Loading...</p>}
    endingMessage={<p>The beginning of time...</p>}
    className="flex flex-1 flex-col-reverse overflow-auto"
  >
    {elements.map((el) => (
      <div key={crypto.randomUUID()}>{el}</div>
    ))}
  </InfiniteScroller>
</div>
```

## Full example with tRPC and React Query (TanStack Query)

```js
import InfiniteScroller from "better-react-infinite-scroll";

//if using with tRPC
const { data, fetchNextPage, hasNextPage } = api.main.getAll.useInfiniteQuery(
  {
    limit: 25,
  },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
);

//if using with React Query (TanStack)
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["projects"],
  queryFn: fetchProjects,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});

function aggregatePosts() {
  const pages = data?.pages;
  const posts = pages?.reduce((prev, current) => {
    const combinedPosts = prev.posts.concat(current.posts);
    const shallowCopy = { ...prev };
    shallowCopy.posts = combinedPosts;
    return shallowCopy;
  }).posts;
  return posts;
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
);
```

[tRPC docs](https://trpc.io/docs/client/react/useInfiniteQuery)

[React Query docs](https://tanstack.com/query/v4/docs/react/guides/infinite-queries)

## If you find this useful please star this repo on [Github](https://github.com/Apestein/better-react-infinite-scroll)
