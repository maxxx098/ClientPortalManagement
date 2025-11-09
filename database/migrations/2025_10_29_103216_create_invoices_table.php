<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_key_id')->constrained()->onDelete('cascade');

            $table->string('invoice_number')->unique();
            $table->string('reference_number')->nullable();
            
            $table->date('invoice_date');
            $table->date('due_date');
            $table->date('overdue_date')->nullable();

            // Financials
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);  // percentage, e.g., 12.5
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('amount', 10, 2)->default(0);

            // Other info
            $table->string('status')->default('unpaid');
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('payment_terms')->default('Net 30');

            // Items stored as JSON
            $table->json('items')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
