/**
 * Card Scene E2E Tests - M1 Week 7-8
 * 
 * End-to-end tests for Card scene authoring workflow.
 * Tests complete user journeys from creation to editing to viewing.
 * 
 * Based on Spec 09: Card Scene Type
 * Based on Spec 17: Demo Script
 */

import { test, expect } from '@playwright/test';

test.describe('Card Scene Authoring E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to deck in author mode
    await page.goto('/author/deck/deck-1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  /**
   * Scenario 1: Create Text Slide
   * User: Creates a simple text slide with custom styling
   */
  test('should create and edit text slide', async ({ page }) => {
    // Step 1: Open Card scene
    await page.click('[data-scene-id="scene-1"]');
    await expect(page.locator('[data-scene-type="card"]')).toBeVisible();

    // Step 2: Right-click on blank space
    await page.click('[data-scene-type="card"]', { button: 'right' });
    await expect(page.locator('.card-context-menu')).toBeVisible();

    // Step 3: Click "Add Text Slide"
    await page.click('text=Add Text Slide');
    
    // Step 4: Verify new slide created
    await expect(page.locator('[data-slide-kind="text"]')).toBeVisible();

    // Step 5: Double-click to edit
    await page.dblclick('[data-slide-kind="text"]');
    await expect(page.locator('.inline-editor')).toBeVisible();

    // Step 6: Enter text
    await page.fill('.inline-editor__textarea', 'Welcome to Protogen!');
    await page.click('.inline-editor__button--save');

    // Step 7: Open property inspector
    await page.click('[data-slide-kind="text"]');
    await expect(page.locator('.property-inspector')).toBeVisible();

    // Step 8: Customize styling
    await page.fill('input[type="range"]', '48'); // Font size
    await page.selectOption('select', 'center'); // Alignment
    await page.fill('input[type="color"]', '#0066cc'); // Text color

    // Step 9: Verify preview generated
    await expect(page.locator('[data-slide-id] img.preview')).toBeVisible({ timeout: 5000 });

    // Step 10: Exit author mode
    await page.click('.mode-toggle');
    await expect(page.locator('.inline-editor')).not.toBeVisible();
    await expect(page.locator('.property-inspector')).not.toBeVisible();
  });

  /**
   * Scenario 2: Create Image Slide with Caption
   * User: Adds image slide and configures caption
   */
  test('should create image slide with caption', async ({ page }) => {
    // Step 1: Navigate to Card scene
    await page.goto('/author/deck/deck-1/scenes/scene-1');

    // Step 2: Add image slide
    await page.click('[data-scene-type="card"]', { button: 'right' });
    await page.click('text=Add Image Slide');

    // Step 3: Upload image (mock file upload)
    const fileInput = await page.locator('input[type="file"]');
    // await fileInput.setInputFiles('path/to/test-image.jpg');

    // Step 4: Open property inspector
    await page.click('[data-slide-kind="image"]');

    // Step 5: Enable caption
    await page.check('input[type="checkbox"]'); // Enable caption checkbox

    // Step 6: Configure caption
    await page.fill('input[placeholder*="Caption"]', 'Beautiful landscape');
    await page.selectOption('select', 'bottom');

    // Step 7: Adjust image fit
    await page.selectOption('select[name="fit"]', 'cover');

    // Step 8: Verify changes saved
    await expect(page.locator('.image-slide__caption')).toBeVisible();
  });

  /**
   * Scenario 3: Create Layered Slide with Text Animation
   * User: Creates layered slide with background image and animated text overlay
   */
  test('should create layered slide with text timing', async ({ page }) => {
    // Step 1: Navigate to Card scene
    await page.goto('/author/deck/deck-1/scenes/scene-1');

    // Step 2: Add layered slide
    await page.click('[data-scene-type="card"]', { button: 'right' });
    await page.click('text=Add Layered Slide');

    // Step 3: Configure background
    // Upload background image (mock)
    // await page.locator('input[type="file"]').setInputFiles('background.jpg');

    // Step 4: Add text overlay
    await page.click('[data-slide-kind="layered"]');
    await page.dblclick('.layered-slide__text-container');
    await page.fill('.inline-editor__textarea', 'Discover New Features');
    await page.click('.inline-editor__button--save');

    // Step 5: Configure text timing
    await page.fill('input[name="delay"]', '500');
    await page.fill('input[name="duration"]', '800');
    await page.selectOption('select[name="animation"]', 'fade');

    // Step 6: Adjust text position
    await page.selectOption('select[name="vertical"]', 'center');
    await page.selectOption('select[name="horizontal"]', 'center');

    // Step 7: Test animation (toggle preview)
    await page.click('.preview-toggle');
    
    // Verify text appears with delay
    await page.waitForTimeout(500);
    await expect(page.locator('.layered-slide__text--visible')).toBeVisible();
  });

  /**
   * Scenario 4: Navigate Between Slides
   * User: Uses ToC, Carousel, and keyboard to navigate between slides
   */
  test('should navigate between slides using multiple methods', async ({ page }) => {
    // Assume 3 slides exist
    await page.goto('/author/deck/deck-1/scenes/scene-1');

    // Method 1: ToC navigation
    await page.click('.toc-toggle');
    await expect(page.locator('.toc-drawer')).toBeVisible();
    await page.click('.toc-node[data-slide-id="slide-2"]');
    await expect(page.locator('[data-slide-id="slide-2"]')).toHaveClass(/current/);

    // Method 2: Carousel navigation
    await expect(page.locator('.preview-carousel')).toBeVisible();
    await page.click('.preview-carousel__item:nth-child(3)');
    await expect(page.locator('[data-slide-id="slide-3"]')).toHaveClass(/current/);

    // Method 3: Keyboard navigation
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-slide-id="slide-2"]')).toHaveClass(/current/);

    // Method 4: On-screen controls
    await page.click('.card-scene__nav--next');
    await expect(page.locator('[data-slide-id="slide-3"]')).toHaveClass(/current/);
  });

  /**
   * Scenario 5: Delete and Reorder Slides
   * User: Deletes a slide and reorders remaining slides
   */
  test('should delete and reorder slides', async ({ page }) => {
    await page.goto('/author/deck/deck-1/scenes/scene-1');

    // Step 1: Select slide to delete
    await page.click('[data-slide-id="slide-2"]');

    // Step 2: Open context menu and delete
    await page.click('[data-slide-id="slide-2"]', { button: 'right' });
    await page.click('text=Delete Slide');
    
    // Step 3: Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Step 4: Verify slide removed
    await expect(page.locator('[data-slide-id="slide-2"]')).not.toBeVisible();

    // Step 5: Drag slide to reorder (if drag-drop implemented)
    // await page.dragAndDrop('[data-slide-id="slide-3"]', '[data-slide-id="slide-1"]');

    // Step 6: Verify new order
    const slides = await page.locator('[data-slide-kind]').all();
    expect(slides.length).toBe(2); // One deleted

    // Step 7: Verify preview regenerated
    await expect(page.locator('.preview-carousel__item')).toHaveCount(2);
  });

  /**
   * Scenario 6: Complete Authoring Workflow
   * User: Complete workflow from create to save to view
   */
  test('should complete full authoring workflow', async ({ page }) => {
    // Step 1: Enter author mode
    await page.goto('/deck/deck-1/scenes/scene-1');
    await page.click('.mode-toggle');
    await expect(page.locator('.authoring-overlay')).toBeVisible();

    // Step 2: Create text slide
    await page.click('[data-scene-type="card"]', { button: 'right' });
    await page.click('text=Add Text Slide');

    // Step 3: Edit content
    await page.dblclick('[data-slide-kind="text"]');
    await page.fill('.inline-editor__textarea', 'New Content');
    await page.keyboard.press('Enter'); // Save with Enter

    // Step 4: Customize in inspector
    await page.click('[data-slide-kind="text"]');
    await page.fill('input[type="range"]', '36');

    // Step 5: Verify preview generated
    await page.waitForSelector('.toc-node__thumbnail img', { timeout: 3000 });

    // Step 6: Save changes (auto-save)
    // No explicit save needed with auto-save

    // Step 7: Exit author mode
    await page.click('.mode-toggle');

    // Step 8: Verify viewing mode
    await expect(page.locator('.authoring-overlay')).not.toBeVisible();
    await expect(page.locator('.property-inspector')).not.toBeVisible();

    // Step 9: Verify content persisted
    await expect(page.locator('[data-slide-kind="text"]')).toContainText('New Content');
  });
});

