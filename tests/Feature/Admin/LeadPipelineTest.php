<?php

namespace Tests\Feature\Admin;

use App\Models\ClientKey;
use App\Models\Lead;
use App\Models\OnboardingSession;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadPipelineTest extends TestCase
{
    use RefreshDatabase;

    protected function makeAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'is_admin' => true,
        ]);
    }

    public function test_admin_can_convert_a_lead_into_an_onboarding_session(): void
    {
        $this->actingAs($this->makeAdmin());

        $lead = Lead::create([
            'name' => 'Alicia Reed',
            'email' => 'alicia@example.com',
            'company_name' => 'Northwind Studio',
            'source' => 'Referral',
            'budget' => '$2,500',
            'urgency' => 'High',
            'notes' => 'Needs a landing page package.',
        ]);

        $response = $this->post(route('admin.leads.convert', $lead));

        $response->assertRedirect(route('admin.leads.show', $lead));
        $this->assertDatabaseHas('client_keys', ['email' => 'alicia@example.com']);
        $this->assertDatabaseHas('onboarding_sessions', ['lead_id' => $lead->id, 'status' => 'in_progress']);
    }

    public function test_accepting_a_proposal_creates_a_contract(): void
    {
        $this->actingAs($this->makeAdmin());

        $lead = Lead::create([
            'name' => 'Marcus Lee',
            'email' => 'marcus@example.com',
            'company_name' => 'Signal Works',
            'source' => 'Website',
            'status' => 'qualified',
        ]);

        $proposal = Proposal::create([
            'lead_id' => $lead->id,
            'title' => 'Brand refresh scope',
            'total' => 4500,
            'status' => 'sent',
            'scope' => 'Full design sprint',
        ]);

        $response = $this->post(route('admin.proposals.accept', $proposal));

        $response->assertRedirect();
        $this->assertDatabaseHas('proposals', ['id' => $proposal->id, 'status' => 'accepted']);
        $this->assertDatabaseHas('contracts', ['proposal_id' => $proposal->id, 'status' => 'draft']);
    }

    public function test_onboarding_completion_creates_project_and_kickoff_date(): void
    {
        $this->actingAs($this->makeAdmin());

        $client = ClientKey::create([
            'key' => 'client-123',
            'locked' => false,
            'used' => false,
            'name' => 'Atlas Studio',
            'email' => 'hello@atlasstudio.dev',
        ]);

        OnboardingSession::create([
            'client_key_id' => $client->key,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $response = $this->post(route('admin.onboarding.complete', $client));

        $response->assertRedirect();
        $this->assertDatabaseHas('onboarding_sessions', [
            'client_key_id' => $client->key,
            'status' => 'completed',
        ]);
        $this->assertDatabaseHas('projects', [
            'client_key_id' => $client->key,
            'name' => 'Atlas Studio onboarding project',
        ]);
        $this->assertNotNull(OnboardingSession::where('client_key_id', $client->key)->value('kickoff_date'));
    }
}
