# Spec 17: Integration Demo Script

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Validation Specification  
**Depends On**: All previous specs (00-16)

---

## Overview

This specification defines an end-to-end demo script to validate the authoring-viewing unification plan with mocks. The demo proves that all systems integrate correctly and the authoring experience flows smoothly.

**Purpose**: Validate the complete plan end-to-end before implementation begins.

---

## Demo Scenario

### Narrative

**Persona**: Alex, a content creator building an introduction deck for Protogen

**Goal**: Create a mixed-content deck with Card and Document scenes, demonstrating authoring capabilities

**Duration**: 5-7 minutes

**Systems Exercised**:
- Navigator (mode toggle, zoom, item navigation)
- Authoring (selection, editing, content creation)
- ToC (tree navigation, thumbnails)
- Preview Carousel (collection navigation)
- Context Menus (all action types)
- Preview Service (thumbnail generation)
- Scene Renderers (Card and Document)

---

## Demo Script

### Part 1: Setup & Enter Author Mode (1 min)

**Step 1.1**: Open Protogen portal
```
Action: Navigate to http://protogen.local:3000
Expected: Portal loads showing home scene
Screenshot: 01-portal-home.png
```

**Step 1.2**: Navigate to deck
```
Action: Click "Decks" → "Introduction to Protogen"
Expected: Deck overview loads showing scene cards
Screenshot: 02-deck-overview.png
```

**Step 1.3**: Enter author mode
```
Action: Click "Edit" button (or press Cmd/Ctrl+E)
Expected: 
  - Mode changes to "author"
  - Authoring controls appear
  - ToC drawer opens on left
  - Preview carousel appears in top toolbar
Screenshot: 03-author-mode.png
Verify: Mode indicator shows "Editing"
```

---

### Part 2: Edit Card Scene (2 min)

**Step 2.1**: Navigate to Card scene
```
Action: Click "Welcome" scene card in overview
Expected: Zoom to Welcome scene, showing 3 slides
Screenshot: 04-card-scene-zoom.png
Verify: Preview carousel shows 3 slides
```

**Step 2.2**: Select slide via carousel
```
Action: Click second thumbnail in preview carousel
Expected: Zoom to slide 2, selection highlight appears
Screenshot: 05-slide-selected.png
Verify: 
  - Blue outline around slide
  - Property inspector shows slide properties
  - ToC highlights current slide
```

**Step 2.3**: Edit slide text inline
```
Action: Double-click slide text (or press Enter)
Expected: Inline text editor appears
Screenshot: 06-inline-edit.png
Actions in editor:
  - Modify text: "Protogen is amazing!"
  - Press Cmd/Ctrl+S to save
Expected: Text updates, editor closes
Verify: 
  - Slide shows new text
  - Toast: "Changes saved"
```

**Step 2.4**: Add new layered slide
```
Action: Right-click blank space → "Add Layered Slide"
Expected: Layered slide wizard dialog opens
Screenshot: 07-layered-wizard.png
Actions in wizard:
  - Step 1: Upload background image (test-bg.jpg)
  - Step 2: Enter text "Join the Community"
  - Step 3: Set text position (center/center)
  - Step 4: Set timing (delay: 500ms, animation: fade)
  - Click "Create"
Expected: 
  - New slide created
  - Preview generated
  - Carousel now shows 4 slides
  - ToC updated
Screenshot: 08-slide-added.png
```

---

### Part 3: Navigate to Document Scene (1 min)

**Step 3.1**: Return to deck overview
```
Action: Click "Zoom Out" or press Escape twice
Expected: Return to deck overview
Screenshot: 09-back-to-overview.png
Verify: Welcome scene card shows updated preview
```

**Step 3.2**: Open Document scene
```
Action: Click "User Guide" scene card
Expected: Zoom to User Guide document scene
Screenshot: 10-document-scene.png
Verify:
  - ToC shows pages and headings
  - Preview carousel shows pages
```

---

### Part 4: Edit Document & Create Anchor (2 min)

**Step 4.1**: Navigate to page via ToC
```
Action: In ToC, expand "Getting Started" page → Click "Installation" heading
Expected: Page scrolls to Installation section
Screenshot: 11-toc-navigation.png
Verify: Installation heading is centered in viewport
```

