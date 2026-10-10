<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Demo-Konten der fiktiven Agentur, je eins pro Rolle (Passwort: "password")
        User::factory()->admin()->create([
            'name' => 'Anna Admin',
            'email' => 'admin@teambrain.test',
        ]);

        User::factory()->collectionAdmin()->create([
            'name' => 'Henrik HR',
            'email' => 'hr@teambrain.test',
        ]);

        User::factory()->create([
            'name' => 'Erik Employee',
            'email' => 'employee@teambrain.test',
        ]);
    }
}
