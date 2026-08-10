<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->uuid('client_key_id')->nullable();
            $table->foreign('client_key_id')->references('key')->on('client_keys')->nullOnDelete();
            $table->string('title');
            $table->decimal('total', 10, 2)->default(0);
            $table->string('status')->default('draft');
            $table->date('valid_until')->nullable();
            $table->longText('scope')->nullable();
            $table->longText('terms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
