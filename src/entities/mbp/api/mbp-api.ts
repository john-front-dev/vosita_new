export const mbpEntityEndpoints = {
  details: (id: number | string) => `/mbp/item/${id}`,
} as const;
