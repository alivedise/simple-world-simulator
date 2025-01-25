# Ecosystem Simulator

A web-based ecosystem simulator that simulates the behavior and interactions of organisms in specific environments.

## Purpose

Using complex data to test and explore the performance of frontend frameworks.
This simulation deliberately avoids using Canvas for map rendering, instead using HTML to test framework performance.

## Feature Overview

### 1. World System

- Randomly generated terrain maps
- Support for multiple terrain types (grasslands, forests, deserts, etc.)
- Day-night cycle system
- Visualized hexagonal grid map

### 2. Resource System

- Multiple resource types (food, water, minerals, etc.)
- Automatic resource regeneration
- Resource quantity visualization
- Resource interaction mechanisms
- Resource distribution based on terrain characteristics

### 3. Organism System

#### 3.1 Species Characteristics

- Unique attributes for different species
- Customizable basic attributes (health, energy, hunger, etc.)
- Terrain adaptability
- Resource requirement preferences
- Special abilities and traits

#### 3.2 Vital Signs

- Health status
- Energy system
- Hunger mechanism
- Status effects

#### 3.3 Behavior System

- Autonomous decision-making system
- Environmental awareness
- Resource seeking
- Movement behavior
- Rest mechanism
- Resource interaction

### 4. Performance Optimization

- FPS monitoring
- Entity management system
- Game loop optimization
- Resource management optimization

### 5. User Interface

- Real-time status display
- Interactive controls
- Organism status visualization
- Resource status visualization
- Performance monitoring display

## Technical Specifications

### Core Systems

- Game loop system
- Entity management system
- Resource management system
- Time system

### Component System

- World map component
- Organism component
- Resource component
- FPS counter component
- Time display component

### Extensibility

- Expandable species definition system
- Modular behavior system
- Configurable resource system
- Customizable terrain generation

## Future Plans

### Short-term Goals

1. Improve organism behavior system
2. Add more species
3. Enhance resource interaction mechanisms
4. Optimize performance
5. Move data updates to web workers

### Medium-term Goals

1. Add organism reproduction system
2. Implement organism evolution
3. Add weather system
4. Expand terrain effects

### Long-term Goals

1. Implement a relatively complete ecosystem
2. Add user intervention mechanisms
3. Add data analysis functionality
4. Support custom scenarios

## Tech Stack

- TypeScript
- Lit Element
- Web Components
- HTML5 Canvas

## Development Guide

1. Clone repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build production version: `npm run build`
 