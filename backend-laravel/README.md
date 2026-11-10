# IDLSender — Production Laravel 11 + MySQL Backend Architecture

This directory contains the production-grade Laravel 11 backend architecture, database migrations, Sanctum authentication, Redis Queues, Reverb WebSockets, and Eloquent models for IDLSender.

## Architectural Stack
* **Framework**: Laravel 11 (PHP 8.3+)
* **Database**: MySQL 8.0+ (Normalized with multi-tenant `organization_id` foreign keys and compound indexes)
* **Authentication**: Laravel Sanctum (Token-based API authentication for Web & Android App)
* **Asynchronous Jobs**: Redis + Laravel Queues (`high`, `verification`, `campaign_dispatch`, `default`)
* **Real-time WebSockets**: Laravel Reverb (Pushing live verification ticks, open/click notifications, and campaign logs)
* **AI Engine**: Google Gemini API via server-side HTTP client (`gemini-3.8-flash`)

## Core Database Schema & Migrations
1. `0001_01_01_000000_create_organizations_table.php` (Multi-tenancy isolation)
2. `0001_01_01_000001_create_users_table.php` (Sanctum auth, roles: Owner, Admin, Member)
3. `0001_01_01_000002_create_leads_table.php` (Lead finder, verified email, confidence score, firmographics)
4. `0001_01_01_000003_create_email_verifications_table.php` (7-tier validation logs: syntax, mx, smtp, catch-all)
5. `0001_01_01_000004_create_campaigns_and_workflows_table.php` (Drip sequences, visual automation nodes, delays)
6. `0001_01_01_000005_create_sales_deals_table.php` (CRM pipeline, deals, values, probabilities)
7. `0001_01_01_000006_create_credits_and_subscriptions_table.php` (Finder & verification credits, Stripe billing)

## REST API Endpoints Specification
* `POST /api/v1/auth/login` — Sanctum token issue
* `GET  /api/v1/leads` — Query paginated leads by industry, revenue, region
* `POST /api/v1/verify` — Single multi-factor email verification
* `POST /api/v1/verify/bulk` — Queue bulk CSV verification job
* `POST /api/v1/domain-search` — Domain executive and email pattern resolution
* `POST /api/v1/campaigns` — Create and trigger automated drip sequence
* `POST /api/v1/ai/generate-email` — Gemini 3.8 Flash cold copywriter proxy
