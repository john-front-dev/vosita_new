export const locationEndpoints = {
  allWarehouses: '/storages?limit=0&name=&subdivision_id=&page=0',
  accessibleWarehouses: '/warehouse_accesses/employee/',
  buildings: '/subdivision/',
  cabinets: '/rooms/',
  cities: '/department/',
} as const;
