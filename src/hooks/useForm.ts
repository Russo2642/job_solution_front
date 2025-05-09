import { useState, useCallback, ChangeEvent } from 'react';

interface ValidationRule<T> {
  validate: (value: any, values: T) => boolean;
  message: string;
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void;
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setValues: (values: Partial<T>) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateForm: () => boolean;
}

/**
 * Кастомный хук для работы с формами, управления состоянием и валидацией
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {} as ValidationRules<T>,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isDirty, setIsDirty] = useState(false);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsDirty(false);
  }, [initialValues]);

  const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(values[field], values)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    return true;
  }, [values, validationRules]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;

    Object.keys(validationRules).forEach((key) => {
      const field = key as keyof T;
      const fieldRules = validationRules[field];
      
      if (!fieldRules) return;

      for (const rule of fieldRules) {
        if (!rule.validate(values[field], values)) {
          newErrors[field] = rule.message;
          isValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
      
    setFieldValue(name as keyof T, newValue as any);
  }, []);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prevValues => ({
      ...prevValues,
      [field]: value,
    }));
    setIsDirty(true);
    
    if (touched[field]) {
      validateField(field);
    }
  }, [touched, validateField]);
  
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues,
    }));
    setIsDirty(true);
    
    Object.keys(newValues).forEach(key => {
      const field = key as keyof T;
      if (touched[field]) {
        validateField(field);
      }
    });
  }, [touched, validateField]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const field = e.target.name as keyof T;
    setFieldTouched(field, true);
    validateField(field);
  }, [validateField]);

  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched,
    }));
    
    if (isTouched) {
      validateField(field);
    }
  }, [validateField]);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);

    const isFormValid = validateForm();
    
    if (isFormValid && onSubmit) {
      await onSubmit(values);
    }
  }, [values, validateForm, onSubmit]);

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    handleSubmit,
    setValues: setFormValues,
    validateField,
    validateForm,
  };
} 