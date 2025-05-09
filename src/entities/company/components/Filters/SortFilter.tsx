import React, { useState, useRef, useEffect } from 'react';
import styles from './SortFilter.module.css';
import SortIcon from '@mui/icons-material/Sort';

export interface SortOption {
  id: string;
  label: string;
  sortBy: 'created_at';
  sortOrder: 'asc' | 'desc';
}

interface SortFilterProps {
  selectedOption: SortOption;
  onSortChange: (option: SortOption) => void;
  icon?: React.ReactNode;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  selectedOption,
  onSortChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = [
    { id: 'newest', label: 'Сначала новые', sortBy: 'created_at', sortOrder: 'desc' },
    { id: 'oldest', label: 'Сначала старые', sortBy: 'created_at', sortOrder: 'asc' }
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

  const handleOptionSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.sortFilter} ref={dropdownRef}>
      <button className={styles.filterButton} onClick={toggleDropdown}>
        <span className={styles.sortIcon}>
          {icon || <SortIcon fontSize="small" />}
        </span>
        <span className={styles.sortText}>{selectedOption.label}</span>
        <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {sortOptions.map((option) => (
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