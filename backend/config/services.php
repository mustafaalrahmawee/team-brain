<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'base_url' => env('ANTHROPIC_BASE_URL'),
        // Einfache Fragen und Chat
        'default' => [
            'model' => env('ANTHROPIC_MODEL_DEFAULT', 'claude-haiku-5-5'),
            'effort' => env('ANTHROPIC_EFFORT_DEFAULT', 'low'),
        ],
        // Mehrstufige Suche mit Tool-Aufrufen (UC-09)
        'agent' => [
            'model' => env('ANTHROPIC_MODEL_AGENT', 'claude-sonnet-5-5'),
            'effort' => env('ANTHROPIC_EFFORT_AGENT', 'high'),
        ],
    ],

    // Eval-Richter: bewusst ein anderes Modell als der Agent, damit er sich nicht selbst bewertet
    'eval_judge' => [
        'key' => env('TEST_ANTHROPIC_API_KEY'),
        'base_url' => env('EVAL_JUDGE_BASE_URL', 'https://api.z.ai/api/anthropic'),
        'model' => env('EVAL_JUDGE_MODEL', 'glm-5.3'),
        'effort' => env('EVAL_JUDGE_EFFORT', 'high'),
    ],

    'voyage' => [
        'key' => env('VOYAGE_API_KEY'),
        'model' => env('VOYAGE_EMBEDDING_MODEL', 'voyage-3.5'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
