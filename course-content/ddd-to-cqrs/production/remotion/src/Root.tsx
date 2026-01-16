import React from 'react';
import { Composition } from 'remotion';
import { EventStormDemo } from './compositions/EventStormDemo';
import { ContextMapDemo } from './compositions/ContextMapDemo';
import { CQRSArchitecture } from './compositions/CQRSArchitecture';
import { CommandQueryFlow } from './compositions/CommandQueryFlow';
import { AggregateLifecycle } from './compositions/AggregateLifecycle';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Module 1, Lesson 4: Event Storm Demo */}
      <Composition
        id="EventStormDemo"
        component={EventStormDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Module 1: Context Map Demo */}
      <Composition
        id="ContextMapDemo"
        component={ContextMapDemo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Module 2: CQRS Architecture Overview */}
      <Composition
        id="CQRSArchitecture"
        component={CQRSArchitecture}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Module 2: Command & Query Flow */}
      <Composition
        id="CommandQueryFlow"
        component={CommandQueryFlow}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Module 1: Aggregate Lifecycle */}
      <Composition
        id="AggregateLifecycle"
        component={AggregateLifecycle}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
