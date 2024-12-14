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
    }, []);

    return (
      <div ref={ref} {...props}>
        {children}
        <div ref={observerTarget} />
        {hasNextPage ? loadingMessage : endingMessage}
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
}

export function BiInfiniteScroller({
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  endingMessage,
  loadingMessage,
  children,
  ...props
}: BiInfiniteScrollProps) {
  const nextObserverTarget = React.useRef(null);
  const prevObserverTarget = React.useRef(null);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const prevScrollHeight = React.useRef<number>(undefined);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(0)?.isIntersecting) {
          if (
            entries.at(0)?.target === nextObserverTarget.current &&
            hasNextPage
          ) {
            fetchNextPage();
          } else if (
            entries.at(0)?.target === prevObserverTarget.current &&
            hasPreviousPage
          ) {
            prevScrollHeight.current = parentRef.current?.scrollHeight;
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
  }, [hasNextPage, hasPreviousPage]);

  React.useEffect(() => {
    if (parentRef.current && !prevScrollHeight.current)
      parentRef.current.scrollTop = parentRef.current.scrollHeight; //scroll to bottom on initial load, delete if you don't want this behavior
    else if (parentRef.current && prevScrollHeight.current) {
      parentRef.current.scrollTop =
        parentRef.current.scrollHeight - prevScrollHeight.current; //restore scroll position for backwards scroll
    }
  }, [prevScrollHeight.current]);

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
