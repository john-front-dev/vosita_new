export const locationTypes = ['cities', 'buildings', 'cabinets', 'warehouses'] as const;

export type LocationType = (typeof locationTypes)[number];

export const isLocationType = (value: string | null): value is LocationType =>
  locationTypes.includes(value as LocationType);

export type CityRecord = {
  id: number;
  name: string;
};

export type BuildingRecord = {
  city: string;
  city_id: number;
  crm_id?: string | null;
  end_date?: string | null;
  id: number;
  name: string;
  responsible?: string | null;
  start_date?: string | null;
};

export type CabinetRecord = {
  building: string;
  building_id: number;
  city: string;
  city_id: number;
  id: number;
  room: string;
};

export type WarehouseRecord = {
  department_id: number;
  department_name: string;
  id: number;
  is_active?: boolean;
  name: string;
  responsible_id?: string;
  responsible_name?: string;
  storage_id?: number;
  storage_name?: string;
  subdivision_id: number;
  subdivision_name: string;
};

export type LocationRecord = CityRecord | BuildingRecord | CabinetRecord | WarehouseRecord;

export type LocationListPayload<T> = PaginationMeta & {
  data?: T[];
  items?: T[];
};

export type LocationListResponse<T> = ApiResponse<LocationListPayload<T>>;

export type ItemType = { id: number; latin_name?: string; name: string };

export type LocationFormValues = {
  buildingId: string;
  cityId: string;
  crmId: string;
  endDate: string;
  name: string;
  responsibleId: string;
  responsibleText: string;
  startDate: string;
  storageTypeId: string;
};
