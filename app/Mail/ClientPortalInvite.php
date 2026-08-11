<?php

namespace App\Mail;

use App\Models\ClientKey;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientPortalInvite extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ClientKey $clientKey,
        public string $clientName,
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your client portal invitation',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.client-portal-invite',
            with: [
                'clientName' => $this->clientName,
                'inviteUrl' => url('/client/invite?key=' . $this->clientKey->key),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
