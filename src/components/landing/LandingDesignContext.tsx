import { createContext, useContext } from 'react';

export type LandingDesign = 'v1' | 'v2' | 'v3';

export const LandingDesignContext = createContext<LandingDesign>('v1');

export function useLandingDesign() {
  return useContext(LandingDesignContext);
}
