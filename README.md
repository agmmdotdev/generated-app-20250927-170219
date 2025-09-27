# Void Dasher

[cloudflarebutton]

A retro-themed, 2D top-down arcade space shooter where you pilot a ship, dodge asteroids, and destroy enemies to achieve a high score.

## About The Project

Void Dasher is a high-octane, retro-themed, 2D top-down arcade space shooter. The player controls a nimble starship navigating an endless, treacherous asteroid field while fending off waves of hostile alien craft. The core objective is survival and achieving the highest possible score.

The game features a distinct 90s visual aesthetic, characterized by neon vector graphics, pixel art explosions, a CRT scanline overlay, and a chiptune-inspired vibe. The difficulty dynamically increases over time, with enemies becoming faster and more numerous. The entire experience is contained within a single, immersive view, creating a focused, classic arcade gameplay loop.

### Key Features

*   **Classic Arcade Gameplay:** Fast-paced, top-down shooter action focused on survival and high scores.
*   **Retro 90s Aesthetics:** Neon vector graphics, CRT scanline effects, and pixelated explosions for a nostalgic feel.
*   **Dynamic Difficulty:** The game becomes progressively more challenging as you play, with faster and more numerous enemies.
*   **Simple & Responsive Controls:** Intuitive keyboard controls (WASD/Arrow Keys for movement, Spacebar to shoot) for immediate action.
*   **Endless Asteroid Field:** Navigate a procedurally generated environment, ensuring no two runs are the same.

## Technology Stack

This project is built with a modern, high-performance tech stack:

*   **Frontend:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/void-dasher.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd void-dasher
    ```
3.  Install dependencies:
    ```sh
    bun install
    ```

## Development

To run the application in development mode with hot-reloading:

```sh
bun run dev
```

This will start the Vite development server, typically available at `http://localhost:3000`.

## Building for Production

To create a production-ready build of the application:

```sh
bun run build
```

This command bundles the application into the `dist` directory, optimized for deployment.

## Deployment

This project is configured for seamless deployment to Cloudflare Pages.

### Deploy with Wrangler CLI

1.  Authenticate with your Cloudflare account:
    ```sh
    npx wrangler login
    ```
2.  Deploy the application:
    ```sh
    bun run deploy
    ```

This will build and deploy your application, making it available on a `.pages.dev` subdomain.

### Deploy with Git

Alternatively, you can connect your GitHub repository to Cloudflare Pages for automatic deployments on every push.

[cloudflarebutton]

## License

Distributed under the MIT License. See `LICENSE` for more information.