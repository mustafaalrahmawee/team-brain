<?php

use App\Enums\Role;
use App\Models\User;

it('registers an employee and returns a bearer token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Erika Muster',
        'email' => 'Erika@Example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.user.email', 'erika@example.com')
        ->assertJsonPath('data.user.role', 'employee')
        ->assertJsonStructure(['data' => ['token', 'expires_at', 'user' => ['id', 'name', 'email', 'role']]]);

    $user = User::firstWhere('email', 'erika@example.com');
    expect($user->role)->toBe(Role::Employee)
        ->and($user->tokens()->first()->abilities)->toBe(['chat']);

    $this->withToken($response->json('data.token'))
        ->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
});

it('ignores a role sent during registration', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Mallory',
        'email' => 'mallory@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'role' => 'admin',
    ])->assertCreated()->assertJsonPath('data.user.role', 'employee');
});

it('validates the registration data', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name' => '',
        'email' => 'TAKEN@example.com',
        'password' => 'short',
        'password_confirmation' => 'different',
    ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
});
