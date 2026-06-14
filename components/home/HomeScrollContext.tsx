'use client';

import { createContext, useContext, type RefObject } from 'react';

export type HomeScrollRefs = {
  baseRef: RefObject<HTMLDivElement | null>;
  nebulaRef: RefObject<HTMLDivElement | null>;
};

export const HomeScrollContext = createContext<HomeScrollRefs | null>(null);

export function useHomeScrollRefs(): HomeScrollRefs | null {
  return useContext(HomeScrollContext);
}
