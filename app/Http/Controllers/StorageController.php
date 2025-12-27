<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class StorageController extends Controller
{
    public function serve($path)
    {
        $fullPath = storage_path('app/public/' . $path);
        
        Log::info('Storage request', [
            'path' => $path,
            'fullPath' => $fullPath,
            'exists' => File::exists($fullPath),
            'storage_public' => storage_path('app/public'),
        ]);
        
        if (!File::exists($fullPath)) {
            Log::error('File not found', ['fullPath' => $fullPath]);
            abort(404, 'File not found: ' . $path);
        }
        
        return response()->file($fullPath);
    }
}