# Chat App

A modern chat application with OTP authentication built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Phone number authentication with OTP verification
- Real-time chat interface
- Responsive design with mobile support
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API service running (default: http://localhost:8000)

### Environment Setup

1. Copy the example environment file:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

2. Edit `.env.local` to configure your environment variables:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

Change this to match your API server URL.

### Installation

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### Development

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm start
# or
yarn build
yarn start
\`\`\`

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and helpers
- `/hooks` - Custom React hooks
- `/public` - Static assets

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
