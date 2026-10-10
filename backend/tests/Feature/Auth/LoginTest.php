<?php

use App\Models\User;

it('logs in with valid credentials and returns a token with the abilities of the role', function () {
    $user = User::factory()->collectionAdmin()->create(['email' => 'hr@example.com']);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'HR@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.role', 'collection_admin');

    $token = $user->tokens()->first();
    expect($token->abilities)->toBe(['chat', 'documents:upload'])
        ->and($token->expires_at)->not->toBeNull();
});

it('rejects wrong credentials without revealing whether the email exists', function (string $email) {
    User::factory()->create(['email' => 'known@example.com']);

    $this->postJson('/api/v1/auth/login', [
        'email' => $email,
        'password' => 'wrong-password',
    ])->assertUnprocessable()->assertJsonValidationErrors(['email' => __('auth.failed')]);
})->with(['known@example.com', 'unknown@example.com']);

it('throttles repeated login attempts', function () {
    User::factory()->create(['email' => 'known@example.com']);

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/auth/login', ['email' => 'known@example.com', 'password' => 'wrong'])
            ->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', ['email' => 'known@example.com', 'password' => 'password'])
        ->assertTooManyRequests();
});

it('rejects an expired token', function () {
    $user = User::factory()->create();
    $token = $user->issueApiToken('spa')->plainTextToken;

    $this->travel(config('sanctum.expiration') + 1)->minutes();

    $this->withToken($token)->getJson('/api/v1/user')->assertUnauthorized();
});

it('requires a token for the user endpoint', function () {
    $this->getJson('/api/v1/user')->assertUnauthorized();
});
