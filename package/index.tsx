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
