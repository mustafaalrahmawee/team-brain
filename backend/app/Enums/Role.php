<?php

namespace App\Enums;

enum Role: string
{
    case Employee = 'employee';
    case CollectionAdmin = 'collection_admin';
    case Admin = 'admin';

    /**
     * Sanctum-Abilities, die ein Token dieser Rolle erhält.
     *
     * @return list<string>
     */
    public function abilities(): array
    {
        return match ($this) {
            self::Employee => ['chat'],
            self::CollectionAdmin => ['chat', 'documents:upload'],
            self::Admin => ['chat', 'documents:upload', 'admin'],
        };
    }
}
