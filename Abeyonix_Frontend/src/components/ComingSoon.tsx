import React, { useState, useEffect } from 'react';

const ComingSoon = () => {
  const [showText, setShowText] = useState(false);
  const [droneCrashed, setDroneCrashed] = useState(false);

  useEffect(() => {
    // Timeline for animations
    const crashTimer = setTimeout(() => {
      // Drone crashes after 2.5 seconds
      setDroneCrashed(true);
    }, 2500);
    
    const showTextTimer = setTimeout(() => {
      // Show "Coming Soon" text after 3 seconds
      setShowText(true);
    }, 3000);

    return () => {
      clearTimeout(crashTimer);
      clearTimeout(showTextTimer);
    };
  }, []);

  return (
    <div className="relative h-screen max-h-[600px] bg-gradient-to-b from-sky-200 to-sky-400 overflow-hidden">
      {/* Clouds for atmosphere */}
      <div className="absolute top-10 left-10 w-24 h-12 bg-white rounded-full opacity-80"></div>
      <div className="absolute top-20 right-20 w-32 h-16 bg-white rounded-full opacity-70"></div>
      <div className="absolute top-32 left-1/4 w-28 h-14 bg-white rounded-full opacity-75"></div>
      
      {/* Drone Image */}
      <div 
        className={`absolute z-10 ${droneCrashed ? 'drone-crash' : 'drone-fly'}`}
        style={{
          top: droneCrashed ? '60%' : '20%',
          left: droneCrashed ? '50%' : 'auto',
          transform: droneCrashed ? 'translateX(-50%) rotate(45deg)' : 'translateX(0) rotate(0deg)',
        }}
      >
        <img 
          src="https://web.moxcreative.com/fleanec/wp-content/uploads/sites/11/2023/02/pngegg.png" 
          alt="Drone" 
          className="w-32 h-32 object-contain"
        />
      </div>
      
      {/* Crash effect */}
      {droneCrashed && (
        <div 
          className="absolute z-20"
          style={{
            bottom: '30%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="explosion"></div>
        </div>
      )}
      
      {/* Coming Soon Text */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <h1 className="text-5xl md:text-7xl font-bold text-white coming-soon-text">
            Coming Soon
          </h1>
        </div>
      )}
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-green-400 rounded-t-full"></div>
      
      <style>{`
        @keyframes fly-in {
          0% {
            left: -100px;
            transform: translateY(0) rotate(0deg);
          }
          70% {
            left: calc(50% - 40px);
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            left: calc(50% - 40px);
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes crash {
          0% {
            top: 20%;
            left: calc(50% - 40px);
            transform: translateX(0) rotate(0deg);
          }
          100% {
            top: 70%;
            left: calc(50% - 40px);
            transform: translateX(0) rotate(55deg);
          }
        }
        
        @keyframes explosion {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          50% {
            width: 150px;
            height: 150px;
            opacity: 0.8;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        @keyframes text-arrival {
          0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes bobble-shake {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-2deg);
          }
          50% {
            transform: translateY(0) rotate(2deg);
          }
          75% {
            transform: translateY(-5px) rotate(-1deg);
          }
        }
        
        .drone-fly {
          animation: fly-in 2.5s ease-in-out forwards;
        }
        
        .drone-crash {
          animation: crash 0.5s ease-in forwards;
        }
        
        .explosion {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #FF9800 0%, #FF5722 40%, transparent 70%);
          border-radius: 50%;
          animation: explosion 1s ease-out forwards;
        }
        
        .coming-soon-text {
          animation: text-arrival 1s ease-out forwards, bobble-shake 2s ease-in-out infinite 1s;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;