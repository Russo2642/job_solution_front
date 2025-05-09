import React from 'react';
import styles from './CompanyHeader.module.css';

interface Industry {
  name: string;
  type: 'banking' | 'fintech' | 'finance';
  color?: string;
  textColor?: string;
}

interface CompanyHeaderProps {
  logo: string;
  name: string;
  rating: number;
  reviewsCount: number;
  industries: Industry[];
  onReviewClick: () => void;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  logo,
  name,
  rating,
  reviewsCount,
  industries,
  onReviewClick,
  socialLinks,
}) => {
  const getIndustryClassName = (type: Industry['type']) => {
    const classMap: Record<Industry['type'], string> = {
      banking: styles.bankingTag,
      fintech: styles.fintechTag,
      finance: styles.financeTag,
    };
    return classMap[type] || '';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className={styles.star}>★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>★</span>);
      }
    }

    return stars;
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.logoContainer}>
        <img src={logo} alt={`${name} logo`} className={styles.logo} />
      </div>
      <div className={styles.infoContainer}>
        <h1 className={styles.companyName}>{name}</h1>
        <div className={styles.ratingRow}>
          <div className={styles.ratingSquare}>{rating.toFixed(1)}</div>
          <div className={styles.stars}>{renderStars(rating)}</div>
          <div className={styles.reviewsCount}>({reviewsCount} Отзывов)</div>
        </div>
        <div className={styles.industries}>
          {industries.map((industry, index) => {
            const backgroundColor = industry.color ? `${industry.color}33` : '#3949AB33';
            const textColor = industry.color || '#3949AB';
            
            return (
              <span 
                key={index} 
                className={`${styles.industryTag} ${getIndustryClassName(industry.type)}`}
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
              >
                {industry.name}
              </span>
            );
          })}
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <button className={styles.reviewButton} onClick={onReviewClick}>
          Оставить отзыв
        </button>
        <div className={styles.socialLinks}>
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <span className={styles.twitterIcon}>𝕏</span>
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <span className={styles.linkedinIcon}>in</span>
            </a>
          )}
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <span className={styles.facebookIcon}>f</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}; 