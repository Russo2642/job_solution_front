import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CompanyContacts,
  CompanyHeader,
  CompanyRating,
  CompanyReviewCard,
  EmployeeFilter,
  EmployeeFilterOption,
  LocationFilter,
  RatingFilter,
  SortFilter,
  SortOption
} from '../../../entities/company';
import { CategoryRating, City, Company, CompanyWithDetails, Industry } from '../../../entities/company/types';
import { ReviewWithDetails } from '../../../entities/review/types';
import { CityApi, CompanyApi, type CompanyDetailsResponse, type CompanyReviewsResponse } from '../../../shared/api';
import styles from './CompanyPage.module.css';


import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SortIcon from '@mui/icons-material/Sort';
import StarIcon from '@mui/icons-material/Star';

const getContrastTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState<Company | null>(null);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [similarCompanies, setSimilarCompanies] = useState<CompanyWithDetails[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string>('Все города');
  const [selectedRating, setSelectedRating] = useState<string>('Любой рейтинг');
  const [sortOption, setSortOption] = useState<SortOption>({
    id: 'newest',
    label: 'Сначала новые',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [employeeOption, setEmployeeOption] = useState<EmployeeFilterOption>({
    id: 'all',
    label: 'Все сотрудники',
    value: undefined
  });

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchCompanyDetails = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const response: CompanyDetailsResponse = await CompanyApi.getCompanyDetails(slug);

      if (response.success) {
        const companyData = response.data.company;
        const industries = response.data.industries;

        setCompany(companyData);
        setCategoryRatings(response.data.category_ratings);
        setIndustries(industries);
        setCity(response.data.city);

        try {
          const citiesResponse = await CityApi.getCities();
          if (citiesResponse.success) {
            setCities(citiesResponse.data.cities);
          }
        } catch (error) {
          console.error('Ошибка при загрузке списка городов:', error);
        }

        const { min, max } = getRatingRange(selectedRating);
        fetchCompanyReviews(
          companyData.id,
          page,
          city?.id,
          min,
          max,
          sortOption.sortBy,
          sortOption.sortOrder,
          employeeOption.value
        );

        fetchSimilarCompanies(industries, companyData.id);
      } else {
        setError('Не удалось загрузить информацию о компании');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных компании:', error);
      setError('Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyReviews = async (
    companyId: number,
    pageNum = 1,
    cityId?: number,
    minRating?: number,
    maxRating?: number,
    sortByParam = sortOption.sortBy,
    sortOrderParam = sortOption.sortOrder,
    isFormerEmployeeParam = employeeOption.value
  ) => {
    try {
      const response: CompanyReviewsResponse = await CompanyApi.getCompanyReviews(
        companyId,
        pageNum,
        5,
        sortByParam,
        sortOrderParam,
        cityId,
        minRating,
        maxRating,
        isFormerEmployeeParam
      );

      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(Math.ceil(response.data.pagination.total / response.data.pagination.limit));
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    }
  };

  const fetchSimilarCompanies = async (companyIndustries: Industry[], currentCompanyId: number) => {
    if (!companyIndustries || companyIndustries.length === 0) {
      return;
    }

    try {
      const industryIds = companyIndustries.map(industry => industry.id);

      const response = await CompanyApi.getCompanies({
        industries: industryIds,
        limit: 5,
        sort_by: 'rating',
        sort_order: 'desc'
      });

      if (response.success) {
        const filtered = response.data.companies.filter(comp =>
          comp.company.id !== currentCompanyId
        );
        if (filtered.length === 0) {
          try {
            const generalResponse = await CompanyApi.getCompanies({
              limit: 10,
              sort_by: 'rating',
              sort_order: 'desc'
            });

            if (generalResponse.success) {
              const generalFiltered = generalResponse.data.companies.filter(comp =>
                comp.company.id !== currentCompanyId
              );
              setSimilarCompanies(generalFiltered.slice(0, 5));
            }
          } catch (error) {
            console.error('Ошибка при загрузке общих компаний:', error);
          }

          return;
        }

        const similarCompaniesSlice = filtered.slice(0, 5);
        setSimilarCompanies(similarCompaniesSlice);
      }
    } catch (error) {
      console.error('Ошибка при загрузке похожих компаний:', error);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCompanyDetails();
    }
  }, [slug]);

  const getRatingRange = (ratingText: string): { min?: number, max?: number } => {
    if (ratingText === 'Любой рейтинг') return { min: undefined, max: undefined };

    const match = ratingText.match(/(\d+)★.*\((\d+(\.\d+)?)-(\d+(\.\d+)?)\)/);
    if (match) {
      return {
        min: parseFloat(match[2]),
        max: parseFloat(match[4])
      };
    }

    return {
      min: parseInt(ratingText.charAt(0)),
      max: parseInt(ratingText.charAt(0))
    };
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    if (company) {
      const cityObj = cities.find(c => c.name === location);
      const cityId = location === 'Все города' ? undefined : cityObj?.id;
      const { min, max } = getRatingRange(selectedRating);
      fetchCompanyReviews(
        company.id,
        page,
        cityId,
        min,
        max,
        sortOption.sortBy,
        sortOption.sortOrder,
        employeeOption.value
      );
    }
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    if (company) {
      const cityObj = cities.find(c => c.name === selectedLocation);
      const cityId = selectedLocation === 'Все города' ? undefined : cityObj?.id;
      const { min, max } = getRatingRange(rating);
      fetchCompanyReviews(
        company.id,
        page,
        cityId,
        min,
        max,
        sortOption.sortBy,
        sortOption.sortOrder,
        employeeOption.value
      );
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    if (company) {
      const cityObj = cities.find(c => c.name === selectedLocation);
      const cityId = selectedLocation === 'Все города' ? undefined : cityObj?.id;
      const { min, max } = getRatingRange(selectedRating);
      fetchCompanyReviews(
        company.id,
        page,
        cityId,
        min,
        max,
        option.sortBy,
        option.sortOrder,
        employeeOption.value
      );
    }
  };

  const handleEmployeeChange = (option: EmployeeFilterOption) => {
    setEmployeeOption(option);
    if (company) {
      const cityObj = cities.find(c => c.name === selectedLocation);
      const cityId = selectedLocation === 'Все города' ? undefined : cityObj?.id;
      const { min, max } = getRatingRange(selectedRating);
      fetchCompanyReviews(
        company.id,
        page,
        cityId,
        min,
        max,
        sortOption.sortBy,
        sortOption.sortOrder,
        option.value
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (company) {
      const cityObj = cities.find(c => c.name === selectedLocation);
      const cityId = selectedLocation === 'Все города' ? undefined : cityObj?.id;
      const { min, max } = getRatingRange(selectedRating);
      fetchCompanyReviews(
        company.id,
        newPage,
        cityId,
        min,
        max,
        sortOption.sortBy,
        sortOption.sortOrder,
        employeeOption.value
      );
    }
  };

  const handleSimilarCompanyClick = (company: CompanyWithDetails) => {
    navigate(`/company/${company.company.slug}`);
  };

  const handleReviewClick = () => {
    if (company) {
      navigate(`/add-review/${company.id}`);
    }
  };

  const getCompanySizeText = (size: string): string => {
    switch (size) {
      case 'small': return 'до 50 сотрудников';
      case 'medium': return '50-200 сотрудников';
      case 'large': return '200-1000 сотрудников';
      case 'enterprise': return 'более 1000 сотрудников';
      default: return 'не указан';
    }
  };

  const prepareCompanyData = () => {
    if (!company) return null;

    const contacts = [
      company.website ? {
        type: 'website' as const,
        value: company.website,
        icon: <LanguageIcon fontSize="small" />
      } : null,
      company.email ? {
        type: 'email' as const,
        value: company.email,
        icon: <EmailIcon fontSize="small" />
      } : null,
      company.phone ? {
        type: 'phone' as const,
        value: company.phone,
        icon: <PhoneIcon fontSize="small" />
      } : null,
      company.address ? {
        type: 'address' as const,
        value: company.address,
        icon: <LocationOnIcon fontSize="small" />
      } : null
    ].filter(Boolean) as {
      type: 'website' | 'email' | 'phone' | 'address';
      value: string;
      icon: React.ReactNode;
    }[];

    const companyIndustries = industries.map(industry => {
      const color = industry.color || '#3949AB';
      return {
        name: industry.name,
        type: mapIndustryType(industry.name),
        color: color,
        textColor: getContrastTextColor(color)
      };
    });

    const companySizeValue = mapCompanySize(company.size);
    const companySizeText = getCompanySizeText(company.size);

    return {
      logo: company.logo || 'https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo',
      name: company.name,
      rating: company.average_rating,
      reviewsCount: company.reviews_count,
      recommendationPercentage: company.recommendation_percentage,
      industries: companyIndustries,
      socialLinks: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        facebook: 'https://facebook.com',
      },
      contacts: contacts,
      companySize: companySizeValue,
      companySizeText: companySizeText,
      ratingText: getRatingText(company.average_rating),
      ratingDistribution: [
        { rating: 5, count: getCountForRating(5) },
        { rating: 4, count: getCountForRating(4) },
        { rating: 3, count: getCountForRating(3) },
        { rating: 2, count: getCountForRating(2) },
        { rating: 1, count: getCountForRating(1) },
      ],
      categoryRatings: categoryRatings,
    };
  };

  const mapIndustryType = (industryName: string): 'banking' | 'fintech' | 'finance' => {
    const lowerName = industryName.toLowerCase();
    if (lowerName.includes('банк')) return 'banking';
    if (lowerName.includes('финтех')) return 'fintech';
    return 'finance';
  };

  const mapCompanySize = (size: string): number => {
    switch (size) {
      case 'small': return 50;
      case 'medium': return 200;
      case 'large': return 1000;
      case 'enterprise': return 1000;
      default: return 1000;
    }
  };

  const getRatingText = (rating: number): string => {
    if (rating >= 4.5) return 'отлично';
    if (rating >= 3.5) return 'хорошо';
    if (rating >= 2.5) return 'средне';
    if (rating >= 1.5) return 'плохо';
    return 'ужасно';
  };

  const getCountForRating = (rating: number): number => {
    if (!company || !company.reviews_count) return 0;

    const avgRating = company.average_rating;
    const totalReviews = company.reviews_count;

    let percentage = 0;
    const diff = Math.abs(avgRating - rating);

    if (diff < 0.5) percentage = 0.5;
    else if (diff < 1.5) percentage = 0.3;
    else if (diff < 2.5) percentage = 0.15;
    else percentage = 0.05;

    return Math.round(totalReviews * percentage);
  };

  const prepareReviews = () => {
    return reviews.map(review => {
      const isFormerEmployee =
        review.review.isFormerEmployee !== undefined
          ? review.review.isFormerEmployee
          : ('is_former_employee' in review.review
            ? Boolean((review.review as any).is_former_employee)
            : false);

      return {
        id: review.review.id,
        position: review.review.position || 'Сотрудник',
        date: formatDate(review.review.created_at),
        rating: review.review.rating,
        isFormerEmployee,
        employment: review.employment_type
          ? `${review.employment_type.name}`
          : review.review.employment || 'Не указано',
        workExperience: review.employment_period
          ? `Стаж в компании: ${review.employment_period.name}`
          : 'Стаж в компании: Не указан',
        location: review.city?.name || 'Не указан',
        whatLiked: review.review.pros || 'Не указано',
        whatImprove: review.review.cons || 'Не указано',
        benefits: review.benefits ? review.benefits.map((benefit, index) => ({
          id: index,
          text: benefit.benefit
        })) : [],
        likes: review.review.useful_count?.toString() || '0',
        isMarkedAsUseful: review.is_marked_as_useful
      };
    });
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return 'Недавно';
    }
  };

  const renderSimilarCompany = (company: CompanyWithDetails) => {
    return (
      <div
        key={company.company.id}
        className={styles.similarCompanyItem}
        onClick={() => handleSimilarCompanyClick(company)}
      >
        <div className={styles.similarCompanyLogo}>
          <img
            src={company.company.logo || `https://placehold.co/40x40/gray/white?text=${company.company.name.charAt(0)}`}
            alt={company.company.name}
          />
        </div>
        <div className={styles.similarCompanyInfo}>
          <div className={styles.similarCompanyName}>{company.company.name}</div>
          <div className={styles.similarCompanyReviews}>
            {company.company.reviews_count} отзывов
          </div>
        </div>
        <div className={styles.similarCompanyRating}>
          {company.company.average_rating.toFixed(1)} <StarIcon fontSize="small" sx={{ color: '#ffc107' }} />
        </div>
        <div className={styles.similarCompanyArrow}>
          <ArrowForwardIcon fontSize="small" sx={{ color: '#777' }} />
        </div>
      </div>
    );
  };

  const companyData = prepareCompanyData();
  const reviewsData = prepareReviews();

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!companyData) return <div className={styles.error}>Компания не найдена</div>;

  return (
    <div className={styles.companyPage}>
      <div className={styles.container}>
        <CompanyHeader
          logo={companyData.logo}
          name={companyData.name}
          rating={companyData.rating}
          reviewsCount={companyData.reviewsCount}
          industries={companyData.industries}
          onReviewClick={handleReviewClick}
          socialLinks={companyData.socialLinks}
        />

        <div className={styles.contentContainer}>
          <div className={styles.sidebar}>
            <CompanyContacts
              contacts={companyData.contacts}
              industries={companyData.industries}
              companySize={companyData.companySize}
              companySizeText={companyData.companySizeText}
            />

            {/* Блок похожих компаний */}
            {similarCompanies && similarCompanies.length > 0 ? (
              <div className={styles.similarCompanies}>
                <h3 className={styles.sidebarTitle}>Похожие компании в отрасли</h3>
                <div className={styles.similarCompaniesList}>
                  {similarCompanies.map(company => renderSimilarCompany(company))}
                </div>
              </div>
            ) : (
              <div className={styles.similarCompanies} style={{ display: 'none' }}>
                <h3 className={styles.sidebarTitle}>Похожие компании в отрасли</h3>
                <div className={styles.noSimilarCompanies}>
                  Похожие компании не найдены
                </div>
              </div>
            )}
          </div>

          <div className={styles.mainContent}>
            <div className={styles.filtersContainer}>
              <LocationFilter
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                icon={<LocationOnIcon fontSize="small" />}
              />
              <RatingFilter
                selectedRating={selectedRating}
                onRatingChange={handleRatingChange}
                icon={<StarIcon fontSize="small" />}
              />
              <SortFilter
                selectedOption={sortOption}
                onSortChange={handleSortChange}
                icon={<SortIcon fontSize="small" />}
              />
              <EmployeeFilter
                selectedOption={employeeOption}
                onOptionChange={handleEmployeeChange}
                icon={<PersonIcon fontSize="small" />}
              />
            </div>

            <CompanyRating
              overallRating={companyData.rating}
              ratingText={companyData.ratingText}
              reviewsCount={companyData.reviewsCount}
              ratingDistribution={companyData.ratingDistribution}
              categoryRatings={companyData.categoryRatings}
              recommendationPercentage={companyData.recommendationPercentage}
            />

            <div className={styles.reviewsContainer}>
              {reviewsData.length > 0 ? (
                reviewsData.map((review) => (
                  <CompanyReviewCard
                    key={review.id}
                    id={review.id}
                    position={review.position}
                    date={review.date}
                    rating={review.rating}
                    isFormerEmployee={review.isFormerEmployee}
                    employment={review.employment}
                    workExperience={review.workExperience}
                    location={review.location}
                    whatLiked={review.whatLiked}
                    whatImprove={review.whatImprove}
                    benefits={review.benefits}
                    likes={review.likes}
                    isMarkedAsUseful={review.isMarkedAsUseful}
                  />
                ))
              ) : (
                <div className={styles.noReviews}>
                  Отзывов не найдено. Будьте первым, кто оставит отзыв!
                </div>
              )}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`${styles.pageButton} ${page === i + 1 ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};