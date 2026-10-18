# Try AI Games

A curated gallery of AI games and interactive experiences, with short reviews and links to their creators. Built with React, TypeScript, and Tailwind CSS as a static single-page application.

## Requirements

Node.js 22.14 or later and npm.

## Getting started

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173 to view the site locally.

## Content

Project entries and categories are stored in `content/published.json`. Images are stored in `content/assets/`.

Each project includes its title, website URL, creator name and URL, publication date and time, categories, review, and separate desktop and mobile covers. Projects can include up to two additional gallery images. Every image requires alternative text.

Projects appear in descending publication order. The publication date controls sorting only; it does not schedule visibility.

## Development commands

```sh
npm run check    # Check TypeScript types
npm test         # Run unit tests
npm run build    # Create the production build
npm run preview  # Preview the production build locally
```

## Build and deployment

Run `npm run build` to generate the static site in `dist/`. Deploy the contents of this directory to any static hosting service.

For automated builds, use `npm run build` as the build command and `dist` as the output directory.

The scripts in `scripts/` are build tools and are not deployed. Only images referenced by published projects are included in the build. Asset paths are relative, allowing the site to be hosted at a domain root or in a subdirectory.

## Features and accessibility

- Live, case-insensitive search by project title or category.
- Searching selects **All**; selecting a category clears the search.
- Category filters appear when at least three categories have projects and are hidden on mobile.
- A three-column mobile gallery with square cover images.
- Review dialogs with internal scrolling, keyboard focus management, Escape and backdrop dismissal, and focus restoration when closed.
- Horizontally scrollable image thumbnails on mobile.
- External links that open in a new tab.
- Visible keyboard focus, semantic HTML, and image alternative text.

## Analytics

The site includes optional Google Analytics with visitor consent controls. See [analytics setup and verification](docs/analytics.md) for configuration and measured events.
