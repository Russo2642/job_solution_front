import { Box, Pagination as MuiPagination, SxProps, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circular' | 'rounded';
  disabled?: boolean;
  containerStyles?: SxProps<Theme>;
  paginationStyles?: SxProps<Theme>;
}

const PaginationContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
  marginBottom: '20px',
});

const StyledPagination = styled(MuiPagination)(({ theme }) => ({
  '& .MuiPaginationItem-root': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstButton = true,
  showLastButton = true,
  size = 'medium',
  shape = 'rounded',
  disabled = false,
  containerStyles,
  paginationStyles,
}: PaginationProps) => {
  const handleChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <PaginationContainer sx={containerStyles}>
      <StyledPagination
        page={currentPage}
        count={totalPages}
        onChange={handleChange}
        siblingCount={siblingCount}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        size={size}
        shape={shape}
        disabled={disabled}
        sx={paginationStyles}
      />
    </PaginationContainer>
  );
};

export default Pagination; 