**Step 4.2**: Add new paragraph block
```
Action: Right-click below heading → "Add Paragraph"
Expected: New paragraph block created with cursor focus
Screenshot: 12-add-paragraph.png
Actions:
  - Type: "To install Protogen, run: docker-compose up"
  - Press Enter
Expected: Paragraph saved
```

**Step 4.3**: Create code block
```
Action: Right-click → "Add Code Block"
Expected: Code block editor appears
Screenshot: 13-code-block.png
Actions:
  - Select language: "bash"
  - Enter code: "docker-compose up -d"
  - Click outside to save
Expected: Code block renders with syntax highlighting
```

**Step 4.4**: Create anchor and link
```
Action: Select text "docker-compose up"
Action: Right-click → "Create Anchor"
Expected: Anchor created, subtle indicator appears
Screenshot: 14-anchor-created.png

Action: Navigate to Introduction page (via ToC)
Action: Select text "installation steps"
Action: Right-click → "Link to Anchor..."
Expected: Anchor picker dialog opens
Screenshot: 15-anchor-picker.png
Actions:
  - Search: "docker"
  - Select: "docker-compose up" anchor
  - Click "Create Link"
Expected: Text becomes hyperlink
Screenshot: 16-link-created.png
```

---

### Part 5: Preview & Exit Author Mode (1 min)

**Step 5.1**: Verify previews updated
```
Action: Open ToC drawer
Expected: All thumbnails show current content
Screenshot: 17-updated-previews.png
Verify:
  - Welcome scene preview shows new slide
  - Document pages show updated content
```

**Step 5.2**: Test internal link
```
Action: Click "installation steps" link
Expected: Navigates to Installation page, scrolls to anchor
Screenshot: 18-link-navigation.png
Verify: "docker-compose up" text is highlighted temporarily
```

**Step 5.3**: Exit author mode
```
Action: Click "Done" button (or press Cmd/Ctrl+E)
Expected:
  - Mode changes to "view"
  - Authoring controls disappear
  - ToC drawer closes
  - Preview carousel disappears
  - Content remains visible
Screenshot: 19-view-mode.png
Verify: Mode indicator shows "Viewing"
```

---

## Success Criteria Checklist

### Navigation
- [ ] Deck overview loads correctly
- [ ] Zoom to scene works (animated)
- [ ] Zoom to slide/page works
- [ ] Zoom out returns to previous level
- [ ] Back button works (browser and in-app)

### Authoring Mode
- [ ] Toggle to author mode (button and shortcut)
- [ ] Authoring controls appear
- [ ] ToC drawer opens automatically
- [ ] Preview carousel appears (when applicable)
- [ ] Exit author mode removes controls

### Selection
- [ ] Click selects slide/block
- [ ] Selection highlight visible
- [ ] Property inspector shows selected item
- [ ] Deselect on blank space click
- [ ] Multi-select with Ctrl+Click (bonus)

### Editing
- [ ] Double-click starts inline edit
- [ ] Enter key starts edit
- [ ] Inline editor has focus
- [ ] Ctrl+S saves changes
- [ ] Escape cancels edit
- [ ] Changes reflected immediately

### Content Creation
- [ ] Add text slide via context menu
- [ ] Add layered slide via wizard
- [ ] Add paragraph via context menu
- [ ] Add code block via context menu
- [ ] All new content appears correctly

### Anchors & Links
- [ ] Create anchor from text selection
- [ ] Anchor indicator appears
- [ ] Link picker shows anchors
- [ ] Create link to anchor
- [ ] Link navigation works
- [ ] Anchor highlight on navigation

### Previews
- [ ] Thumbnails generate on save
- [ ] ToC shows thumbnails
- [ ] Carousel shows thumbnails
- [ ] Preview quality appropriate for size
- [ ] Previews update after edits

### ToC
- [ ] Tree structure correct (Deck → Scenes → Items)
- [ ] Expand/collapse works
- [ ] Click navigates correctly
- [ ] Current item highlighted
- [ ] Keyboard navigation works

### Carousel
- [ ] Shows when applicable (author mode, Card/Document)
- [ ] Current item highlighted
- [ ] Click navigates to item
- [ ] Arrow key navigation works
- [ ] Position indicator shows "N of M"

### Integration
- [ ] Navigator state syncs with ToC
- [ ] ToC syncs with carousel
- [ ] Previews update after edits
- [ ] Context menus show correct actions
- [ ] Property inspector shows correct fields
- [ ] Mode toggle affects all systems

