
import React from 'react';

const JusticeAILogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-lg">
        {/* Definições de Gradientes e Efeitos */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FDB931" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="aiBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Pilar Central da Balança (Base e Eixo) */}
        <rect x="96" y="25" width="8" height="70" rx="4" fill="url(#goldGradient)" />
        <rect x="98" y="30" width="4" height="60" rx="2" fill="white" fillOpacity="0.3" />
        <path d="M80 95 L120 95 L125 105 L75 105 Z" fill="url(#goldGradient)" />
        
        {/* Travessão Superior */}
        <path d="M45 45 Q100 35 155 45" stroke="url(#goldGradient)" strokeWidth="6" strokeLinecap="round" />

        {/* Pratos da Balança */}
        <path d="M25 75 Q45 85 65 75" stroke="url(#goldGradient)" strokeWidth="4" fill="none" />
        <path d="M135 75 Q155 85 175 75" stroke="url(#goldGradient)" strokeWidth="4" fill="none" />

        {/* Letras I e A - Reduzidas para dar destaque às cordas */}
        <g filter="url(#glow)">
          {/* Letra I - Prato Esquerdo (x=45) - Tamanho reduzido para 20 */}
          <text x="45" y="73" fill="url(#aiBlue)" fontSize="20" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">
            I
          </text>

          {/* Letra A - Prato Direito (x=155) - Tamanho reduzido para 20 */}
          <text x="155" y="73" fill="url(#aiBlue)" fontSize="20" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">
            A
          </text>
        </g>

        {/* Conexões de Dados / IA (As Cordas) - Desenhadas com maior contraste */}
        <g opacity="0.9">
          <path d="M45 45 L35 75 M45 45 L55 75" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M155 45 L145 75 M155 45 L165 75" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />
        </g>
        
        {/* Núcleo Central de Processamento */}
        <circle cx="100" cy="40" r="10" fill="#0F172A" stroke="url(#goldGradient)" strokeWidth="2" />
        <circle cx="100" cy="40" r="3" fill="#60A5FA">
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default JusticeAILogo;
