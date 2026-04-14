// Custom hooks for enhanced UX and animations
import { useState, useEffect, useRef } from 'react';

// Hook for intersection observer animations
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
};

// Hook for staggered animations
export const useStaggeredAnimation = (items, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
    });
  }, [items, delay]);

  return visibleItems;
};

// Hook for smooth loading states
export const useSmoothedLoading = (isLoading, minLoadingTime = 500) => {
  const [smoothedLoading, setSmoothedLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setSmoothedLoading(true);
    } else {
      const timer = setTimeout(() => {
        setSmoothedLoading(false);
      }, minLoadingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  return smoothedLoading;
};

// Hook for typing effect
export const useTypingEffect = (text, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return displayedText;
};

// Hook for scroll-triggered animations
export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

// Hook for delayed visibility
export const useDelayedVisibility = (delay = 1000) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
};

// Hook for enhanced form validation with animations
export const useAnimatedValidation = (validationFn, value, delay = 300) => {
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!value) {
      setError('');
      setShowError(false);
      return;
    }

    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const validationError = validationFn(value);
      setError(validationError);
      setIsValidating(false);
      
      if (validationError) {
        setTimeout(() => setShowError(true), 50);
      } else {
        setShowError(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, validationFn, delay]);

  return { error, isValidating, showError };
};

export default {
  useIntersectionObserver,
  useStaggeredAnimation,
  useSmoothedLoading,
  useTypingEffect,
  useScrollAnimation,
  useDelayedVisibility,
  useAnimatedValidation
};