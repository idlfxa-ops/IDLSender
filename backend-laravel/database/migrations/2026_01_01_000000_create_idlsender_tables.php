<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Comprehensive Normalized Multi-Tenant Schema for IDLSender (MySQL 8.0+)
     */
    public function up(): void
    {
        // 1. Organizations (Multi-Tenancy Root)
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('plan')->default('starter'); // starter, pro, ultra, enterprise
            $table->integer('finder_credits_balance')->default(1000);
            $table->integer('verification_credits_balance')->default(2000);
            $table->string('stripe_customer_id')->nullable()->index();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // 2. Users & Sanctum Authentication
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['owner', 'admin', 'member', 'viewer'])->default('member');
            $table->rememberToken();
            $table->timestamps();

            $table->index(['organization_id', 'role']);
        });

        // 3. Leads (Prospects from Lead Finder & Domain Search)
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('email')->index();
            $table->enum('email_status', ['valid', 'risky', 'catch_all', 'invalid', 'unverified'])->default('unverified');
            $table->unsignedTinyInteger('confidence_score')->default(0); // 0-100%
            $table->string('job_title')->nullable();
            $table->string('company_name')->nullable()->index();
            $table->string('company_domain')->nullable()->index();
            $table->string('industry')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('stage')->default('cold'); // cold, contacted, engaged, replied, won, unsubscribed
            $table->decimal('deal_value', 12, 2)->nullable();
            $table->json('custom_attributes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'email_status']);
            $table->index(['organization_id', 'stage']);
        });

        // 4. Email Verifications (Audit trail for single & bulk checks)
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('email')->index();
            $table->enum('status', ['valid', 'risky', 'catch_all', 'invalid']);
            $table->unsignedTinyInteger('score')->default(0);
            $table->boolean('check_syntax')->default(true);
            $table->boolean('check_domain')->default(true);
            $table->boolean('check_mx')->default(false);
            $table->boolean('check_smtp')->default(false);
            $table->boolean('check_disposable')->default(false);
            $table->boolean('check_catch_all')->default(false);
            $table->boolean('check_free_provider')->default(false);
            $table->string('failure_reason')->nullable();
            $table->string('batch_id')->nullable()->index();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
        });

        // 5. Campaigns & Drip Sequences
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('subject');
            $table->longText('html_content');
            $table->longText('plain_text_content')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'paused', 'completed'])->default('draft');
            $table->unsignedInteger('recipients_count')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('delivered_count')->default(0);
            $table->unsignedInteger('opened_count')->default(0);
            $table->unsignedInteger('clicked_count')->default(0);
            $table->unsignedInteger('replied_count')->default(0);
            $table->unsignedInteger('bounced_count')->default(0);
            $table->unsignedInteger('unsubscribed_count')->default(0);
            $table->json('automation_workflow_nodes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 6. Sales Deals (CRM Pipeline)
        Schema::create('deals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignUuid('lead_id')->nullable()->constrained('leads')->onDelete('set null');
            $table->string('title');
            $table->decimal('value', 14, 2)->default(0.00);
            $table->enum('stage', ['lead_in', 'contact_made', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'])->default('lead_in');
            $table->unsignedTinyInteger('probability')->default(20);
            $table->date('expected_close_date')->nullable();
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['organization_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('email_verifications');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('users');
        Schema::dropIfExists('organizations');
    }
};
