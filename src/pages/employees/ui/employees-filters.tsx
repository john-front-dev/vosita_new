import { useState } from 'react';
import { Button, Checkbox, Modal, OutlineSystemFilterFromLessToMore, Typography } from 'alif-ui';

import {
  employeeAccessOptions,
  employeeRoleOptions,
  type EmployeesFilterKey,
  type EmployeesFilters as EmployeesFilterValues,
} from '../model/employees-filters';

type EmployeesFiltersProps = {
  filters: EmployeesFilterValues;
  isOpen: boolean;
  onApply: (filters: EmployeesFilterValues) => void;
  onClick: () => void;
  onClose: () => void;
};

export const EmployeesFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: EmployeesFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleValue = (key: EmployeesFilterKey, value: string) => {
    setLocalFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="l"
        leftSection={<OutlineSystemFilterFromLessToMore />}
        onClick={() => {
          setLocalFilters(filters);
          onClick();
        }}
      >
        Фильтр
      </Button>
      {isOpen && (
        <Modal className="w-150" isOpen onClose={onClose} isCentered withCloseButton>
          <Modal.Header title="Фильтрация списка" />
          <Modal.Content className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Typography category="body" proportions="mStrong">
                Роль сотрудника
              </Typography>
              {employeeRoleOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={localFilters.role_id.includes(option.value)}
                  onChange={() => toggleValue('role_id', option.value)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Typography category="body" proportions="mStrong">
                Доступ администратора
              </Typography>
              {employeeAccessOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={localFilters.access_id.includes(option.value)}
                  onChange={() => toggleValue('access_id', option.value)}
                />
              ))}
            </div>
          </Modal.Content>
          <Modal.Actions className="flex justify-end gap-2">
            <Button type="button" variant="outline-neutral" onClick={onClose}>
              Отмена
            </Button>
            <Button type="button" variant="primary" onClick={() => onApply(localFilters)}>
              Применить
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
