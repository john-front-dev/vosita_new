export const trashTypes = ['fixed-assets', 'lri', 'others'] as const;
export type TrashType = (typeof trashTypes)[number];
export const isTrashType = (value: string | null): value is TrashType =>
  trashTypes.includes(value as TrashType);

export type TrashedAsset = {
  building?: string;
  currency: string;
  id: number;
  inventory_number?: number | string;
  name: string;
  price: number;
  serial_number?: string;
};

export type TrashedLri = {
  application_id: number;
  count: number;
  currency: string;
  id: number;
  name: string;
  price: number;
  unit: string;
};

export type TrashRecord = TrashedAsset | TrashedLri;
export type TrashListResponse = ApiResponse<PaginatedPayload<TrashRecord>>;
