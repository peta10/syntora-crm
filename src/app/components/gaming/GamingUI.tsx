'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { useGaming } from '@/app/contexts/GamingContext';

export const GamingUI: React.FC = () => {
  const {
    confettiParticles,
    completionParticles,
    showLevelUp,
    showAchievement,
    level,
  } = useGaming();

  return (
    <>
      {/* Custom confetti particles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiParticles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.isSpecial ? 'animate-bounce' : ''}`}
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}ms`,
              animationDuration: `${particle.duration}ms`,
              animationName: 'confettiFall',
              animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              animationFillMode: 'forwards',
              transform: `rotate(${particle.rotation}deg)`,
              boxShadow: `0 0 8px ${particle.color}60`
            }}
          />
        ))}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(100px) rotate(360deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(120vh) translateX(200px) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
      `}</style>

      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E86FF]/5 via-transparent to-[#FF6BBA]/5" />
        {completionParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '1000ms'
            }}
          />
        ))}
      </div>

      {/* Achievement notification */}
      {showAchievement && (
        <div className="fixed top-8 right-8 z-50 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/50 animate-in slide-in-from-right duration-500">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-200" />
            <div>
              <h3 className="font-bold text-yellow-100">{showAchievement.title}</h3>
              <p className="text-yellow-200 text-sm">{showAchievement.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Level up notification */}
      {showLevelUp && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-xl p-6 border border-purple-400/50 animate-in slide-in-from-top duration-500">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-bold text-white text-xl">Level Up!</h3>
              <p className="text-purple-200">You reached Level {level}!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 