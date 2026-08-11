<?php

namespace App\Http\Controllers;

use App\Models\ClientKey;
use Illuminate\Http\Request;

class ClientInviteController extends Controller
{
    public function accept(Request $request)
    {
        $key = $request->query('key');

        if (! $key) {
            abort(403, 'Missing client invitation key.');
        }

        $clientKey = ClientKey::where('key', $key)->first();

        if (! $clientKey) {
            abort(404, 'This client invitation is invalid.');
        }

        if ($clientKey->locked || $clientKey->used) {
            abort(403, 'This client invitation has already been used or is locked.');
        }

        return redirect()->route('login', ['client_key' => $key]);
    }
}
