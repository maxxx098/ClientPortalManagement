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
        $keys = ClientKey::withCount('projects')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/clientkey/index', [
            'keys' => $keys
        ]);
    }


    public function store()
    {
        $key = \Illuminate\Support\Str::uuid()->toString();

        $clientKey = ClientKey::create([
            'key' => $key,
            'locked' => false,
        ]);

        return redirect()->route('admin.client-keys.index')->with('success', 'Client key generated!');
    
    }

    public function markLocked($id)
    {
        $clientKey = ClientKey::findOrFail($id);
        $clientKey->update([
            'locked' => true,
            'locked_at' => now(),
        ]);

        return redirect()->route('admin.client-keys.index')->with('success', 'Client key locked!');
    
    }

    public function unlock($id)
    {
        $clientKey = ClientKey::findOrFail($id);
        $clientKey->update([
            'locked' => false,
            'locked_at' => null,
        ]);

        return redirect()->route('admin.client-keys.index')->with('success', 'Client key unlocked!');
    
    }

        
        public function destroy($id)
        {
            $clientKey = ClientKey::findOrFail($id);
            $projectCount = $clientKey->projects()->count();

            // If the key is linked to projects — return flash error
            if ($projectCount > 0) {
                return redirect()->route('admin.client-keys.index')->with([
                    'error' => [
                        'title' => 'Cannot Delete Client Key',
                        'description' => "This client key has {$projectCount} project(s) linked to it. Please reassign or delete the projects first."
                    ]
                ]);
            }

            // Otherwise, delete the key
            $clientKey->delete();

            return redirect()->route('admin.client-keys.index')->with([
                'success' => [
                    'title' => 'Deleted Successfully',
                    'description' => 'Client key deleted successfully!'
                ]
            ]);
        }


    public function list()
    {
        $keys = ClientKey::orderBy('created_at', 'desc')->get(['id', 'key']);
        return response()->json($keys);
    }
}