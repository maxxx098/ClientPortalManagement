<x-mail::message>
# Hello {{ $clientName }},

Your client portal is ready.

Click below to access your workspace and begin onboarding.

<x-mail::button :url="$inviteUrl">
Open client portal
</x-mail::button>

This link is secure and will take you directly to your client dashboard.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
