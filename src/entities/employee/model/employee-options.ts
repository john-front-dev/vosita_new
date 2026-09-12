export const employeeRoleOptions = [
  { label: 'Заведующий складом', value: '1' },
  { label: 'Заведующий складом и ответственное лицо', value: '2' },
  { label: 'Ответственное лицо', value: '3' },
  { label: 'Пользователь', value: '4' },
  { label: 'Бухгалтер', value: '7' },
] as const;

export const employeeAccessOptions = [
  { label: 'Редактор', value: '1' },
  { label: 'Читатель', value: '2' },
] as const;

export const employeeStorageTypeOptions = [
  { label: 'ТМЗ', value: 'TMZ' },
  { label: 'ОС', value: 'OS' },
  { label: 'ПАУ', value: 'PAU' },
  { label: 'МБП', value: 'MBP' },
  { label: 'Другие', value: 'Other' },
] as const;
