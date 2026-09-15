import { Select } from 'alif-ui';

import { useCabinets } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

type TmzCartCabinetSelectProps = {
  cabinetId: string;
  subdivisionId: number;
  onChange: (value: string) => void;
};

export const TmzCartCabinetSelect = ({
  cabinetId,
  subdivisionId,
  onChange,
}: TmzCartCabinetSelectProps) => {
  const { cabinets, isLoading } = useCabinets(String(subdivisionId));

  return (
    <Select
      label="В кабинет"
      value={cabinetId || null}
      options={cabinets.map((cabinet) => ({
        label: cabinet.room,
        value: String(cabinet.id),
      }))}
      onChange={(value) => onChange(normalizeSelectValue(value))}
      isLoading={isLoading}
      fullWidth
    />
  );
};
