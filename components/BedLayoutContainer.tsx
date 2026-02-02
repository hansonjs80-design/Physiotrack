import React from 'react';
import { PortraitLayout } from './PortraitLayout';
import { LandscapeLayout } from './LandscapeLayout';
import { BedLayoutProps } from '../types';

export const BedLayoutContainer: React.FC<BedLayoutProps> = (props) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto h-full px-2 sm:px-4">
      <PortraitLayout {...props} />
      <LandscapeLayout {...props} />
    </div>
  );
};