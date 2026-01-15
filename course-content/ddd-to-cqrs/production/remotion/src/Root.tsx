import React from 'react';
import { Composition } from 'remotion';
import { EventStormDemo } from './compositions/EventStormDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Module 1, Lesson 4: Event Storm Demo */}
      <Composition
        id="EventStormDemo"
        component={EventStormDemo}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={3200}
        height={900}
      />

      {/* Add more compositions here as needed */}
      {/*
      <Composition
        id="ContextMapDemo"
        component={ContextMapDemo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      */}
    </>
  );
};
