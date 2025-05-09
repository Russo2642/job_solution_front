import React, { useState, useEffect, useRef } from 'react';
import styles from './LocationFilter.module.css';
import { CityApi } from '../../../../shared/api';
import { City } from '../../../company/types';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface LocationFilterProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  icon?: React.ReactNode;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedLocation,
  onLocationChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const response = await CityApi.getCities();
        if (response.success) {
          setCities(response.data.cities);
        }
      } catch (error) {
        console.error('Ошибка при загрузке списка городов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

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

  const handleCitySelect = (cityName: string) => {
    onLocationChange(cityName);
    setIsOpen(false);
  };

  return (
    <div className={styles.locationFilter} ref={dropdownRef}>
      <button className={styles.filterButton} onClick={toggleDropdown}>
        <span className={styles.locationIcon}>
          {icon || <LocationOnIcon fontSize="small" />}
        </span>
        <span className={styles.locationText}>{selectedLocation}</span>
        <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.dropdownItem}>Загрузка...</div>
          ) : (
            <>
              <div 
                className={styles.dropdownItem} 
                onClick={() => handleCitySelect('Все города')}
              >
                Все города
              </div>
              {cities.map((city) => (
                <div
                  key={city.id}
                  className={styles.dropdownItem}
                  onClick={() => handleCitySelect(city.name)}
                >
                  {city.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}; 