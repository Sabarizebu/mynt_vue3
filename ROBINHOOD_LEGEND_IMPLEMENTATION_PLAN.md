# Robinhood Legend-Style Trading Page Implementation Plan

## Overview

This document outlines the plan to transform the current widget-based trading page into a Robinhood Legend-style advanced trading platform with custom layouts, preset templates, widget linking, and enhanced trading capabilities.

## Reference

Based on: [Robinhood Legend](https://robinhood.com/us/en/legend/)

---

## Phase 1: Layout System Enhancement

### 1.1 Layout Manager Component

**Priority: High**

Create a new `LayoutManager.vue` component that handles:

- Layout creation, saving, and loading
- Layout templates/presets
- Layout switching
- Layout persistence (localStorage + backend sync)

**Components to Create:**

- `src/views/Trading/components/LayoutManager.vue`
- `src/views/Trading/components/LayoutTemplateSelector.vue`
- `src/stores/layoutStore.js` (new Pinia store)

**Features:**

- Save/load custom layouts
- Create named layouts
- Duplicate layouts
- Delete layouts
- Export/import layouts (JSON)

---

### 1.2 Preset Layout Templates

**Priority: High**

Create predefined layout templates optimized for different trading scenarios:

**Templates to Create:**

1. **Stock Trading Layout**

   - Large chart (60% width)
   - Order book (20% width)
   - Order window (20% width)
   - Marketwatch (bottom, 30% height)
   - Positions (bottom, 30% height)

2. **Options Trading Layout**

   - Options chain (40% width)
   - Chart (60% width)
   - Order window (bottom, 30% height)
   - Greeks calculator (bottom, 30% height)
   - Positions (bottom, 40% height)

3. **Market Monitoring Layout**

   - 4 small charts (grid 2x2)
   - Marketwatch (full width, bottom)
   - News feed (side panel)
   - Market indices (side panel)

4. **Day Trading Layout**

   - Large chart (70% width)
   - Level 2 order book (30% width)
   - Trade book (bottom, 25% height)
   - Quick order entry (bottom, 25% height)
   - Positions summary (bottom, 25% height)

5. **Swing Trading Layout**
   - Chart with multiple timeframes (60% width)
   - Marketwatch (40% width)
   - Positions (bottom, 40% height)
   - Notes/Journal (bottom, 30% height)

**Implementation:**

- Store templates in `src/views/Trading/layouts/presets/`
- Each template as JSON configuration
- Template preview thumbnails
- One-click template application

---

### 1.3 Advanced Grid System

**Priority: Medium**

Enhance the widget container with a grid-based layout system:

**Features:**

- Snap-to-grid option
- Grid lines overlay (toggleable)
- Grid size customization (8px, 16px, 32px)
- Widget alignment helpers
- Smart positioning (auto-arrange widgets)

**Components:**

- `src/views/Trading/components/GridOverlay.vue`
- `src/views/Trading/components/WidgetSnapHelper.vue`

---

## Phase 2: Widget Linking & Syncing

### 2.1 Widget Link System

**Priority: High**

Implement dynamic widget linking to sync instruments, timeframes, and data across widgets.

**Features:**

- Link widgets by instrument (symbol sync)
- Link widgets by timeframe
- Link widgets by chart type
- Create link groups
- Visual link indicators
- Break/unlink widgets

**Components to Create:**

- `src/views/Trading/components/WidgetLinkManager.vue`
- `src/views/Trading/components/LinkIndicator.vue`
- Update `TradingWidget.vue` to support linking

**Store Updates:**

- Add `widgetLinks` to `tradingStore.js`
- Add `linkGroups` array
- Add methods: `createLink()`, `breakLink()`, `syncWidgets()`

**UI Elements:**

- Link button in widget header
- Link menu (right-click on widget)
- Visual link lines between widgets
- Link group selector

---

### 2.2 Cross-Widget Synchronization

**Priority: High**

When a widget is linked, changes in one widget update all linked widgets:

**Sync Types:**

1. **Instrument Sync** - Selecting instrument in one widget updates all linked widgets
2. **Timeframe Sync** - Changing timeframe updates all linked charts
3. **Chart Type Sync** - Changing chart type updates all linked charts
4. **Indicator Sync** - Adding/removing indicators updates all linked charts

**Implementation:**

- Event bus for widget communication
- `src/utils/widgetEventBus.js` (new)
- Subscribe/unsubscribe to widget events
- Debounced updates to prevent performance issues

---

## Phase 3: Trade on Chart

### 3.1 Chart Trading Interface

**Priority: High**

Enable trading directly from the chart widget.

**Features:**

- Click on chart to set order price
- Drag on chart to set stop-loss/take-profit
- Right-click context menu for quick orders
- Visual order markers on chart
- Order entry overlay on chart
- Quick buy/sell buttons on chart

**Components to Create:**

- `src/views/Trading/components/ChartTradingOverlay.vue`
- `src/views/Trading/components/ChartOrderMarker.vue`
- Update `ChartPane.vue` to support trading

**Chart Interactions:**

- Click to place order at price
- Drag to create bracket order
- Double-click to open order window
- Right-click for order menu

---

### 3.2 Quick Order Entry

**Priority: Medium**

Fast order entry from multiple locations:

**Entry Points:**

- Chart widget (click price)
- Watchlist (click instrument)
- Order book (click price level)
- Positions (quick close button)
- Keyboard shortcuts (F1-F12 for quick orders)

**Components:**

- `src/views/Trading/components/QuickOrderEntry.vue`
- Keyboard shortcut handler
- Order templates (pre-filled orders)

---

## Phase 4: Enhanced Widget Features

### 4.1 Widget Tabs

**Priority: Medium**

Allow widgets to have multiple tabs (like browser tabs):

**Features:**

- Add tabs to any widget
- Switch between tabs
- Close tabs
- Drag tabs to reorder
- Tab groups

**Components:**

- `src/views/Trading/components/WidgetTabs.vue`
- Update `TradingWidget.vue` to support tabs

**Use Cases:**

- Multiple instruments in one chart widget
- Multiple watchlists in one widget
- Multiple timeframes in one chart widget

---

### 4.2 Widget Groups

**Priority: Low**

Group related widgets together:

**Features:**

- Create widget groups
- Collapse/expand groups
- Move groups together
- Group templates

**Components:**

- `src/views/Trading/components/WidgetGroup.vue`
- Group management UI

---

### 4.3 Widget Presets

**Priority: Medium**

Save widget configurations as presets:

**Features:**

- Save widget settings (size, position, config)
- Apply preset to new widget
- Share presets
- Preset library

**Components:**

- `src/views/Trading/components/WidgetPresetManager.vue`

---

## Phase 5: Multi-Monitor Support

### 5.1 Multi-Monitor Layouts

**Priority: Low**

Support layouts across multiple monitors:

**Features:**

- Detect multiple monitors
- Assign layouts to specific monitors
- Sync layouts across monitors
- Independent layouts per monitor

**Implementation:**

- Use `window.screen` API
- Store monitor-specific layouts
- Layout sync via localStorage or backend

---

## Phase 6: Performance & Optimization

### 6.1 Widget Lazy Loading

**Priority: Medium**

Load widgets only when visible:

**Features:**

- Lazy load widget content
- Virtual scrolling for widget lists
- Unload hidden widgets
- Memory management

---

### 6.2 Data Subscription Optimization

**Priority: High**

Optimize WebSocket subscriptions:

**Features:**

- Shared subscriptions for linked widgets
- Subscription pooling
- Automatic unsubscribe for hidden widgets
- Subscription throttling

**Implementation:**

- Update `webSocketEventBus.js`
- Subscription manager in `tradingStore.js`

---

## Phase 7: UI/UX Enhancements

### 7.1 Layout Toolbar

**Priority: High**

Enhanced toolbar with layout controls:

**Features:**

- Layout selector dropdown
- Save layout button
- Load layout button
- Preset templates button
- Layout settings
- Undo/redo layout changes

**Components:**

- Update `TradingPage.vue` toolbar
- `src/views/Trading/components/LayoutToolbar.vue`

---

### 7.2 Widget Library

**Priority: Medium**

Visual widget library/palette:

**Features:**

- Widget gallery
- Drag widgets from library
- Widget previews
- Widget categories
- Search widgets

**Components:**

- `src/views/Trading/components/WidgetLibrary.vue`
- Widget preview component

---

### 7.3 Layout Preview

**Priority: Low**

Preview layouts before applying:

**Features:**

- Thumbnail previews
- Hover preview
- Layout comparison
- Layout rating

---

## Phase 8: Advanced Features

### 8.1 Layout Sharing

**Priority: Low**

Share layouts with other users:

**Features:**

- Export layout as JSON
- Import layout from JSON
- Share via URL
- Public layout library

---

### 8.2 Layout Analytics

**Priority: Low**

Track layout usage:

**Features:**

- Most used layouts
- Layout performance metrics
- User preferences
- Layout recommendations

---

## Implementation Order

### Sprint 1 (Week 1-2): Foundation

1. Layout Manager Component
2. Layout Store (Pinia)
3. Save/Load Layouts
4. Basic Preset Templates (3 templates)

### Sprint 2 (Week 3-4): Widget Linking

1. Widget Link System
2. Cross-Widget Synchronization
3. Link UI Components
4. Link Event Bus

### Sprint 3 (Week 5-6): Trade on Chart

1. Chart Trading Overlay
2. Quick Order Entry
3. Order Markers on Chart
4. Chart Interactions

### Sprint 4 (Week 7-8): Enhanced Features

1. Widget Tabs
2. Widget Presets
3. Advanced Grid System
4. Layout Toolbar

### Sprint 5 (Week 9-10): Polish & Optimization

1. Performance Optimization
2. Data Subscription Optimization
3. UI/UX Enhancements
4. Testing & Bug Fixes

---

## Technical Stack

### New Dependencies (if needed)

- `vue-draggable-plus` or `vue-draggable` (already installed) - Enhanced drag & drop
- `gridstack` (optional) - Advanced grid system
- `konva` or `fabric.js` (optional) - Canvas drawing for chart annotations

### File Structure

```
src/views/Trading/
├── TradingPage.vue (main page)
├── components/
│   ├── TradingWidget.vue (existing)
│   ├── ChartPane.vue (existing)
│   ├── LayoutManager.vue (new)
│   ├── LayoutTemplateSelector.vue (new)
│   ├── WidgetLinkManager.vue (new)
│   ├── ChartTradingOverlay.vue (new)
│   ├── QuickOrderEntry.vue (new)
│   ├── WidgetTabs.vue (new)
│   ├── WidgetLibrary.vue (new)
│   └── ... (other existing components)
├── layouts/
│   ├── presets/
│   │   ├── stock-trading.json
│   │   ├── options-trading.json
│   │   ├── market-monitoring.json
│   │   ├── day-trading.json
│   │   └── swing-trading.json
│   └── templates/
└── utils/
    ├── widgetEventBus.js (new)
    └── layoutUtils.js (new)

src/stores/
├── tradingStore.js (existing - update)
└── layoutStore.js (new)
```

---

## Key Features Summary

### Must Have (MVP)

✅ Custom layouts (save/load)
✅ Preset layout templates (5 templates)
✅ Widget linking (instrument sync)
✅ Trade on chart (basic)
✅ Layout toolbar

### Should Have

✅ Widget tabs
✅ Advanced grid system
✅ Quick order entry
✅ Widget presets
✅ Cross-widget sync (timeframe, chart type)

### Nice to Have

✅ Multi-monitor support
✅ Layout sharing
✅ Widget groups
✅ Layout analytics
✅ Layout preview

---

## Success Metrics

1. **User Experience**

   - Layout creation time < 30 seconds
   - Template application < 2 seconds
   - Widget linking setup < 5 seconds

2. **Performance**

   - Layout load time < 1 second
   - Widget render time < 100ms
   - Smooth 60fps drag/resize

3. **Adoption**
   - 80% users use preset templates
   - 60% users create custom layouts
   - 40% users use widget linking

---

## Notes

- All layouts should be responsive
- Support both desktop and tablet
- Maintain dark/light theme support
- Ensure accessibility (keyboard navigation, screen readers)
- Mobile version can be simplified (widget stacking)

---

## Next Steps

1. Review and approve this plan
2. Set up project structure
3. Create detailed component specifications
4. Begin Sprint 1 implementation
5. Regular progress reviews

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
