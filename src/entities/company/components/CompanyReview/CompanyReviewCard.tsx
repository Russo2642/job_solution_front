import React, { useEffect, useState } from 'react';
import { ReviewApi, isAuthenticated } from '../../../../shared/api';
import styles from './CompanyReviewCard.module.css';

interface Benefit {
  id: number;
  text: string;
}

interface ReviewCardProps {
  id: number;
  position: string;
  date: string;
  rating: number;
  isFormerEmployee: boolean;
  employment: string;
  workExperience: string;
  location: string;
  likes: string;
  whatLiked: string;
  whatImprove: string;
  benefits: Benefit[];
  isMarkedAsUseful?: boolean;
}

export const CompanyReviewCard: React.FC<ReviewCardProps> = ({
  id,
  position,
  date,
  rating,
  isFormerEmployee,
  employment,
  workExperience,
  location,
  likes,
  whatLiked,
  whatImprove,
  benefits,
  isMarkedAsUseful: initialIsMarkedAsUseful = false,
}) => {
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsMarkedAsUseful);
  const [likesCount, setLikesCount] = useState(parseInt(likes) || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsMarkedAsUseful);
  }, [initialIsMarkedAsUseful]);

  useEffect(() => {
    if (showAuthAlert) {
      const timer = setTimeout(() => {
        setShowAuthAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAuthAlert]);

  const toggleBenefits = () => {
    setIsBenefitsOpen(!isBenefitsOpen);
  };

  const handleLike = async () => {
    if (isLoading) return;

    if (!isAuthenticated()) {
      setShowAuthAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        await ReviewApi.removeUsefulMark(id);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await ReviewApi.markAsUseful(id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Ошибка при обновлении полезного отзыва:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`${styles.star} ${i <= rating ? styles.starFilled : styles.starEmpty}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.topRow}>
          <div className={styles.positionWrapper}>
            <h3 className={styles.position}>{position}</h3>
          </div>
          <div className={styles.dateContainer}>
            <span className={styles.date}>{date}</span>
          </div>
        </div>
        
        <div className={styles.infoRow}>
          <div className={styles.ratingContainer}>
            <div className={styles.ratingValue}>{rating.toFixed(1)}</div>
            <div className={styles.stars}>{renderStars(rating)}</div>
          </div>
        </div>

        <div className={styles.tags}>
          <span className={styles.tag}>{isFormerEmployee ? 'Бывший сотрудник' : 'Текущий сотрудник'}</span>
          <span className={styles.tag}>{employment}</span>
          <span className={styles.tag}>{workExperience}</span>
          <span className={styles.tag}>{location}</span>
        </div>
      </div>

      <div className={styles.reviewContent}>
        <div className={styles.reviewSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.emojiIcon}>✓</span>
            <span>Что понравилось</span>
          </div>
          <p className={styles.sectionText}>{whatLiked}</p>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.emojiIcon}>✗</span>
            <span>Что можно было бы улучшить</span>
          </div>
          <p className={styles.sectionText}>{whatImprove}</p>
        </div>

        <div className={styles.benefitsSection}>
          <button onClick={toggleBenefits} className={styles.benefitsToggle}>
            Список льгот <span className={isBenefitsOpen ? styles.arrowUp : styles.arrowDown}>▼</span>
          </button>

          {isBenefitsOpen && (
            <div className={styles.benefitsTags}>
              {benefits.map((benefit) => (
                <span key={benefit.id} className={styles.benefitTag}>
                  {benefit.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviewFooter}>
        <button
          className={`${styles.usefulButton} ${isLiked ? styles.usefulButtonActive : ''}`}
          onClick={handleLike}
          disabled={isLoading}
        >
          <span className={styles.thumbIcon}>👍</span>
          <span className={styles.usefulText}>Полезный отзыв:</span> <span className={styles.usefulCount}>{likesCount}</span>
        </button>
      </div>

      {showAuthAlert && (
        <div className={styles.authAlert}>
          Необходимо авторизоваться, чтобы отметить отзыв как полезный
        </div>
      )}
    </div>
  );
}; 