import React from 'react';
import styles from './CompanyContacts.module.css';

interface ContactDetail {
  type: 'website' | 'email' | 'phone' | 'address';
  value: string;
  icon: React.ReactNode;
}

interface Industry {
  name: string;
  type: 'banking' | 'fintech' | 'finance';
  color?: string;
  textColor?: string;
}

interface CompanyContactsProps {
  contacts: ContactDetail[];
  industries: Industry[];
  companySize: number;
  companySizeText?: string;
}

export const CompanyContacts: React.FC<CompanyContactsProps> = ({
  contacts,
  industries,
  companySize,
  companySizeText,
}) => {
  const getIndustryClassName = (type: Industry['type']) => {
    const classMap: Record<Industry['type'], string> = {
      banking: styles.bankingTag,
      fintech: styles.fintechTag,
      finance: styles.financeTag,
    };
    return classMap[type] || '';
  };

  const formatWebsiteUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, '');
  };

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 11) {
      return `+${digits[0]} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
    }
    
    return phone;
  };

  return (
    <div className={styles.contactsContainer}>
      <h3 className={styles.sectionTitle}>Контакты</h3>
      <div className={styles.contactsList}>
        {contacts.map((contact, index) => (
          <div key={index} className={styles.contactItem}>
            <div className={styles.contactIcon} style={{ color: '#555' }}>{contact.icon}</div>
            {contact.type === 'website' ? (
              <a href={contact.value} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                {formatWebsiteUrl(contact.value)}
              </a>
            ) : contact.type === 'phone' ? (
              <div className={styles.contactValue}>{formatPhoneNumber(contact.value)}</div>
            ) : (
              <div className={styles.contactValue}>{contact.value}</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.industrySection}>
        <h3 className={styles.sectionTitle}>Индустрия</h3>
        <div className={styles.industryTags}>
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

      <div className={styles.companySize}>
        <div className={styles.companySizeRow}>
          <span className={styles.sectionTitle}>Размер компании</span>
          <span className={styles.companySizeValue}>
            {companySizeText || companySize}
          </span>
        </div>
      </div>
    </div>
  );
}; 