import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexTextProps {
  text: string;
  className?: string;
}

const LatexText: React.FC<LatexTextProps> = ({ text, className = '' }) => {
  const htmlContent = useMemo(() => {
    if (!text) return '';
    
    // Replace block math $$...$$
    let parsed = text.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // Replace inline math $...$
    parsed = parsed.replace(/\$(.*?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    return parsed;
  }, [text]);

  return (
    <span 
      className={className} 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default LatexText;
