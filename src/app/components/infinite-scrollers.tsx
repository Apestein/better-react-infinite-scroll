/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  fetchNextPage: () => Promise<any>;
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
    ref,
  ) => {
    const observerTarget = React.useRef(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) fetchNextPage();
        },
        { threshold: 1 },
      );

      if (observerTarget.current) {
        observer.observe(observerTarget.current);
      }

      return () => observer.disconnect();
    }, [hasNextPage]);

    return (
      <div ref={ref} {...props}>
        {children}
        {hasNextPage ? loadingMessage : endingMessage}
        <div ref={observerTarget} />
      </div>
    );
  },
);

interface BiInfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  fetchNextPage: () => Promise<any>;
  fetchPreviousPage: () => Promise<any>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loadingMessage: React.ReactNode;
  endingMessage: React.ReactNode;
  useMaxPages?: { maxPages: number; pageParamsLength: number };
}

export function BiInfiniteScroller({
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  endingMessage,
  loadingMessage,
  useMaxPages,
  children,
  ...props
}: BiInfiniteScrollProps) {
  const nextObserverTarget = React.useRef(null);
  const prevObserverTarget = React.useRef(null);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const prevScrollHeight = React.useRef<number>(null);
  const prevScrollTop = React.useRef<number>(null);
  const nextAnchor = React.useRef<string>(null);
  const prevAnchor = React.useRef<string>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(0)?.isIntersecting) {
          if (
            entries.at(0)?.target === nextObserverTarget.current &&
            hasNextPage
          ) {
            if (
              (!useMaxPages ||
                useMaxPages.pageParamsLength < useMaxPages.maxPages) &&
              parentRef.current
            ) {
              prevScrollTop.current = parentRef.current.scrollTop;
              prevScrollHeight.current = parentRef.current.scrollHeight;
            }
            nextAnchor.current = crypto.randomUUID();
            fetchNextPage();
          } else if (
            entries.at(0)?.target === prevObserverTarget.current &&
            hasPreviousPage
          ) {
            if (
              (!useMaxPages ||
                useMaxPages.pageParamsLength < useMaxPages.maxPages) &&
              parentRef.current
            ) {
              if (prevScrollTop.current && prevScrollHeight.current)
                prevScrollTop.current +=
                  parentRef.current.scrollHeight - prevScrollHeight.current;
              prevScrollHeight.current = parentRef.current.scrollHeight;
            }
            prevAnchor.current = crypto.randomUUID();
            fetchPreviousPage();
          }
        }
      },
      { threshold: 1 },
    );

    if (nextObserverTarget.current) {
      observer.observe(nextObserverTarget.current);
    }
    if (prevObserverTarget.current) {
      observer.observe(prevObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, hasPreviousPage, useMaxPages?.pageParamsLength]);

  React.useEffect(() => {
    if (parentRef.current && !prevScrollHeight.current)
      parentRef.current.scrollTop = parentRef.current.scrollHeight; //scroll to bottom on initial load, delete if you don't want this behavior

    if (parentRef.current && prevScrollHeight.current) {
      parentRef.current.scrollTop =
        parentRef.current.scrollHeight - prevScrollHeight.current; //restore scroll position for backwards scroll
    }
  }, [prevAnchor.current]);

  React.useEffect(() => {
    if (useMaxPages && parentRef.current && prevScrollTop.current) {
      parentRef.current.scrollTop = prevScrollTop.current; //restore scroll position for forward scroll
    }
  }, [nextAnchor.current]);

  return (
    <div ref={parentRef} {...props}>
      <div ref={prevObserverTarget} />
      {hasPreviousPage ? loadingMessage : endingMessage}
      {children}
      {hasNextPage ? loadingMessage : endingMessage}
      <div ref={nextObserverTarget} />
    </div>
  );
}
