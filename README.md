A react infinite scroll component made with modern Intersection Observer API, meaning it will be much more performant. Small and easy to customize, written with typescript as a functional component.

I made this component because I found other solutions such as [react-finite-scroll-component](https://www.npmjs.com/package/react-infinite-scroll-component) and [react-infinite-scroller](https://www.npmjs.com/package/react-infinite-scroller) was large, written as class component, and unnecessarily hard to customize.

## [Demo](https://better-react-infinite-scroll.vercel.app/)

## [Source Code](https://github.com/Apestein/better-react-infinite-scroll/blob/main/src/App.tsx)

## Install or just copy and paste below.

```ts
import React from "react";

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadingMessage: React.ReactNode;
  endingMessage: React.ReactNode;
}

export const InfiniteScroller = React.forwardRef<
  HTMLDivElement,
  InfiniteScrollProps
>(
  (
    {
      fetchNextPage,
      hasNextPage,
      endingMessage,
      loadingMessage,
      children,
      ...props
    },
    ref
  ) => {
    const observerTarget = React.useRef(null);

    React.useEffect(() => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div ref={ref} {...props} style={{ overflowAnchor: "none" }}>
        {children}
        <div ref={observerTarget} />
        {hasNextPage ? loadingMessage : endingMessage}
      </div>
    );
  }
);
```

## How to use: normal scroll

```ts
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

```ts
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

```ts
...
return (
    <section {...props} style={{ overflowAnchor: "none" }}>
      <ul className="grid ...">
        {children}
      </ul>
      <div ref={observerTarget} />
      {hasNextPage ? loadingMessage : endingMessage}
    </section>
  );
```
