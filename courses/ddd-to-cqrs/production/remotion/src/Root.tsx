import React from 'react';
import { Composition } from 'remotion';
import { EventStormDemo } from './compositions/EventStormDemo';
import { ContextMapDemo } from './compositions/ContextMapDemo';
import { CQRSArchitecture } from './compositions/CQRSArchitecture';
import { CommandQueryFlow } from './compositions/CommandQueryFlow';
import { AggregateLifecycle } from './compositions/AggregateLifecycle';
import { CourseRoadmap } from './compositions/CourseRoadmap';

/*
Composition	Duration	Description
CourseRoadmap	30s (900 frames)	Course introduction roadmap with 6 module nodes
EventStormDemo	15s (450 frames)	Event Storming with Sales, Payment, Fulfillment contexts
ContextMapDemo	12s (360 frames)	Context mapping with Upstream/Downstream/Partnership relationships
CQRSArchitecture	15s (450 frames)	CQRS architecture with Command/Event Store/Query sides
CommandQueryFlow	18s (540 frames)	Detailed command and query flow through the system
AggregateLifecycle	20s (600 frames)	Aggregate lifecycle: Creation, State Change, Invariant Protection
All animations share consistent design patterns:
*/

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Course Introduction: Roadmap Animation */}
      <Composition id="CourseRoadmap" component={CourseRoadmap} durationInFrames={900} fps={30} width={1920} height={1080} />

      {/* Module 1, Lesson 4: Event Storm Demo */}
      <Composition id="EventStormDemo" component={EventStormDemo} durationInFrames={450} fps={30} width={1920} height={1080} />

      {/* Module 1: Context Map Demo */}
      <Composition id="ContextMapDemo" component={ContextMapDemo} durationInFrames={360} fps={30} width={1920} height={1080} />

      {/* Module 2: CQRS Architecture Overview */}
      <Composition id="CQRSArchitecture" component={CQRSArchitecture} durationInFrames={450} fps={30} width={1920} height={1080} />

      {/* Module 2: Command & Query Flow */}
      <Composition id="CommandQueryFlow" component={CommandQueryFlow} durationInFrames={540} fps={30} width={1920} height={1080} />

      {/* Module 1: Aggregate Lifecycle */}
      <Composition id="AggregateLifecycle" component={AggregateLifecycle} durationInFrames={600} fps={30} width={1920} height={1080} />
    </>
  );
};
