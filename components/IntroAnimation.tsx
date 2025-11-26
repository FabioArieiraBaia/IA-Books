import React, { useEffect, useState, useMemo } from 'react';

interface FloatingBook {
  id: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  color: string;
  delay: number;
  duration: number;
}

export const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  // Generate random books only once
  const books = useMemo<FloatingBook[]>(() => {
    const colors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#6366f1', '#1e1b4b', '#ffffff'];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 120, // -60vw to 60vw
      y: (Math.random() - 0.5) * 120, // -60vh to 60vh
      z: -200 - Math.random() * 800, // Background depth (-200px to -1000px)
      rotX: (Math.random() - 0.5) * 45,
      rotY: (Math.random() - 0.5) * 45,
      rotZ: (Math.random() - 0.5) * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 10 + Math.random() * 10,
    }));
  }, []);

  useEffect(() => {
    // Sequence
    const t1 = setTimeout(() => setStage(1), 100);  // Start
    const t2 = setTimeout(() => setStage(2), 3000); // Fade Text
    const t3 = setTimeout(() => setStage(3), 4500); // Fade Out Scene
    const t4 = setTimeout(() => onComplete(), 5500); // Unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      perspective: '1000px', // Enable 3D space
      overflow: 'hidden',
      opacity: stage === 3 ? 0 : 1,
      transition: 'opacity 1s ease-in-out',
    }}>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes spinSlow {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
        `}
      </style>

      {/* 3D Scene Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        opacity: stage >= 1 ? 1 : 0,
        transition: 'opacity 1.5s ease-out',
      }}>
        
        {/* Floating Books Layer (Background) */}
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140px', // Book width
              height: '200px', // Book height
              backgroundColor: book.color,
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              // Combine static random position with dynamic float animation
              transform: `translate3d(calc(-50% + ${book.x}vw), calc(-50% + ${book.y}vh), ${book.z}px) rotateX(${book.rotX}deg) rotateY(${book.rotY}deg) rotateZ(${book.rotZ}deg)`,
              opacity: 0.6,
              // Add a subtle individual float animation
              animation: `float ${book.duration}s ease-in-out infinite`,
              animationDelay: `${book.delay}s`,
            }}
          >
            {/* Book Spine Detail (simple line to give context) */}
            <div style={{
              position: 'absolute',
              left: '10px',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }} />
          </div>
        ))}

        {/* Content Layer (Foreground) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translateZ(100px)', // Bring closer to camera
        }}>
           {/* Logo */}
           <div style={{
             color: '#ffffff',
             fontSize: '5rem',
             fontWeight: '800',
             fontFamily: 'Inter, sans-serif',
             letterSpacing: '-4px',
             textShadow: '0 20px 50px rgba(0,0,0,0.5)',
             marginBottom: '1rem',
             transform: stage >= 1 ? 'scale(1)' : 'scale(0.8)',
             transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
           }}>
             IA BOOKS
           </div>
           
           {/* URL */}
           <div style={{
             color: '#60a5fa',
             fontSize: '1.2rem',
             fontWeight: '300',
             letterSpacing: '4px',
             fontFamily: 'monospace',
             opacity: stage >= 2 ? 1 : 0,
             transform: stage >= 2 ? 'translateY(0)' : 'translateY(20px)',
             transition: 'all 1s ease',
           }}>
             iabooks.com.br
           </div>
        </div>
      </div>
    </div>
  );
};