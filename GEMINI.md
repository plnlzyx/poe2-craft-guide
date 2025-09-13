# Project: POE2 Craft Guide

## Project Overview

This project is a web application for creating, sharing, and following crafting guides for the game Path of Exile 2. It is built using React, TypeScript, and styled-components. The application allows users to define complex crafting processes with steps, conditions, and branches, and then interactively execute these guides to see the outcome on a simulated item.

The core of the application is a system for managing and executing crafting guides. This system is defined in `src/utils/guideSystem.ts` and `src/utils/actionSystem.ts`. The data structures for items, guides, and actions are defined in `src/types/core.ts`.

The main components of the application are:

*   **GuideCreator**: A component for creating and editing crafting guides.
*   **GuideViewer**: A component for viewing and interactively executing crafting guides.
*   **GuideList**: A component for listing available crafting guides.
*   **ItemEditor**: A component for editing the properties of an item.

## Building and Running

To build and run this project, you need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm start
    ```
    This will start the application in development mode and open it in your browser at `http://localhost:3000`.

3.  **Run tests:**
    ```bash
    npm test
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

## Development Conventions

*   **Styling**: The project uses `styled-components` for styling. Components are styled in the same file where they are defined.
*   **State Management**: The application uses React's `useState` and `useEffect` hooks for state management. For more complex state, it uses a manager pattern (e.g., `GuideManager`, `ActionRegistryManager`).
*   **Types**: The project is written in TypeScript and defines its core data structures in `src/types/core.ts`.
*   **Routing**: The application uses `react-router-dom` for routing.
*   **Code Structure**: The code is organized into `components`, `types`, and `utils` directories.
*   **File Naming**: Components are named in PascalCase (e.g., `GuideCreator.tsx`).
