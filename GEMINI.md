# Project: localstock.io

## Project Overview

This is a Next.js application that functions as a local stock checker for holiday deals. Users can search for products and see a list of stores nearby that have the product in stock. The application is built with Next.js, React, TypeScript, and styled with Tailwind CSS and Radix UI.

The main page (`app/page.tsx`) features a search bar. The search results are displayed on a separate page (`app/search/pages.tsx`), which currently uses mock data. The search results page also includes a placeholder for a map component that would presumably show the location of the stores.

The application also has a feature to get the user's current location to personalize the search results. This is implemented in `lib/location-utils.ts`.

## Building and Running

To get the development server running, use the following command:

```bash
npm run dev
```

To create a production build, use:

```bash
npm run build
```

To start the production server, use:

```bash
npm run start
```

## Development Conventions

*   **TypeScript:** The project is written in TypeScript.
*   **Linting:** ESLint is used for linting. You can run the linter with `npm run lint`.
*   **Styling:** The project uses Tailwind CSS for styling, along with Radix UI for some components.
*   **File Naming:** The search results page is currently located at `app/search/pages.tsx`. This is unconventional for a Next.js App Router application. It is recommended to rename this file to `app/search/page.tsx` to follow the standard convention.