---

## Mock Requirements

### Mock Data Needed

**Deck**:
```json
{
  "id": "deck-intro",
  "name": "Introduction to Protogen",
  "scenes": ["scene-welcome", "scene-guide"]
}
```

**Card Scene (Welcome)**:
```json
{
  "id": "scene-welcome",
  "name": "Welcome",
  "scene_type": "card",
  "slides": [
    { "id": "slide-1", "kind": "text", "text": "Welcome to Protogen" },
    { "id": "slide-2", "kind": "image", "imageAssetId": "asset-1" },
    { "id": "slide-3", "kind": "text", "text": "Let's get started" }
  ]
}
```

**Document Scene (User Guide)**:
```json
{
  "id": "scene-guide",
  "name": "User Guide",
  "scene_type": "document",
  "pages": [
    {
      "id": "page-intro",
      "title": "Introduction",
      "blocks": [
        { "type": "heading", "level": 1, "content": "Introduction" },
        { "type": "paragraph", "content": "Welcome to the guide..." }
      ]
    },
    {
      "id": "page-install",
      "title": "Getting Started",
      "blocks": [
        { "type": "heading", "level": 1, "content": "Getting Started" },
        { "type": "heading", "level": 2, "content": "Installation", "anchorId": "installation" }
      ]
    }
  ]
}
```

**Assets**:
```json
{
  "assets": [
    { "id": "asset-1", "kind": "image", "uri": "/test/welcome-bg.jpg" },
    { "id": "asset-2", "kind": "image", "uri": "/test/layered-bg.jpg" }
  ]
}
```

---

## Screenshots to Capture

1. **01-portal-home.png**: Portal homepage in view mode
2. **02-deck-overview.png**: Deck overview with scene cards
3. **03-author-mode.png**: Author mode with ToC and carousel
4. **04-card-scene-zoom.png**: Zoomed into Card scene
5. **05-slide-selected.png**: Slide selected with highlight
6. **06-inline-edit.png**: Inline text editor active
7. **07-layered-wizard.png**: Layered slide creation wizard
8. **08-slide-added.png**: New slide in carousel and ToC
9. **09-back-to-overview.png**: Back to deck overview
10. **10-document-scene.png**: Document scene with ToC
11. **11-toc-navigation.png**: ToC navigation to heading
12. **12-add-paragraph.png**: New paragraph block
13. **13-code-block.png**: Code block with syntax highlighting
14. **14-anchor-created.png**: Anchor indicator
15. **15-anchor-picker.png**: Anchor link picker dialog
16. **16-link-created.png**: Created hyperlink
17. **17-updated-previews.png**: ToC with updated thumbnails
18. **19-link-navigation.png**: Navigation via link
19. **19-view-mode.png**: Back to view mode

---

## Validation Points

### After Each Part

**Part 1** (Setup):
✓ Portal loads without errors  
✓ Author mode toggle functional  
✓ ToC drawer opens with content  
✓ Preview carousel appears  

**Part 2** (Card Editing):
✓ Scene navigation smooth  
✓ Slide selection works  
✓ Inline editing functional  
✓ New slide creation works  
✓ Previews generate correctly  

**Part 3** (Navigation):
✓ Zoom out returns to overview  
✓ Scene preview updated  
✓ Document scene loads  

**Part 4** (Document Editing):
✓ ToC navigation works  
✓ Block creation works  
✓ Anchor creation works  
✓ Link creation works  
✓ Link navigation works  

**Part 5** (Viewing):
✓ View mode accessible  
✓ Authoring controls removed  
✓ Content viewable  
✓ Links functional in view mode  

---

## Acceptance Criteria

- [x] Complete demo script defined
- [x] 5 parts covering all major features
- [x] 19 screenshots identified
- [x] Success criteria checklist (40+ items)
- [x] Mock data requirements specified
- [x] Validation points for each part
- [x] Integration points tested
- [x] User journey narratively described
- [x] Time estimate provided (5-7 minutes)

**Status**: ✅ Complete - Ready for Spec 18

---

## References

- **Previous**: [Spec 16: ADRs](./16-adrs.md)
- **Next**: [Spec 18: Milestone Roadmap](./18-roadmap-milestones.md)

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for demo execution with mocks

