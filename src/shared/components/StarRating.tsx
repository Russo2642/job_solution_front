import StarIcon from '@mui/icons-material/Star'
import { Box, Rating, Typography, SxProps, Theme } from '@mui/material'
import { styled } from '@mui/material/styles'

interface StarRatingProps {
  rating: number;
  reviewsCount?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  readOnly?: boolean;
  precision?: 0.1 | 0.5 | 1;
  onChange?: (value: number | null) => void;
  countTextStyles?: SxProps<Theme>;
  containerStyles?: SxProps<Theme>;
  ratingStyles?: SxProps<Theme>;
}

const RatingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
})

const StyledRating = styled(Rating)({
  color: '#FFD700',
  '& .MuiRating-iconEmpty': {
    color: '#E0E0E0',
  },
  '& .MuiRating-iconFilled': {
    color: '#FFD700',
  },
})

const CountText = styled(Typography)({
  marginLeft: '12px',
  color: '#666',
  fontSize: '16px',
  fontWeight: 500,
})

const getSizeValue = (size?: 'small' | 'medium' | 'large' | 'xlarge') => {
  switch (size) {
    case 'small':
      return 'small';
    case 'large':
      return 'large';
    case 'xlarge':
      return 'large'; // MUI Rating не имеет xlarge, используем кастомный размер через sx
    default:
      return 'medium';
  }
}

const getIconStyle = (size?: 'small' | 'medium' | 'large' | 'xlarge') => {
  const baseStyle = { borderRadius: '4px' };
  
  if (size === 'xlarge') {
    return { ...baseStyle, fontSize: '2.5rem' };
  }
  
  return baseStyle;
}

const StarRating = ({ 
  rating, 
  reviewsCount = 0, 
  showCount = true, 
  size = 'medium',
  readOnly = true,
  precision = 0.1,
  onChange,
  countTextStyles,
  containerStyles,
  ratingStyles
}: StarRatingProps) => {
  return (
    <RatingContainer sx={containerStyles}>
      <StyledRating
        value={rating}
        precision={precision}
        readOnly={readOnly}
        onChange={(_, value) => onChange && onChange(value)}
        size={getSizeValue(size)}
        icon={<StarIcon fontSize="inherit" style={getIconStyle(size)} />}
        emptyIcon={<StarIcon fontSize="inherit" style={getIconStyle(size)} />}
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: size === 'xlarge' ? '2.5rem' : undefined,
          },
          ...ratingStyles
        }}
      />
      {showCount && (
        <CountText sx={countTextStyles}>
          {rating.toFixed(1).replace('.', ',')} {reviewsCount > 0 && `(${reviewsCount} отзывов)`}
        </CountText>
      )}
    </RatingContainer>
  )
}

export default StarRating 