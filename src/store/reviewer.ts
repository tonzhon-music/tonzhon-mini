import { create } from "zustand";

type ReviewerStore = {
  isReviewed: boolean;

  setIsReviewed: (reviewed: boolean) => void;
};

export const useReviewerStore = create<ReviewerStore>()((set) => ({
  isReviewed: false,

  setIsReviewed: (reviewed: boolean) => set({ isReviewed: reviewed }),
}));
