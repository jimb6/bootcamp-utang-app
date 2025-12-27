# UTANG APP

A loan management application built with Ionic Vue that allows both financiers and borrowers to manage loan contracts, payments, and offers.

## Features

### Financier POV (Tig Pa-Utang)
- **Borrowers Management**: Add, edit, and manage borrower information
- **Contract Management**: Create and track loan contracts with interest rates and terms
- **Payment Recording**: Record payments and automatically update contract balances
- **Offer Creation**: Create loan offers for borrowers

### Borrower POV (Pala-Utang)
- **View Contracts**: See all active and completed loan contracts
- **Track Payments**: View payment history and receipts
- **View Offers**: Review pending and previous loan offers
- **Balance Tracking**: Monitor remaining balance on all contracts

## Project Structure

```
src/
├── types/              # TypeScript interfaces and types
│   └── index.ts        # Borrower, Contract, Payment, Offer types
├── composables/        # Vue composables
│   └── useUtangStore.ts # Data management and state handling
├── views/
│   ├── RoleSelectionPage.vue      # Landing page
│   ├── financier/                  # Financier views
│   │   ├── FinancierTabsPage.vue
│   │   ├── BorrowersPage.vue
│   │   ├── ContractsPage.vue
│   │   ├── PaymentsPage.vue
│   │   └── OffersPage.vue
│   └── borrower/                   # Borrower views
│       ├── BorrowerTabsPage.vue
│       ├── BorrowerContractsPage.vue
│       ├── BorrowerPaymentsPage.vue
│       └── BorrowerOffersPage.vue
└── router/             # Vue Router configuration
    └── index.ts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Access the app at http://localhost:5173

### Build
```bash
npm run build
```

## How to Use

### For Financiers
1. Select "Financier" role on the landing page
2. Add borrowers with their information
3. Create loan contracts specifying amount, interest rate, and term
4. Record payments as borrowers make them
5. Create loan offers for borrowers

### For Borrowers
1. Select "Borrower" role on the landing page
2. Choose your profile from the list
3. View your contracts and remaining balances
4. Track all payment history
5. Review and accept/decline loan offers

## Data Storage

All data is stored locally in the browser's localStorage. This includes:
- Borrower profiles
- Loan contracts
- Payment records
- Loan offers
- User session data

## Tech Stack

- **Ionic Framework**: Cross-platform UI components
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Ionicons**: Icon library

## License

This project is for educational and demonstration purposes.
