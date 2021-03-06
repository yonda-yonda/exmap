import React, { useRef, useState } from "react";

// thx https://zenn.dev/uttk/articles/b90454baec68c8

type DnDMode = "grid" | "topbottom" | "bottomtop" | "leftright" | "rightleft";

const getClientCoordinates = (
  event:
    | MouseEvent
    | TouchEvent
    | React.MouseEvent<HTMLElement>
    | React.TouchEvent<HTMLElement>
): { clientX: number; clientY: number } | null => {
  if ("changedTouches" in event && event.changedTouches?.length > 0) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
    };
  } else if ("clientX" in event && "clientY" in event) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }
  return null;
};

const isHover = (
  event: MouseEvent | TouchEvent,
  element: HTMLElement,
  mode: DnDMode = "grid",
  index: number,
  length: number
): boolean => {
  const coordinates = getClientCoordinates(event);
  if (!coordinates) return false;
  const { clientX, clientY } = coordinates;
  const rect = element.getBoundingClientRect();

  switch (mode) {
    case "topbottom": {
      return (
        (clientY < rect.bottom ||
          (index === length - 1 && clientY >= rect.bottom)) &&
        (clientY > rect.top || (index === 0 && clientY <= rect.top))
      );
    }
    case "bottomtop": {
      return (
        (clientY < rect.bottom || (index === 0 && clientY >= rect.bottom)) &&
        (clientY > rect.top || (index === length - 1 && clientY <= rect.top))
      );
    }
    case "leftright": {
      return (
        (clientX > rect.left || (index === 0 && clientX <= rect.left)) &&
        (clientX < rect.right ||
          (index === length - 1 && clientX >= rect.right))
      );
    }
    case "rightleft": {
      return (
        (clientX > rect.left ||
          (index === length - 1 && clientX <= rect.left)) &&
        (clientX < rect.right || (index === 0 && clientX >= rect.right))
      );
    }
    default: {
      return (
        clientY < rect.bottom &&
        clientY > rect.top &&
        clientX < rect.right &&
        clientX > rect.left
      );
    }
  }
};

interface Position {
  x: number;
  y: number;
}

interface DnDItem<T> {
  value: T;
  key: string;
  position: Position;
  element: HTMLElement;
  index: number;
}

interface DnDTarget<T> {
  value: T;
  index: number;
}

interface DnDRef<T> {
  keys: Map<T, string>;
  dndItems: DnDItem<T>[];
  canCheckHovered: boolean;
  pointerPosition: Position;
  dragItem: DnDItem<T> | null;
  hoverItem: DnDTarget<T> | null;
}

export interface DnDSortEvent {
  onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
  onTouchStart: (event: React.TouchEvent<HTMLElement>) => void;
}

export interface DnDSortResult<T> {
  key: string;
  value: T;
  ref: (element: HTMLElement | null) => void;
  trigger: DnDSortEvent;
  propagation: DnDSortEvent;
}

export type Drop<T> = (draged: DnDTarget<T>, hovered: DnDTarget<T>) => void;

export interface DnDProps<T> {
  defaultItems: T[];
  mode: DnDMode;
  zIndex?: number;
  duration?: number;
  drop?: Drop<T>;
}

const getInitState = () => {
  return {
    dndItems: [],
    keys: new Map(),
    dragItem: null,
    hoverItem: null,
    canCheckHovered: true,
    pointerPosition: { x: 0, y: 0 },
  };
};

const stopPropagation = (
  event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
) => {
  event.stopPropagation();
};

