import { create } from "zustand";

import type { Facility } from "@/types/facility";

interface FacilityState {
  selected: Facility | null;
  isModalOpen: boolean;
  openFacility: (facility: Facility) => void;
  closeFacility: () => void;

  mapFacility: Facility | null;
  isMapOpen: boolean;
  openMap: (facility: Facility) => void;
  closeMap: () => void;
}

export const useFacilityStore = create<FacilityState>((set) => ({
  selected: null,
  isModalOpen: false,
  openFacility: (facility) => set({ selected: facility, isModalOpen: true }),
  closeFacility: () => set({ isModalOpen: false }),

  mapFacility: null,
  isMapOpen: false,
  openMap: (facility) => set({ mapFacility: facility, isMapOpen: true }),
  closeMap: () => set({ isMapOpen: false }),
}));
