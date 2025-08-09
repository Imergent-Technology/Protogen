<?php

require_once __DIR__ . '/api/vendor/autoload.php';

use Laravel\Socialite\Facades\Socialite;

// Test OAuth configuration
echo "Testing OAuth Configuration...\n\n";

// Check if Socialite is available
if (class_exists('Laravel\Socialite\Facades\Socialite')) {
    echo "✅ Laravel Socialite is installed\n";
} else {
    echo "❌ Laravel Socialite is not installed\n";
}

// Test OAuth providers configuration
$providers = ['google', 'facebook', 'instagram'];

foreach ($providers as $provider) {
    try {
        $config = config("services.{$provider}");
        if ($config && isset($config['client_id']) && isset($config['client_secret'])) {
            echo "✅ {$provider} OAuth configuration found\n";
        } else {
            echo "⚠️  {$provider} OAuth configuration incomplete (missing credentials)\n";
        }
    } catch (Exception $e) {
        echo "❌ {$provider} OAuth configuration error: " . $e->getMessage() . "\n";
    }
}

echo "\nOAuth Setup Test Complete!\n";
echo "\nNext Steps:\n";
echo "1. Configure OAuth provider credentials in api/.env\n";
echo "2. Start the Docker containers\n";
echo "3. Test OAuth flows in the UI\n";
