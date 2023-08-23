A react infinite scroll component made with modern Intersection Observer API, meaning it will be much more performant. Small and easy to customize, written with typescript as a functional component.

I made this component because I found other solutions such as [react-finite-scroll-component](https://www.npmjs.com/package/react-infinite-scroll-component) and [react-infinite-scroller](https://www.npmjs.com/package/react-infinite-scroller) was large, written as class component, and unnecessarily hard to customize.

## [Demo](https://better-react-infinite-scroll.vercel.app/)

## [Source Code](https://github.com/Apestein/better-react-infinite-scroll/blob/main/src/App.tsx)

## Install or just copy and paste below.

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
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div {...rest} style={{ overflowAnchor: "none" }}>
      {children}
      <div ref={observerTarget} />
      {hasNextPage ? loadingMessage : endingMessage}
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
    hasNextPage={hasNextPage}
    loadingMessage={<p>Loading...</p>}
    endingMessage={<p>The beginning of time...</p>}
    // className="overflow-auto" <= scroll target, may or may not need this
  >
    {elements.map((el) => (
      <div key={el.id}>{el}</div>
    ))}
  </InfiniteScroller>
);
```

## How to use: inverse scroll

For inverse scroll, use flex-direction: column-reverse. Scoller height must be defined. Here we use tailwind flex-1 (flex: 1 1 0%) but height: 300px would also work for example.

```js
import InfiniteScroller from "better-react-infinite-scroll";

return (
  <div className="flex h-screen flex-col">
    <InfiniteScroller
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      loadingMessage={<p>Loading...</p>}
      endingMessage={<p>The beginning of time...</p>}
      className="flex flex-1 flex-col-reverse overflow-auto"
    >
      {elements.map((el) => (
        <div key={el.id}>{el}</div>
      ))}
    </InfiniteScroller>
  </div>
);
```

## Need a grid to infinite scroll? Try this modification.

```js
...
return (
    <section {...rest} style={{ overflowAnchor: "none" }}>
      <ul className="grid ...">
        {children}
      </ul>
      <div ref={observerTarget} />
      {hasNextPage ? loadingMessage : endingMessage}
    </section>
  );
```

## Important Tip

Important thing to understand is inside IntersectionObserver callback function, you must use refs instead of state. That is because of scoping, the callback is only created once and all the variables inside are snapshotted. To get around this you need to use refs. There maybe other ways, I'm just listing what I know.

```js
const observer = new IntersectionObserver((entries) => {
  if (!hasNextPageRef.current) return; // <= must use ref, don't use state
});
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
