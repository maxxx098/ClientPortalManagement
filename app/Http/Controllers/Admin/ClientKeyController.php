<?php 

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClientKey;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ClientKeyController extends Controller
{
    public function index()
    {
        $keys = ClientKey::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/clientkey/index', [
            'keys' => $keys
        ]);
    }

    public function store()
    {
        $key = Str::uuid()->toString();

        $clientKey = ClientKey::create([
            'key' => $key,
            'used' => false,
        ]);

        return redirect()->route('client-keys.index')->with('success', 'Client key generated!');
    }

    public function markUsed($id)
    {
        $clientKey = ClientKey::findOrFail($id);
        $clientKey->used = true;
        $clientKey->save();

        return redirect()->route('client-keys.index')->with('success', 'Client key marked as used!');
    }
    
    public function destroy($id)
    {
        $clientKey = ClientKey::findOrFail($id);
        $clientKey->delete();

        return redirect()->route('client-keys.index')->with('success', 'Client key deleted!');
    }
}