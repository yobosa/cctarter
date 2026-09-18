
import React, { useState, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InfographicLinesProps {
  origin: Point;
  targets: Point[];
  active: boolean;
}

const InfographicLines: React.FC<InfographicLinesProps> = ({ origin, targets, active }) => {
  if (!active) return null;

  return (
    <svg className="fixed inset-0 pointer-events-none z-10 w-full h-full">
      {targets.map((target, idx) => (
        <g key={idx}>
          <path
            d={`M ${origin.x} ${origin.y} C ${origin.x} ${(origin.y + target.y) / 2}, ${target.x} ${(origin.y + target.y) / 2}, ${target.x} ${target.y}`}
            className="infographic-line"
            style={{ 
              strokeDasharray: '1000', 
              strokeDashoffset: active ? '0' : '1000',
              opacity: active ? 0.6 : 0
            }}
          />
          <circle cx={target.x} cy={target.y} r="3" fill="#D4AF37" className="animate-pulse" />
        </g>
      ))}
    </svg>
  );
};

export default InfographicLines;
