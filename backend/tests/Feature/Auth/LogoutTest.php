<?php

use App\Models\User;

it('revokes only the token used for logout', function () {
    $user = User::factory()->create();
    $token = $user->issueApiToken('spa')->plainTextToken;
    $otherToken = $user->issueApiToken('cli')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

    expect($user->tokens()->pluck('name')->all())->toBe(['cli']);

    // Der Guard merkt sich den User innerhalb eines Tests; für den nächsten Request zurücksetzen
    $this->app['auth']->forgetGuards();

    $this->withToken($token)->getJson('/api/v1/user')->assertUnauthorized();
    $this->withToken($otherToken)->getJson('/api/v1/user')->assertOk();
});

it('requires a token to log out', function () {
    $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
});
