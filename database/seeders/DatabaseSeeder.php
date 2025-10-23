<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get admin credentials from .env
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');
        $adminName = env('ADMIN_NAME', 'Administrator');

        // --- Safety check ---
        if (empty($adminEmail) || empty($adminPassword)) {
            throw new \Exception(
                "Admin credentials missing. Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file before seeding."
            );
        }

        // --- Create or update admin ---
        $admin = User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => Hash::make($adminPassword),
                'email_verified_at' => now(),
                'role' => 'admin',
                'is_admin' => true,
            ]
        );

        $this->command->info("Admin account ready: {$admin->email}");
    }
}
