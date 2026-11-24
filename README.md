# SortingVisualizer.com

An interactive sorting visualizer built to make algorithms easier to understand through motion, color, and user control.

SortingVisualizer.com lets users explore how sorting algorithms behave in real time by adjusting array size, speed, and playback controls while watching the algorithm work step by step. The goal of this project is not just to show a final sorted result, but to help users understand *how* the algorithm gets there.

## Live Site

[SortingVisualizer.com](https://sortingvisualizer.com)

## Overview

This project was built as a hands-on way to strengthen my understanding of algorithms, front-end development, and interactive system design. Instead of learning sorting only from textbook examples or static diagrams, I wanted to create a tool that makes the process visual, dynamic, and easier to follow.

The visualizer focuses on clarity and user experience. Users can choose an algorithm, generate arrays, control playback speed, pause execution, step through the process, and observe how values move through comparisons and swaps.

## Features

- Interactive sorting visualization
- Multiple algorithm selection support
- Adjustable array size
- Adjustable animation speed
- Play and pause controls
- Step-through execution
- Sound toggle
- Real-time visual feedback for active comparisons
- Highlighting for sorted elements
- Dark, minimal UI designed for focus and readability

## Tech Stack

- **React**
- **TypeScript**
- **CSS**
- **JavaScript runtime and package manager**: npm, yarn, or pnpm

## Why I Built It

I built this project to deepen my understanding of computer science fundamentals while also improving my front-end engineering skills.

This project helped me practice:

- translating algorithm logic into visual behavior
- managing UI state during live execution
- building reusable components
- improving debugging and performance
- designing an experience that is both educational and interactive

It also gave me a stronger appreciation for how important visualization can be when learning technical concepts.

## How It Works

At a high level, the app:

1. Generates an array of values
2. Renders each value as a visual bar
3. Runs the selected sorting algorithm
4. Animates comparisons, swaps, and sorted states
5. Updates the UI in real time based on user controls

The visualization is designed to make algorithm behavior easier to follow by clearly separating inactive elements from active comparisons and completed positions.

## Local Development

```bash
git clone https://github.com/ArtyomSimitian/sorting-visualizer.git
cd sorting-visualizer
npm install
npm run dev
```

Then open http://localhost:5173.

To build for production:

```bash
npm run build
npm run preview
```
