<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * UUID v7 Generator
 * 
 * Generates time-ordered UUIDs following the UUID v7 specification (RFC 4122 draft).
 * 
 * Format (128 bits):
 * - 48 bits: Unix timestamp in milliseconds
 * - 12 bits: Sub-millisecond counter for ordering
 * - 2 bits: Version (0b111 = 7)
 * - 62 bits: Random data
 * 
 * Benefits over UUID v4:
 * - Time-ordered: Better for database B-tree indexes
 * - Sortable: Natural chronological ordering
 * - Cache-friendly: Better locality of reference
 * - Performance: Improved query performance in PostgreSQL
 * 
 * @see https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format
 */
class Uuid7
{
    /**
     * Counter for sub-millisecond ordering
     * Resets each millisecond
     */
    protected static int $counter = 0;
    
    /**
     * Last timestamp in milliseconds
     * Used to detect when to reset counter
     */
    protected static int $lastTimestamp = 0;
    
    /**
     * Generate a UUID v7
     * 
     * @return string UUID v7 in standard format (8-4-4-4-12)
     */
    public static function generate(): string
    {
        // Get current time in milliseconds
        $timestamp = self::getTimestampMillis();
        
        // Reset counter if new millisecond
        if ($timestamp !== self::$lastTimestamp) {
            self::$counter = 0;
            self::$lastTimestamp = $timestamp;
        } else {
            self::$counter++;
            
            // Prevent counter overflow (12 bits = 4096 values)
            if (self::$counter >= 4096) {
                // Wait for next millisecond
                usleep(100); // 0.1ms
                return self::generate(); // Retry
            }
        }
        
        // Build UUID components
        
        // 48-bit timestamp (milliseconds)
        $timestampHex = str_pad(dechex($timestamp), 12, '0', STR_PAD_LEFT);
        
        // 12-bit counter + 4-bit version
        // Version 7 = 0111 in binary
        $counterAndVersion = (self::$counter << 4) | 0x7;
        $counterHex = str_pad(dechex($counterAndVersion), 4, '0', STR_PAD_LEFT);
        
        // 62 bits of random data (8 bytes minus 2 bits for variant)
        $randomBytes = random_bytes(8);
        
        // Set variant bits (10xxxxxx for RFC 4122)
        $randomBytes[0] = chr((ord($randomBytes[0]) & 0x3F) | 0x80);
        
        $randomHex = bin2hex($randomBytes);
        
        // Assemble UUID: timestamp-counter-version-variant-random
        // Format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
        $uuid = sprintf(
            '%s-%s-%s-%s-%s',
            substr($timestampHex, 0, 8),  // 8 hex chars (32 bits)
            substr($timestampHex, 8, 4),  // 4 hex chars (16 bits)
            $counterHex,                   // 4 hex chars (12 bits counter + 4 bits version)
            substr($randomHex, 0, 4),     // 4 hex chars (16 bits, variant in first 2 bits)
            substr($randomHex, 4, 12)     // 12 hex chars (48 bits)
        );
        
        return $uuid;
    }
    
    /**
     * Generate multiple UUID v7s at once
     * Ensures proper ordering within the same millisecond
     * 
     * @param int $count Number of UUIDs to generate
     * @return array
     */
    public static function generateBatch(int $count): array
    {
        if ($count < 1 || $count > 4096) {
            throw new InvalidArgumentException('Batch count must be between 1 and 4096');
        }
        
        $uuids = [];
        for ($i = 0; $i < $count; $i++) {
            $uuids[] = self::generate();
        }
        
        return $uuids;
    }
    
    /**
     * Extract timestamp from UUID v7
     * 
     * @param string $uuid
     * @return int Timestamp in milliseconds
     */
    public static function getTimestamp(string $uuid): int
    {
        // Remove hyphens
        $hex = str_replace('-', '', $uuid);
        
        // Extract first 12 hex characters (48 bits = timestamp)
        $timestampHex = substr($hex, 0, 12);
        
        return hexdec($timestampHex);
    }
    
    /**
     * Extract timestamp as DateTime object
     * 
     * @param string $uuid
     * @return \DateTime
     */
    public static function getDateTime(string $uuid): \DateTime
    {
        $timestampMillis = self::getTimestamp($uuid);
        $timestampSeconds = $timestampMillis / 1000;
        
        return \DateTime::createFromFormat('U', (string) $timestampSeconds);
    }
    
    /**
     * Validate if string is a valid UUID v7
     * 
     * @param string $uuid
     * @return bool
     */
    public static function isValid(string $uuid): bool
    {
        // Check basic UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return false;
        }
        
        // Check version bits (should be 7)
        $version = hexdec(substr(str_replace('-', '', $uuid), 12, 1));
        if ($version !== 7) {
            return false;
        }
        
        // Check variant bits (should be 10xxxxxx)
        $variantByte = hexdec(substr(str_replace('-', '', $uuid), 16, 2));
        if (($variantByte & 0xC0) !== 0x80) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Convert UUID v4 to pseudo-UUID v7 format
     * (For backward compatibility - generates new UUID v7 with similar randomness)
     * 
     * @param string $uuidV4
     * @return string
     */
    public static function fromV4(string $uuidV4): string
    {
        // Generate new UUID v7 (cannot truly convert v4 to v7)
        // This is mainly for testing/compatibility purposes
        return self::generate();
    }
    
    /**
     * Get current timestamp in milliseconds
     * 
     * @return int
     */
    protected static function getTimestampMillis(): int
    {
        return (int) (microtime(true) * 1000);
    }
    
    /**
     * Reset counter (mainly for testing)
     * 
     * @return void
     */
    public static function resetCounter(): void
    {
        self::$counter = 0;
        self::$lastTimestamp = 0;
    }
}


