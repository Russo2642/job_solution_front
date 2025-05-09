import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { City, CompaniesFilter, CompanySizes, Industry } from '../types';

interface CompanyFiltersProps {
  onFilterChange: (filters: CompaniesFilter) => void;
  onResetFilters: () => void;
  companySizes: CompanySizes;
  industries: Industry[];
  cities: City[];
  initialFilters?: CompaniesFilter;
}

const FilterContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '24px 20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const FilterHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  borderBottom: '1px solid #f0f0f0',
  paddingBottom: '16px',
}));

const FilterTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 600,
  color: '#1a1a1a',
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: '24px',
}));

const FilterLabel = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 500,
  marginBottom: '12px',
  color: '#333',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'white',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  borderRadius: '8px',
}));

const ResetButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '14px',
  color: '#666',
  padding: '4px 8px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
  padding: '6px',
  color: theme.palette.primary.main,
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginRight: 0,
  marginBottom: '8px',
  width: '100%',
  '& .MuiFormControlLabel-label': {
    fontSize: '15px',
    color: '#333',
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: 2,
  backgroundColor: '#f0f2f5',
  color: '#333',
  '& .MuiChip-deleteIcon': {
    color: '#666',
  },
}));

const SortingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}));

const SortButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '13px',
  padding: '6px 10px',
  minWidth: 'auto',
  marginRight: '8px',
  borderRadius: '8px',
  boxShadow: 'none',
  '&.MuiButton-contained': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
}));

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  onFilterChange,
  onResetFilters,
  companySizes,
  industries,
  cities,
  initialFilters
}) => {
  const [filters, setFilters] = useState<CompaniesFilter>(
    initialFilters || {
      search: '',
      industries: [],
      size: '',
      city_id: undefined,
      sort_by: 'rating',
      sort_order: 'desc',
      page: 1,
      limit: 10
    }
  );

  const hasActiveFilters = (): boolean => {
    return (
      (filters.industries !== undefined && filters.industries.length > 0) ||
      !!filters.size ||
      !!filters.city_id ||
      filters.sort_by !== 'rating' ||
      filters.sort_order !== 'desc'
    );
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCityChange = (event: SelectChangeEvent<unknown>) => {
    setFilters((prev) => ({
      ...prev,
      city_id: event.target.value as number,
      page: 1
    }));
  };

  const handleIndustriesChange = (event: SelectChangeEvent<unknown>) => {
    setFilters((prev) => ({
      ...prev,
      industries: event.target.value as number[],
      page: 1
    }));
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, size: event.target.value, page: 1 }));
  };

  const handleSortChange = (sortBy: 'name' | 'rating' | 'reviews_count' | 'created_at') => {
    setFilters((prev) => {
      if (prev.sort_by === sortBy) {
        return {
          ...prev,
          sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
          page: 1
        };
      }
      return {
        ...prev,
        sort_by: sortBy,
        sort_order: 'desc',
        page: 1
      };
    });
  };

  const handleReset = () => {
    setFilters({
      search: '',
      industries: [],
      size: '',
      city_id: undefined,
      sort_by: 'rating',
      sort_order: 'desc',
      page: 1,
      limit: 10
    });

    onResetFilters();
  };

  const getIndustryNames = (industryIds: number[]) => {
    return industries
      .filter(industry => industryIds.includes(industry.id))
      .map(industry => industry.name);
  };

  return (
    <FilterContainer>
      <FilterHeading>
        <FilterTitle>Фильтры</FilterTitle>
        {hasActiveFilters() && (
          <ResetButton
            onClick={handleReset}
            startIcon={<ClearIcon />}
          >
            Сбросить
          </ResetButton>
        )}
      </FilterHeading>

      <FilterSection>
        <FilterLabel>Локация</FilterLabel>
        <FormControl fullWidth variant="outlined">
          <StyledSelect
            value={filters.city_id || ''}
            onChange={handleCityChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <Typography sx={{ color: '#666' }}>Выбрать город</Typography>;
              }
              const selectedCity = cities.find(city => city.id === selected);
              return selectedCity ? selectedCity.name : '';
            }}
            input={<OutlinedInput />}
          >
            <MenuItem value="">Все города</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}, {city.region}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Индустрия</FilterLabel>
        <FormControl fullWidth variant="outlined">
          <StyledSelect
            multiple
            value={filters.industries || []}
            onChange={handleIndustriesChange}
            displayEmpty
            renderValue={(selected) => {
              const selectedArray = selected as number[];
              if (selectedArray.length === 0) {
                return <Typography sx={{ color: '#666' }}>Выбрать индустрии</Typography>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {getIndustryNames(selectedArray).map((name) => (
                    <StyledChip key={name} label={name} />
                  ))}
                </Box>
              );
            }}
            input={<OutlinedInput />}
          >
            {industries.map((industry) => (
              <MenuItem key={industry.id} value={industry.id}>
                {industry.name}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Размер компании</FilterLabel>
        <RadioGroup
          value={filters.size || ''}
          onChange={handleSizeChange}
        >
          <StyledFormControlLabel value="" control={<StyledRadio />} label="Все" />
          <StyledFormControlLabel value="small" control={<StyledRadio />} label={companySizes.small} />
          <StyledFormControlLabel value="medium" control={<StyledRadio />} label={companySizes.medium} />
          <StyledFormControlLabel value="large" control={<StyledRadio />} label={companySizes.large} />
          <StyledFormControlLabel value="enterprise" control={<StyledRadio />} label={companySizes.enterprise} />
        </RadioGroup>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Сортировка</FilterLabel>
        <Box>
          <SortingContainer>
            <SortButton
              variant={filters.sort_by === 'name' ? 'contained' : 'outlined'}
              color={filters.sort_by === 'name' ? 'primary' : 'inherit'}
              onClick={() => handleSortChange('name')}
              endIcon={filters.sort_by === 'name' ?
                (filters.sort_order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)
                : null}
            >
              По названию
            </SortButton>
            <SortButton
              variant={filters.sort_by === 'rating' ? 'contained' : 'outlined'}
              color={filters.sort_by === 'rating' ? 'primary' : 'inherit'}
              onClick={() => handleSortChange('rating')}
              endIcon={filters.sort_by === 'rating' ?
                (filters.sort_order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)
                : null}
            >
              По рейтингу
            </SortButton>
          </SortingContainer>
          <SortingContainer>
            <SortButton
              variant={filters.sort_by === 'reviews_count' ? 'contained' : 'outlined'}
              color={filters.sort_by === 'reviews_count' ? 'primary' : 'inherit'}
              onClick={() => handleSortChange('reviews_count')}
              endIcon={filters.sort_by === 'reviews_count' ?
                (filters.sort_order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)
                : null}
            >
              По числу отзывов
            </SortButton>
            <SortButton
              variant={filters.sort_by === 'created_at' ? 'contained' : 'outlined'}
              color={filters.sort_by === 'created_at' ? 'primary' : 'inherit'}
              onClick={() => handleSortChange('created_at')}
              endIcon={filters.sort_by === 'created_at' ?
                (filters.sort_order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)
                : null}
            >
              По дате
            </SortButton>
          </SortingContainer>
        </Box>
      </FilterSection>
    </FilterContainer>
  );
};

export default CompanyFilters; 