/**
 * Reusable Custom Hooks for FilaZero
 * Performance-optimized hooks with proper cleanup
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Animated counter hook with easing
 * @param {number} end - Target number to count to
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before starting in ms
 * @param {boolean} trigger - Whether to start the animation
 * @returns {number} - Current animated value
 */
export const useCountUp = (end, duration = 2000, delay = 0, trigger = true) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!trigger) return;

        const timeout = setTimeout(() => {
            let start = 0;
            const step = end / (duration / 16);
            const timer = setInterval(() => {
                start += step;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }, delay);

        return () => clearTimeout(timeout);
    }, [end, duration, delay, trigger]);

    return count;
};

/**
 * Intersection Observer hook for scroll reveal animations
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {[React.RefObject, boolean]} - Ref to attach and visibility state
 */
export const useInView = (threshold = 0.1) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [threshold]);

    return [ref, isInView];
};

/**
 * Debounced value hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

/**
 * LocalStorage hook with JSON serialization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if not found
 * @returns {[any, Function]} - State value and setter
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

/**
 * Previous value hook
 * @param {any} value - Current value
 * @returns {any} - Previous value
 */
export const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};

/**
 * Media query hook
 * @param {string} query - Media query string
 * @returns {boolean} - Whether query matches
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

/**
 * Interval hook with automatic cleanup
 * @param {Function} callback - Function to call
 * @param {number|null} delay - Interval delay (null to pause)
 */
export const useInterval = (callback, delay) => {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
};
