import { useEffect, useRef, useState } from 'react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';

/**
 * Configuration options for the virtualized list
 */
type VirtualizedListOptions = {
  /** Default height for each item in pixels */
  defaultItemHeight?: number;
  /** Estimated average height for variable sized items */
  estimatedItemHeight?: number;
  /** Extra buffer items to render outside of view (improves scroll experience) */
  overscanCount?: number;
  /** Whether to automatically measure item heights after render */
  measureItemsAfterMount?: boolean;
};

/**
 * Return type for the useVirtualizedList hook
 */
type VirtualizedListReturn<T> = {
  listProps: {
    ref: React.RefObject<VariableSizeList>;
    overscanCount: number;
    itemCount: number;
    itemSize: (index: number) => number;
    estimatedItemSize: number;
  };
  createRowRenderer: (
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  ) => ({ index, style }: ListChildComponentProps) => React.ReactNode;
  getItemRef: (index: number) => (el: HTMLElement | null) => void;
  scrollToItem: (index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start') => void;
};

/**
 * A hook to help with implementing virtualized lists using react-window
 * 
 * @param items The array of items to render in the list
 * @param options Configuration options for the virtualized list
 * @returns Utilities and props for implementing a virtualized list
 */
export function useVirtualizedList<T>(
  items: T[],
  options: VirtualizedListOptions = {}
): VirtualizedListReturn<T> {
  const {
    defaultItemHeight = 80,
    estimatedItemHeight = 80,
    overscanCount = 5,
    measureItemsAfterMount = true,
  } = options;

  // Reference to the list component
  const listRef = useRef<VariableSizeList>(null);
  
  // Store measured heights for variable sized items
  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});
  
  // Reference to item elements for measurement
  const itemsRef = useRef<Record<number, HTMLElement | null>>({});

  // Get or set a reference to a list item element
  const getItemRef = (index: number) => (el: HTMLElement | null) => {
    itemsRef.current[index] = el;
  };

  // Get the height for an item (measured or default)
  const getItemHeight = (index: number) => {
    return itemHeights[index] || defaultItemHeight;
  };

  // Measure all item heights after mount if enabled
  useEffect(() => {
    if (!measureItemsAfterMount || Object.keys(itemsRef.current).length === 0) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      const newHeights: Record<number, number> = {};
      let heightsChanged = false;

      // Measure each item's height
      Object.entries(itemsRef.current).forEach(([indexStr, element]) => {
        if (!element) return;
        
        const index = Number(indexStr);
        const height = element.getBoundingClientRect().height;
        
        if (height > 0 && height !== itemHeights[index]) {
          newHeights[index] = height;
          heightsChanged = true;
        }
      });

      // Update heights and reset list if changes detected
      if (heightsChanged) {
        setItemHeights(prev => ({ ...prev, ...newHeights }));
        if (listRef.current) {
          listRef.current.resetAfterIndex(0);
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [items.length, measureItemsAfterMount, itemHeights]);

  // Create a row renderer that provides the necessary props to each item
  const createRowRenderer = (
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  ) => {
    return ({ index, style }: ListChildComponentProps) => {
      const item = items[index];
      return (
        <div ref={getItemRef(index)} style={style}>
          {renderItem(item, index, style)}
        </div>
      );
    };
  };

  return {
    // Props to pass to the VariableSizeList component
    listProps: {
      ref: listRef,
      overscanCount,
      itemCount: items.length,
      itemSize: getItemHeight,
      estimatedItemSize: estimatedItemHeight,
    },
    // Utility functions
    createRowRenderer,
    getItemRef,
    // Scroll to a specific item
    scrollToItem: (index: number, align: 'auto' | 'smart' | 'center' | 'end' | 'start' = 'smart') => {
      listRef.current?.scrollToItem(index, align);
    },
  };
}