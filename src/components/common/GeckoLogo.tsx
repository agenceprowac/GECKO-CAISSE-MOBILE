import React from 'react';

/**
 * Logo Gecko SVG adapté aux couleurs de l'application (bleu primaire #3B82F6 sur fond sombre).
 * Correspond au logo officiel de Gecko (gecko avec queue formant le G).
 */
interface GeckoLogoProps {
  size?: number;
  className?: string;
  /** Si true, affiche uniquement l'icône sans le texte "GECKO" */
  iconOnly?: boolean;
}

export const GeckoLogo: React.FC<GeckoLogoProps> = ({ size = 32, className = '', iconOnly = false }) => {
  if (iconOnly) {
    // Version icône seule (utilisée dans la Sidebar, etc.)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Queue formant le G */}
        <path
          d="M 30 60 C 15 60 5 50 5 38 C 5 22 18 12 32 12 C 43 12 50 20 50 28 L 40 28 C 40 24 37 20 32 20 C 22 20 13 28 13 38 C 13 44 18 50 30 50 L 30 43 L 45 43 L 45 60 Z"
          fill="#3B82F6"
        />
        {/* Corps principal */}
        <ellipse cx="62" cy="38" rx="20" ry="12" fill="#3B82F6" transform="rotate(-20 62 38)" />
        {/* Tête */}
        <ellipse cx="82" cy="24" rx="12" ry="9" fill="#3B82F6" transform="rotate(-25 82 24)" />
        {/* Oeil */}
        <circle cx="86" cy="21" r="3" fill="white" />
        <circle cx="87" cy="20.5" r="1.5" fill="#1E293B" />
        {/* Patte avant gauche */}
        <path d="M 55 35 C 48 28 44 20 42 14" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="40.5" cy="11" r="2.5" fill="#3B82F6" />
        <circle cx="43.5" cy="8" r="2.5" fill="#3B82F6" />
        <circle cx="47" cy="10" r="2.5" fill="#3B82F6" />
        {/* Patte avant droite */}
        <path d="M 68 33 C 71 22 76 16 80 10" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="77.5" cy="7.5" r="2.5" fill="#3B82F6" />
        <circle cx="81" cy="5" r="2.5" fill="#3B82F6" />
        <circle cx="84" cy="9" r="2.5" fill="#3B82F6" />
        {/* Patte arrière gauche */}
        <path d="M 52 48 C 44 52 37 60 33 68" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="30.5" cy="71" r="2.5" fill="#3B82F6" />
        <circle cx="34" cy="74.5" r="2.5" fill="#3B82F6" />
        <circle cx="37" cy="71" r="2.5" fill="#3B82F6" />
        {/* Patte arrière droite */}
        <path d="M 65 50 C 65 60 67 68 70 76" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="67.5" cy="79" r="2.5" fill="#3B82F6" />
        <circle cx="71.5" cy="82" r="2.5" fill="#3B82F6" />
        <circle cx="75" cy="78" r="2.5" fill="#3B82F6" />
      </svg>
    );
  }

  // Version avec texte "GECKO"
  return (
    <svg
      width={size * 3.5}
      height={size}
      viewBox="0 0 350 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Queue formant le G */}
      <path
        d="M 30 60 C 15 60 5 50 5 38 C 5 22 18 12 32 12 C 43 12 50 20 50 28 L 40 28 C 40 24 37 20 32 20 C 22 20 13 28 13 38 C 13 44 18 50 30 50 L 30 43 L 45 43 L 45 60 Z"
        fill="#3B82F6"
      />
      {/* Corps principal */}
      <ellipse cx="62" cy="38" rx="20" ry="12" fill="#3B82F6" transform="rotate(-20 62 38)" />
      {/* Tête */}
      <ellipse cx="82" cy="24" rx="12" ry="9" fill="#3B82F6" transform="rotate(-25 82 24)" />
      {/* Oeil */}
      <circle cx="86" cy="21" r="3" fill="white" />
      <circle cx="87" cy="20.5" r="1.5" fill="#1E293B" />
      {/* Pattes avant gauche */}
      <path d="M 55 35 C 48 28 44 20 42 14" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40.5" cy="11" r="2.5" fill="#3B82F6" />
      <circle cx="43.5" cy="8" r="2.5" fill="#3B82F6" />
      <circle cx="47" cy="10" r="2.5" fill="#3B82F6" />
      {/* Pattes avant droite */}
      <path d="M 68 33 C 71 22 76 16 80 10" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="77.5" cy="7.5" r="2.5" fill="#3B82F6" />
      <circle cx="81" cy="5" r="2.5" fill="#3B82F6" />
      <circle cx="84" cy="9" r="2.5" fill="#3B82F6" />
      {/* Pattes arrière gauche */}
      <path d="M 52 48 C 44 52 37 60 33 68" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="30.5" cy="71" r="2.5" fill="#3B82F6" />
      <circle cx="34" cy="74.5" r="2.5" fill="#3B82F6" />
      <circle cx="37" cy="71" r="2.5" fill="#3B82F6" />
      {/* Pattes arrière droite */}
      <path d="M 65 50 C 65 60 67 68 70 76" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="67.5" cy="79" r="2.5" fill="#3B82F6" />
      <circle cx="71.5" cy="82" r="2.5" fill="#3B82F6" />
      <circle cx="75" cy="78" r="2.5" fill="#3B82F6" />
      {/* Texte GECKO */}
      <text x="105" y="65" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="52" fontWeight="800" fill="white" letterSpacing="-1">
        GECKO
      </text>
    </svg>
  );
};
