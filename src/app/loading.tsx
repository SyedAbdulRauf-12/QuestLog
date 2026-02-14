"use client";

import Image from 'next/image';

export default function Loading() {
  return (
    /* Changed bg-black to a deep dark red */
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2f0d0d]">
      <style>{`
        @keyframes zoomInOut {
          0% { 
            transform: scale(1);
            opacity: 0; 
          }
          20% {
            opacity: 1;
          }
          50% { 
            transform: scale(1.3); 
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-logo {
          animation: zoomInOut 2s ease-in-out infinite;
          transform-origin: center;
        }

        .mosaic-text {
          margin-top: 30px;
          color: white;
          font-family: serif;
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          opacity: 0.9;
          /* Added a subtle red glow to the text to match the new background */
          text-shadow: 0 0 20px rgb(255, 128, 0);
          margin-left: 0.5em;
        }
      `}</style>

      {/* The Logo Wrapper */}
      <div className="animate-logo">
        <Image 
          src="/QuestLog_Logo.png" 
          alt="QuestLog Logo"
          width={220} 
          height={220}
          priority
          className="object-contain"
        />
      </div>

      {/* The Required Text */}
      <p className="mosaic-text">
        Questlog
      </p>
    </div>
  );
}