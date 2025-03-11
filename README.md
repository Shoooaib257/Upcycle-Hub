# Upcycle Hub

Upcycle Hub is a marketplace platform for buying and selling upcycled products, focused on sustainability and giving new life to materials that would otherwise go to waste.

## Features

- **Full E-commerce Functionality**: Product listings, cart, checkout process
- **Secure Payments**: Integrated with Stripe for secure payment processing
- **Advanced Search**: Filter products by category, price, and other attributes
- **Seller Dashboard**: Manage product listings and business details
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js with Express
- **Database**: In-memory database (can be extended to PostgreSQL)
- **Authentication**: Passport.js with session-based authentication
- **Payment Processing**: Stripe API integration
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, Zustand for client state

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Stripe account for payment processing

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/upcycle-hub.git
   cd upcycle-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: React components
  - `/src/pages`: Page components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and libraries
  - `/src/store`: State management

- `/server`: Backend Express application
  - `/routes.ts`: API routes
  - `/storage.ts`: Data storage and database access
  - `/index.ts`: Server entry point

- `/shared`: Shared TypeScript types and schemas
  - `/schema.ts`: Database schema definitions and types

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.