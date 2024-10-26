import React, { useEffect } from 'react';

const HitCounter = () => {
  useEffect(() => {
    // Load the external script when the component mounts
    const script = document.createElement('script');
    script.src = 'https://www.powr.io/powr.js?platform=html';
    script.async = true;
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div className="powr-hit-counter" id="7df26aef_1729951868"></div>;
};

export default HitCounter;
