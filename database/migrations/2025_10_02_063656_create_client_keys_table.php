<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('client_keys', function (Blueprint $table) {
            $table->id();
            $table->boolean('locked')->default(false);
            $table->timestamp('locked_at')->nullable();
            $table->string('key')->unique();
            $table->boolean('used')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_keys');
    }
};

