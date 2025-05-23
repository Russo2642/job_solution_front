import React from 'react';
import styles from './CompanyRating.module.css';

interface RatingDistribution {
  rating: number;
  count: number;
}

interface CategoryRating {
  category: string;
  rating: number;
}

interface CompanyRatingProps {
  overallRating: number;
  ratingText: string;
  reviewsCount: number;
  ratingDistribution?: RatingDistribution[];
  categoryRatings: CategoryRating[];
  recommendationPercentage?: number;
}

export const CompanyRating: React.FC<CompanyRatingProps> = ({
  overallRating,
  ratingText,
  reviewsCount,
  categoryRatings,
  recommendationPercentage,
}) => {
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.ratingColumn}>
        <h3 className={styles.ratingTitle}>Оценка компании</h3>
        <div className={styles.overallRatingContainer}>
          <div className={styles.overallRating}>{overallRating.toFixed(1)}</div>
          <div className={styles.ratingDescription}>
            <div className={styles.ratingText}>{ratingText}</div>
            <div className={styles.reviewsCount}>{reviewsCount} отзывов</div>
          </div>
        </div>
        
        {recommendationPercentage !== undefined && (
          <div className={styles.recommendationContainer}>
            <div className={styles.recommendationPercentage}>
              {recommendationPercentage}%
            </div>
            <div className={styles.recommendationBar}>
              <div 
                className={styles.recommendationFill} 
                style={{ width: `${recommendationPercentage}%` }}
              ></div>
            </div>
            <div className={styles.recommendationText}>
              рекомендуют
            </div>
          </div>
        )}
      </div>

      <div className={styles.categoryColumn}>
        <h3 className={styles.ratingTitle}>Оценки по категориям</h3>
        <div className={styles.categoryContainer}>
          {categoryRatings && categoryRatings.length > 0 ? (
            categoryRatings.map((category) => (
              <div key={category.category} className={styles.categoryRow}>
                <div className={styles.categoryStars}>
                  <span className={styles.starRating}>{category.rating.toFixed(1)}</span>
                  <span className={styles.starIcon}>★</span>
                </div>
                <div className={styles.categoryName}>{category.category}</div>
              </div>
            ))
          ) : (
            <div className={styles.noRatings}>Нет оценок по категориям</div>
          )}
        </div>
      </div>
    </div>
  );
}; 