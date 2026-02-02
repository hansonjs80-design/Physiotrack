import React from 'react';
import { PortraitLayout } from './PortraitLayout';
import { LandscapeLayout } from './LandscapeLayout';
import { BedLayoutProps } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const BedLayoutContainer: React.FC<BedLayoutProps> = (props) => {
  // Use JS media query to conditional render. 
  // This prevents rendering double the amount of BedCards (Portrait + Landscape versions) in the DOM,
  // effectively halving the re-render cost of timers and state updates.
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return (
    <div className="w-full max-w-[1600px] mx-auto h-full px-2 sm:px-4">
      {isLandscape ? (
        <LandscapeLayout {...props} />
      ) : (
        <PortraitLayout {...props} />
      )}
    </div>
  );
};