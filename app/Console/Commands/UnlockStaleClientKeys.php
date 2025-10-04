<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ClientKey;

class UnlockStaleClientKeys extends Command
{
    protected $signature = 'client-keys:unlock-stale';
    protected $description = 'Unlock client keys that have been locked for more than 30 minutes';

    public function handle()
    {
        $count = ClientKey::where('locked', true)
            ->where('locked_at', '<', now()->subMinutes(30))
            ->update(['locked' => false, 'locked_at' => null]);

        $this->info("Unlocked {$count} stale client keys.");
    }
}

