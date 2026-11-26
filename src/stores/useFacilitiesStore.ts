import { create } from 'zustand';
import type { Facility, FacilityType } from '@/components/FayoumHealthMap';

interface FacilitiesState {
  facilities: Facility[];
  filters: Set<FacilityType>;
  isLoading: boolean;
  setFacilities: (facs: Facility[]) => void;
  setLoading: (loading: boolean) => void;
  toggleFilter: (type: FacilityType) => void;
  clearFilters: () => void;
  filteredFacilities: () => Facility[];
}

export const useFacilitiesStore = create<FacilitiesState>((set, get) => ({
  facilities: [],
  filters: new Set(),
  isLoading: false,

  setFacilities: (facs) => set({ facilities: facs }),
  setLoading: (loading) => set({ isLoading: loading }),

  toggleFilter: (type) => {
    const filters = new Set(get().filters);
    if (filters.has(type)) {
      filters.delete(type);
    } else {
      filters.add(type);
    }
    set({ filters });
  },

  clearFilters: () => set({ filters: new Set() }),

  filteredFacilities: () => {
    const { facilities, filters } = get();
    if (filters.size === 0) return facilities;
    return facilities.filter((f) => filters.has(f.properties.type));
  },
}));
