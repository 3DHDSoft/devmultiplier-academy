# DevMultiplier Academy

The official website for DevMultiplier Academy - helping developers become 10x-100x more effective in the age of AI.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Hosting:** Vercel
- **Course Platform:** Podia

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/3DHDSoft/devmultiplier-academy.git
cd devmultiplier-academy

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/
│   ├── contact/
│   ├── courses/
│   ├── pricing/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/            # Header, Footer
│   ├── sections/          # Page sections (Hero, Courses, etc.)
│   └── ui/                # Reusable UI components
└── lib/
    └── utils.ts           # Utility functions
```

## Brand Colors

| Color       | Hex       | Usage                |
|-------------|-----------|----------------------|
| Navy        | `#0A1628` | Primary, text        |
| Blue        | `#3B82F6` | Accent, CTAs         |
| Cyan        | `#06B6D4` | Secondary accent     |
| Slate       | `#64748B` | Secondary text       |
| Light Gray  | `#E2E8F0` | Borders, dividers    |
| Off White   | `#F8FAFC` | Backgrounds          |

## Deployment

The site auto-deploys to Vercel on push to the `main` branch.

### Custom Domain

1. Add `devmultiplier.com` in Vercel project settings
2. Update DNS in Cloudflare to point to Vercel

## License

© 2025 DevMultiplier Academy. A 3D HD Soft, LLC company. All rights reserved.
