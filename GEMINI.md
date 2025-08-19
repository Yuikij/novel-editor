# GEMINI.md - AI Novel Editor

## Project Overview

This is an AI-powered novel editing and creation platform built with Next.js, TypeScript, and Tailwind CSS. It provides a comprehensive set of tools for writers, including character management, world-building, plot analysis, and an AI-assisted writing editor. The application is designed to streamline the creative process, from initial idea to final draft.

The frontend is built with React and Next.js, utilizing Shadcn UI for components and D3.js for data visualization (e.g., character relationships). Zod is used for schema validation. The backend is a set of APIs that handle data persistence for projects, chapters, characters, and other entities.

## Building and Running

To get the project running locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the development server at `http://localhost:3000`.

3.  **Build for Production:**
    ```bash
    npm run build
    ```

4.  **Start Production Server:**
    ```bash
    npm run start
    ```

5.  **Linting:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling, with some custom components in `app/components/ui`.
*   **State Management:** State is managed primarily through React Hooks (`useState`, `useEffect`, etc.).
*   **API Interaction:** API calls are organized in the `app/lib/api` directory, with separate files for each data entity (e.g., `project.ts`, `chapter.ts`).
*   **Types:** TypeScript types are defined in `app/types/index.ts`.
*   **Internationalization (i18n):** The application supports multiple languages using a custom `LanguageProvider` and translation files in `app/lib/i18n`.
*   **Component Structure:** UI components are located in `app/components/ui`, while more complex, feature-specific components are in `app/components/novel-editor`.
*   **Routing:** The application uses the Next.js App Router, with pages and layouts defined in the `app` directory.
