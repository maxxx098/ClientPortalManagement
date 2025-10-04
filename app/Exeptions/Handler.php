<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);

        // Handle 403 Forbidden errors with custom Inertia page
        if ($response->status() === 403 && $request->expectsJson() === false) {
            return Inertia::render('errors/403', [
                'status' => 403,
                'message' => $e->getMessage() ?: 'Access denied. Admin privileges required.'
            ])
            ->toResponse($request)
            ->setStatusCode(403);
        }

        // Handle other HTTP errors
        if (in_array($response->status(), [404, 500, 503]) && $request->expectsJson() === false) {
            return Inertia::render('errors/' . $response->status(), [
                'status' => $response->status()
            ])
            ->toResponse($request)
            ->setStatusCode($response->status());
        }

        return $response;
    }
}