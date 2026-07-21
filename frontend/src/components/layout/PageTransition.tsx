import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export interface PageTransitionProps {
  children: React.ReactNode;
  id?: string;
  key?: string;
}

export default function PageTransition({ children, id }: PageTransitionProps) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: [0.215, 0.61, 0.355, 1], // Custom clean ease-out curve
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}
