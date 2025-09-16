Buyer Lead Intake App
A comprehensive lead management system for real estate professionals to capture, organize, and track buyer leads efficiently.
🚀 Live Demo
View Live App (Replace with your actual Vercel URL)
📋 Features
Core Functionality

✅ Lead Management: Create, view, edit, and delete buyer leads
✅ Advanced Filtering: Filter by city, property type, status, timeline
✅ Real-time Search: Debounced search across name, phone, and email
✅ Pagination: Server-side pagination with URL sync
✅ CSV Import/Export: Bulk import with validation and filtered export
✅ Lead History: Track all changes with detailed audit trail
✅ Status Quick Actions: Update lead status directly from the list view

Technical Features

✅ Concurrency Control: Optimistic locking to prevent data conflicts
✅ Ownership Security: Users can only edit their own leads
✅ Form Validation: Client and server-side validation with Zod
✅ Responsive Design: Mobile-first responsive UI

🛠 Tech Stack

Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
Backend: Next.js API Routes, Drizzle ORM
Database: PostgreSQL (Supabase)
Authentication: Supabase Auth (Magic Link)
Validation: Zod schemas
UI Components: Shadcn/ui, Lucide React
Deployment: Vercel

📊 Data Model
buyers table
sql- id (uuid, primary key)
- fullName (varchar, 2-80 chars, required)
- email (varchar, optional, valid email)
- phone (varchar, 10-15 digits, required)
- city (enum: Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- propertyType (enum: Apartment|Villa|Plot|Office|Retail)
- bhk (enum: 1|2|3|4|Studio, conditional on property type)
- purpose (enum: Buy|Rent)
- budgetMin (integer, INR, optional)
- budgetMax (integer, INR, optional, must be ≥ budgetMin)
- timeline (enum: 0-3m|3-6m|>6m|Exploring)
- source (enum: Website|Referral|Walk-in|Call|Other)
- status (enum: New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- notes (text, ≤1000 chars, optional)
- tags (text array, optional)
- ownerId (uuid, references auth.users)
- createdAt (timestamp)
- updatedAt (timestamp)
buyer_history table
sql- id (uuid, primary key)
- buyerId (uuid, references buyers.id)
- changedBy (uuid, references auth.users)
- changedAt (timestamp)
- diff (jsonb, contains field changes)
🚀 Getting Started
Prerequisites

Node.js 18+
npm or yarn
Supabase account

Installation

Clone the repository

bashgit clone https://github.com/your-username/buyer-lead-intake
cd buyer-lead-intake

Install dependencies

bashnpm install
# or
yarn install

Set up environment variables

bashcp .env.example .env.local
Fill in your environment variables:
env# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mjyemcdtwkzctakwpoia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeWVtY2R0d2t6Y3Rha3dwb2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODI3MTUsImV4cCI6MjA3MzI1ODcxNX0.ugaQN4FVjnAgEJk3HMpD6vrMOek8e8eCQGqEwwLjsbY
DATABASE_URL=postgresql://postgres.mjyemcdtwkzctakwpoia:DS1997shetty@!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Database
DATABASE_URL=your_supabase_postgres_url

Set up the database

bash# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Optional: Seed with sample data
npm run db:seed

Configure Supabase Authentication

Go to your Supabase dashboard
Navigate to Authentication > Settings
Enable Email authentication
Configure your site URL and redirect URLs


Run the development server

bashnpm run dev
# or
yarn dev
Open http://localhost:3000 to view the app.
Database Commands
bash# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (careful!)
npm run db:reset

# View database in Drizzle Studio
npm run db:studio
📱 Application Flow
1. Authentication (/login)

Magic link authentication via Supabase
Automatic redirect to leads dashboard after login

2. Lead Creation (/buyers/new)

Comprehensive form with conditional fields
Real-time validation (client + server)
BHK field appears only for Apartment/Villa properties
Budget validation ensures max ≥ min

3. Leads Dashboard (/buyers)

Server-side rendering with pagination
URL-synced filters: All filters persist in URL
Debounced search: 500ms delay, searches name/phone/email
Status quick actions: Update status directly from table
Responsive design: Table on desktop, cards on mobile

4. Lead Details (/buyers/[id])

View complete lead information
Edit with same validation as creation
Concurrency protection: Prevents conflicting edits
Change history: Last 10 changes with details
Ownership enforcement: Users can only edit their own leads

5. CSV Import/Export

Import: Validate and import up to 200 leads
Export: Downloads filtered/searched results as CSV
Error handling: Detailed validation errors with row numbers

🔒 Security Features
Rate Limiting

Create operations: 5 requests per minute per user/IP
Update operations: 10 requests per minute per user/IP
Standard HTTP 429 responses with retry headers

Access Control

Read: All authenticated users can view all leads
Write: Users can only modify their own leads (ownerId check)
Admin override: Ready for admin role implementation

Data Validation

Client-side: Immediate feedback with Zod
Server-side: All endpoints validate with same schemas
Enum validation: Strict enum checking prevents invalid data

🎨 UI/UX Features
Responsive Design

Desktop: Full-featured table with sorting and actions
Mobile: Card-based layout optimized for touch
Tablet: Adaptive layout switching

Accessibility

Keyboard navigation: Full keyboard support
Screen readers: Proper ARIA labels and announcements
Form validation: Clear error messages and field associations
Color contrast: WCAG AA compliant colors

User Experience

Loading states: Skeleton loaders and spinners
Empty states: Helpful guidance when no data
Toast notifications: Success/error feedback
Optimistic updates: Immediate UI feedback

📦 Project Structure
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── buyers/        # Lead management endpoints
│   ├── buyers/            # Lead management pages
│   └── login/             # Authentication pages
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── drizzle/              # Database schema and migrations
├── lib/                  # Utility functions and configs
│   ├── supabase/         # Supabase client configuration
│   └── rateLimiter.ts    # Rate limiting implementation
└── helpers/              # Application helpers
    └── enumHelper.ts     # Enum parsing utilities
🧪 Testing
Currently implemented:

Input validation testing: Zod schema validation
Rate limiting testing: Basic rate limit functionality

To run tests:
bashnpm run test
# or
yarn test
🚧 Implementation Notes
Design Decisions

Server-Side Rendering: Chosen for better SEO and initial page load performance
URL State Management: All filters/search persist in URL for bookmarking and sharing
Optimistic Updates: Status changes update UI immediately for better UX
Enum-based Architecture: Strict enums prevent data inconsistency
History Tracking: Complete audit trail for lead changes

Validation Strategy

Single source of truth: Zod schemas shared between client/server
Progressive enhancement: Works without JavaScript
Real-time feedback: Client-side validation for immediate feedback

Performance Optimizations

Debounced search: Prevents excessive API calls
Server-side pagination: Handles large datasets efficiently
Selective field updates: Only changed fields tracked in history

✅ Completed Features

 Lead CRUD operations
 Advanced filtering and search
 CSV import with validation
 CSV export with current filters
 Lead change history
 Rate limiting
 Concurrency control
 Responsive design
 Status quick actions
 Magic link authentication
 Server-side rendering
 URL state persistence

🎯 Future Enhancements

 Tag system with typeahead
 File upload for attachments
 Advanced full-text search
 Email notifications
 Lead scoring system
 Dashboard analytics
 Mobile app
 API documentation

🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙋‍♂️ Support
If you have any questions or need help, please:

Open an issue on GitHub
Contact: [your-email@example.com]


Built with ❤️ using Next.js, Supabase, and TypeScript