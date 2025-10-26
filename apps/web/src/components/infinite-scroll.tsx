'use client'

import React, { useEffect, useRef } from 'react';

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
    fetchNextPage: () => void;
    threshold?: number
    hasNextPage: boolean;
    loadingComponent?: React.ReactNode;
    as?: React.ElementType;
    triggerAs?: React.ElementType;
}

// eslint-disable-next-line react/display-name
export const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>((
    {
        threshold = 0.1,
        fetchNextPage,
        hasNextPage,
        children,
        loadingComponent,
        as: Component = 'div',
        triggerAs: Trigger = 'div',
        ...props
    },
    ref
) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage) fetchNextPage();
            },
            { threshold }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [ threshold, fetchNextPage, hasNextPage ]);

    return (
        <Component ref={ ref } { ...props } style={ { overflowAnchor: 'none' } }>
            { children }
            { hasNextPage && <Trigger ref={ observerTarget }>{ loadingComponent ?? 'Loading...' }</Trigger> }
        </Component>
    );
});