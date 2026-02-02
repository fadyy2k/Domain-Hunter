# Contributing to DomainHunter

Thank you for your interest in contributing to DomainHunter! We welcome contributions from the community to help make this open-source project even better.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/Domain-Hunter.git
    cd Domain-Hunter
    ```
3.  **Install dependencies**:
    ```bash
    npm ci
    ```
4.  **Set up environment variables**:
    Copy `.env.example` to `.env` and configure it (see README for details).
5.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Development Workflow

-   **Branching**: Create a new branch for your feature or bug fix (e.g., `feature/new-generator`, `fix/rdap-parsing`).
-   **Commits**: Use conventional commits (e.g., `feat: add new naming strategy`, `fix: resolve sse timeout`).
-   **Linting**: Ensure your code passes linting before pushing:
    ```bash
    npm run lint
    ```
-   **Testing**: Run tests if applicable (we use Vitest/Playwright).

## Pull Request Process

1.  Ensure your code builds successfully: `npm run build`.
2.  Open a Pull Request against the `main` branch.
3.  Provide a clear description of your changes and link any relevant issues.
4.  Wait for review and address any feedback.

## Code Style

-   We use **TypeScript** in strict mode.
-   Styling is done with **Tailwind CSS**.
-   UI components are built with **shadcn/ui**.
-   Prefer functional components and hooks.

We look forward to your contributions!
