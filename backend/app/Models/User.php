<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\NewAccessToken;

/**
 * @property Role $role
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Die Rolle ist bewusst nicht fillable, damit sich niemand bei der Registrierung selbst hochstuft.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => Role::Employee->value,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
        ];
    }

    /**
     * Bearer-Token mit den Abilities der Rolle; läuft nach `sanctum.expiration` Minuten ab.
     */
    public function issueApiToken(string $name): NewAccessToken
    {
        $expiration = config('sanctum.expiration');

        return $this->createToken(
            $name,
            $this->role->abilities(),
            $expiration ? now()->addMinutes($expiration) : null,
        );
    }
}
