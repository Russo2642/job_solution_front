import { Alert, Box, CircularProgress, Pagination, Typography } from '@mui/material';
import React from 'react';
import { CompanyWithDetails } from '../types';
import CompanyCard from './CompanyCard';

interface CompaniesListProps {
  companies: CompanyWithDetails[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const CompaniesList: React.FC<CompaniesListProps> = ({
  companies,
  loading,
  error,
  totalPages,
  currentPage,
  onPageChange
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Отображаем состояние загрузки */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Отображаем ошибку, если она есть */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Если данные загружены и нет ошибки */}
      {!loading && !error && (
        <>
          {/* Если компании есть */}
          {companies.length > 0 ? (
            <>
              {/* Список компаний */}
              {companies.map((company) => (
                <CompanyCard key={company.company.id} company={company} />
              ))}

              {/* Пагинация */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" my={4}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                Компании не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Попробуйте изменить параметры фильтрации
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CompaniesList; 