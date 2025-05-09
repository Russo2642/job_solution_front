import {
  Box,
  Card,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyWithDetails } from '../types';

interface CompanyCardProps {
  company: CompanyWithDetails;
}

const CompanyContainer = styled(Card)({
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
    borderColor: '#d0d0d0',
  }
});

const CompanyHeader = styled(Box)({
  display: 'flex',
  width: '100%',
});

const CompanyLogo = styled(Box)({
  width: '50px',
  height: '50px',
  borderRadius: '10px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }
});

const CompanyInfo = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
});

const CompanyNameSection = styled(Box)({
  marginBottom: '2px',
  overflow: 'hidden',
});

const CompanyName = styled(Typography)({
  fontWeight: 600,
  fontSize: '16px',
  color: '#1a1a1a',
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const CityText = styled(Typography)({
  fontSize: '12px',
  color: '#666',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const RatingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginTop: '4px',
});

const StarContainer = styled(Box)({
  display: 'flex',
  marginRight: '8px',
});

const StarIcon = styled('span')({
  color: '#FFB400',
  fontSize: '14px',
  lineHeight: 1,
  marginRight: '1px',
});

const EmptyStarIcon = styled('span')({
  color: '#E0E0E0',
  fontSize: '14px',
  lineHeight: 1,
  marginRight: '1px',
});

const ReviewsText = styled(Typography)({
  fontSize: '12px',
  color: '#666',
});

const CompanyDetails = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginTop: '10px',
  flexWrap: 'wrap',
  gap: '6px',
});

const InfoItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '10px',
});

const InfoIcon = styled(Box)({
  fontSize: '12px',
  color: '#999',
  marginRight: '4px',
});

const InfoText = styled(Typography)({
  fontSize: '12px',
  color: '#555',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
});

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const { company: companyData, city } = company;

  const getLogoColor = (name: string) => {
    const colors: Record<string, string> = {
      'K': '#f44336', // Kaspi - красный
      'О': '#1973e8', // Озон - синий
      'В': '#1976d2', // ВТБ - синий
      'H': '#008364', // Halyk - зеленый
      'Т': '#7b1fa2', // Точка - фиолетовый
      'P': '#003087', // PayPal - темно-синий
      'С': '#21A038', // Сбербанк - зеленый
      'А': '#ef3124', // Альфа - красный
      'U': '#ec0016', // UBS - красный
    };

    const firstLetter = name.charAt(0).toUpperCase();
    return colors[firstLetter] || '#1976d2';
  };

  const renderStars = (rating: number) => {
    const starsArray = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        starsArray.push(<StarIcon key={i}>★</StarIcon>);
      } else {
        starsArray.push(<EmptyStarIcon key={i}>★</EmptyStarIcon>);
      }
    }
    
    return starsArray;
  };

  const getCompanySize = () => {
    switch(companyData.size) {
      case 'enterprise':
        return '1000+ сотрудников';
      case 'large':
        return '200-1000 сотрудников';
      case 'medium':
        return '50-200 сотрудников';
      case 'small':
      default:
        return 'до 50 сотрудников';
    }
  };

  return (
    <StyledLink to={`/company/${companyData.slug}`}>
      <CompanyContainer>
        <CompanyHeader>
          <CompanyLogo
            sx={{
              bgcolor: companyData.logo ? 'transparent' : getLogoColor(companyData.name)
            }}
          >
            {companyData.logo ? (
              <img src={companyData.logo} alt={companyData.name} />
            ) : (
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {companyData.name.charAt(0)}
              </Typography>
            )}
          </CompanyLogo>

          <CompanyInfo>
            <CompanyNameSection>
              <CompanyName>{companyData.name}</CompanyName>
              <CityText>
                {city?.name || 'Офисы по всей стране'}
              </CityText>
            </CompanyNameSection>

            <RatingContainer>
              <StarContainer>
                {renderStars(companyData.average_rating)}
              </StarContainer>
              <ReviewsText>
                {companyData.reviews_count} отзывов
              </ReviewsText>
            </RatingContainer>
          </CompanyInfo>
        </CompanyHeader>

        <CompanyDetails>
          <InfoItem>
            <InfoIcon>👥</InfoIcon>
            <InfoText>{getCompanySize()}</InfoText>
          </InfoItem>
          {companyData.founded_year && (
            <InfoItem>
              <InfoIcon>🗓️</InfoIcon>
              <InfoText>Основана в {companyData.founded_year} году</InfoText>
            </InfoItem>
          )}
        </CompanyDetails>
      </CompanyContainer>
    </StyledLink>
  );
};

export default CompanyCard; 