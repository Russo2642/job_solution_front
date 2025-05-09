import React, { useState, useRef, useEffect } from 'react';
import styles from './RatingFilter.module.css';
import StarIcon from '@mui/icons-material/Star';

interface RatingFilterProps {
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  icon?: React.ReactNode;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({
  selectedRating,
  onRatingChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ratings = [
    'Любой рейтинг',
    '5★ Отлично (4.5-5)',
    '4★ Хорошо (3.5-4.4)',
    '3★ Нормально (2.5-3.4)',
    '2★ Плохо (1.5-2.4)',
    '1★ Ужасно (1-1.4)'
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

  const handleRatingSelect = (rating: string) => {
    onRatingChange(rating);
    setIsOpen(false);
  };

  return (
    <div className={styles.ratingFilter} ref={dropdownRef}>
      <button className={styles.filterButton} onClick={toggleDropdown}>
        <span className={styles.starIcon}>
          {icon || <StarIcon fontSize="small" sx={{ color: '#ffc107' }} />}
        </span>
        <span className={styles.ratingText}>{selectedRating}</span>
        <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {ratings.map((rating) => (
            <div
              key={rating}
              className={styles.dropdownItem}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRatingSelect(rating);
              }}
            >
              {rating}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 