export const useDnDSort = <T,>(
  props: DnDProps<T>
): { items: DnDSortResult<T>[]; reset: (items: T[]) => void } => {
  const { mode, defaultItems, zIndex = 100, duration = 300, drop } = props;

  const [items, setItems] = useState(defaultItems);

  const state = useRef<DnDRef<T>>(getInitState());

  const onMove = (event: MouseEvent | TouchEvent) => {
    if (event.cancelable) event.preventDefault();

    const coordinates = getClientCoordinates(event);
    if (!coordinates) return;
    const { clientX, clientY } = coordinates;

    const { dndItems, dragItem, pointerPosition } = state.current;
    if (!dragItem) return;

    const x = clientX - pointerPosition.x;
    const y = clientY - pointerPosition.y;

    const dragStyle = dragItem.element.style;

    dragStyle.zIndex = String(zIndex);
    dragStyle.cursor = "grabbing";
    dragStyle.transform = `translate(${x}px,${y}px)`;

    if (!state.current.canCheckHovered) return;

    state.current.canCheckHovered = false;
    setTimeout(() => (state.current.canCheckHovered = true), 300);

    const dragIndex = dndItems.findIndex(({ key }) => key === dragItem.key);

    const hoveredIndex = dndItems.findIndex(
      ({ element }, index) =>
        index !== dragIndex &&
        isHover(event, element, mode, index, dndItems.length)
    );
    if (hoveredIndex !== -1) {
      state.current.hoverItem = {
        index: hoveredIndex,
        value: dndItems[hoveredIndex].value,
      };
      state.current.pointerPosition.x = clientX;
      state.current.pointerPosition.y = clientY;
      dndItems.splice(dragIndex, 1);
      dndItems.splice(hoveredIndex, 0, dragItem);
      const { left: x, top: y } = dragItem.element.getBoundingClientRect();
      dragItem.position = { x, y };
      setItems(dndItems.map(v => v.value));
    }
  };

  const onEnd = () => {
    const { dragItem, hoverItem } = state.current;
    if (dragItem === null) return;
    const dragStyle = dragItem.element.style;
    dragStyle.zIndex = "";
    dragStyle.cursor = "";
    dragStyle.transform = "";
    dragStyle.userSelect = "";
    state.current.dragItem = null;
    state.current.hoverItem = null;

    if (window) {
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchmove", onMove);
    }
    const draged = {
      index: dragItem.index,
      value: dragItem.value,
    };
    const hovered = hoverItem ?? draged;

    if (drop) drop(draged, hovered);
  };

  const reset = React.useCallback((items: T[]) => {
    state.current = getInitState();
    setItems(items);
  }, []);

  return {
    items: items.map((value: T, index: number): DnDSortResult<T> => {
      const key = state.current.keys.get(value) || Math.random().toString(16);

      state.current.keys.set(value, key);

      const onStart = (
        event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
      ) => {
        const element = event.currentTarget;

        const coordinates = getClientCoordinates(event);
        if (!coordinates) return;
        const { clientX, clientY } = coordinates;
        state.current.pointerPosition.x = clientX;
        state.current.pointerPosition.y = clientY;

        const dragStyle = element.style;
        dragStyle.transition = "";
        dragStyle.cursor = "grabbing";
        dragStyle.userSelect = "none";

        const { left: x, top: y } = element.getBoundingClientRect();
        const position: Position = { x, y };

        state.current.dragItem = { key, value, element, position, index };
        state.current.hoverItem = null;
        if (window) {
          window.addEventListener("mouseup", onEnd);
          window.addEventListener("mousemove", onMove, { passive: false });
          window.addEventListener("touchend", onEnd);
          window.addEventListener("touchmove", onMove, { passive: false });
        }
      };

      return {
        value,
        key,
        ref: (element: HTMLElement | null) => {
          if (!element) return;

          const { dndItems, dragItem, pointerPosition } = state.current;

          element.style.transform = "";
          const { left: x, top: y } = element.getBoundingClientRect();
          const position: Position = { x, y };

          const itemIndex = dndItems.findIndex(item => item.key === key);

          if (itemIndex === -1) {
            return dndItems.push({
              key,
              value,
              element,
              position,
              index: dndItems.length,
            });
          }

          if (dragItem?.key === key) {
            const dragX = dragItem.position.x - position.x;
            const dragY = dragItem.position.y - position.y;
            element.style.transform = `translate(${dragX}px,${dragY}px)`;

            pointerPosition.x -= dragX;
            pointerPosition.y -= dragY;
          } else {
            const item = dndItems[itemIndex];

            const x = item.position.x - position.x;
            const y = item.position.y - position.y;

            element.style.transition = "";
            element.style.transform = `translate(${x}px,${y}px)`;

            requestAnimationFrame(() => {
              if (dragItem) {
                element.style.transition = `all ${duration}ms`;
              }
              element.style.transform = "";
            });
          }

          state.current.dndItems[itemIndex] = {
            key,
            value,
            element,
            position,
            index: itemIndex,
          };
        },
        trigger: {
          onMouseDown: onStart,
          onTouchStart: onStart,
        },
        propagation: {
          onMouseDown: stopPropagation,
          onTouchStart: stopPropagation,
        },
      };
    }),
    reset,
  };
};
