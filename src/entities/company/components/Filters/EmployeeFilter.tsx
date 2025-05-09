import React, { useState, useRef, useEffect } from 'react';
import styles from './EmployeeFilter.module.css';
import PersonIcon from '@mui/icons-material/Person';

export interface EmployeeFilterOption {
  id: string;
  label: string;
  value: boolean | undefined;
}

interface EmployeeFilterProps {
  selectedOption: EmployeeFilterOption;
  onOptionChange: (option: EmployeeFilterOption) => void;
  icon?: React.ReactNode;
}

export const EmployeeFilter: React.FC<EmployeeFilterProps> = ({
  selectedOption,
  onOptionChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const employeeOptions: EmployeeFilterOption[] = [
    { id: 'all', label: 'Все сотрудники', value: undefined },
    { id: 'current', label: 'Текущие сотрудники', value: false },
    { id: 'former', label: 'Бывшие сотрудники', value: true }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: EmployeeFilterOption) => {
    onOptionChange(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.employeeFilter} ref={dropdownRef}>
      <button className={styles.filterButton} onClick={toggleDropdown}>
        <span className={styles.personIcon}>
          {icon || <PersonIcon fontSize="small" />}
        </span>
        <span className={styles.optionText}>{selectedOption.label}</span>
        <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {employeeOptions.map((option) => (
            <div
              key={option.id}
              className={styles.dropdownItem}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOptionSelect(option);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 