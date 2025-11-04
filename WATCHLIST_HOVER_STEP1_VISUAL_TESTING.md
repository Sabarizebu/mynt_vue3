# Step 1: Visual Testing - Watchlist Hover Functionality

## Overview
This document provides a comprehensive visual testing checklist for the Watchlist hover functionality migration.

## Testing Environment Setup

### Prerequisites
- ✅ Application running
- ✅ Watchlist page accessible
- ✅ At least one watchlist with items
- ✅ Test user account (logged in)
- ✅ Test without login (non-logged-in state)

### Browser Setup
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browser (optional)

## Visual Testing Checklist

### 1. Action Bar Appearance

#### 1.1 Basic Visibility
- [ ] **Hover over watchlist row shows action bar**
  - Action: Hover mouse over any watchlist row
  - Expected: Action bar appears at bottom of row
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Action bar appears smoothly**
  - Action: Hover over row and observe transition
  - Expected: Smooth fade-in animation (0.2s ease)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Action bar disappears smoothly**
  - Action: Move mouse away from row
  - Expected: Smooth fade-out animation (0.2s ease)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 1.2 Positioning
- [ ] **Action bar centered horizontally**
  - Action: Hover over row and check position
  - Expected: Action bar centered (`left: 50%; transform: translate(-50%, 0)`)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Action bar positioned at bottom**
  - Action: Hover over row and check position
  - Expected: Action bar at `bottom: 8px` from row bottom
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

### 2. Button Visibility

#### 2.1 Buy Button
- [ ] **Buy button appears on hover**
  - Action: Hover over row with equity/options item
  - Expected: Buy button (B) visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy button has green background**
  - Action: Inspect Buy button color
  - Expected: Background color is `var(--maingreen)` (green)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy button has white text**
  - Action: Check Buy button text color
  - Expected: Text color is white (`white--text` class)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 2.2 Sell Button
- [ ] **Sell button appears on hover**
  - Action: Hover over row with equity/options item
  - Expected: Sell button (S) visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Sell button has red background**
  - Action: Inspect Sell button color
  - Expected: Background color is `var(--mainred)` (red)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Sell button has white text**
  - Action: Check Sell button text color
  - Expected: Text color is white (`white--text` class)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 2.3 Chart Button
- [ ] **Chart button appears on hover**
  - Action: Hover over any watchlist row
  - Expected: Chart button visible (with chart icon)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Chart button has icon**
  - Action: Check Chart button content
  - Expected: Icon `mdi-chart-line-variant` visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Chart button has border**
  - Action: Inspect Chart button styling
  - Expected: Border visible (`border: 1px solid var(--outline)`)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 2.4 Delete Button
- [ ] **Delete button appears for user watchlists**
  - Action: Hover over row in user-created watchlist
  - Expected: Delete button visible (with close icon)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Delete button hidden for predefined watchlists**
  - Action: Hover over row in NIFTY50/Bank Nifty watchlist
  - Expected: Delete button NOT visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Delete button has icon**
  - Action: Check Delete button content
  - Expected: Icon `mdi-close` visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 2.5 Options Menu
- [ ] **Options menu appears on hover**
  - Action: Hover over any watchlist row
  - Expected: Options menu button (three dots) visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Options menu has icon**
  - Action: Check Options menu button
  - Expected: Icon `mdi-dots-horizontal` visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

### 3. Button Styling

#### 3.1 Buy/Sell Button Styling
- [ ] **Buy button has correct size**
  - Action: Inspect Buy button dimensions
  - Expected: `min-width: 24px; border-radius: 4px; font-size: 10px`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Sell button has correct size**
  - Action: Inspect Sell button dimensions
  - Expected: `min-width: 24px; border-radius: 4px; font-size: 10px`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy button has rounded corners**
  - Action: Visual inspection of Buy button
  - Expected: Border radius 4px
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Sell button has rounded corners**
  - Action: Visual inspection of Sell button
  - Expected: Border radius 4px
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buttons have proper spacing**
  - Action: Check spacing between buttons
  - Expected: `mr-1` class applied (margin-right)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 3.2 Chart/Delete/Options Button Styling
- [ ] **Chart button has correct size**
  - Action: Inspect Chart button dimensions
  - Expected: `min-width: 20px; size: x-small`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Delete button has correct size**
  - Action: Inspect Delete button dimensions
  - Expected: `min-width: 20px; size: x-small`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Options button has correct size**
  - Action: Inspect Options button dimensions
  - Expected: `min-width: 20px; size: x-small`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

### 4. Conditional Rendering

#### 4.1 Buy/Sell Button Conditions
- [ ] **Buy/Sell buttons show for Equity**
  - Action: Hover over equity row (NSE/BSE)
  - Expected: Buy and Sell buttons visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy/Sell buttons show for Options/Futures**
  - Action: Hover over options/futures row (NFO/BFO)
  - Expected: Buy and Sell buttons visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy/Sell buttons hidden for Indices**
  - Action: Hover over index row (instname == 'UNDIND' or 'COM')
  - Expected: Buy and Sell buttons NOT visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 4.2 Delete Button Conditions
- [ ] **Delete button shows for user watchlists**
  - Action: Hover over row in user-created watchlist
  - Expected: Delete button visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Delete button hidden for predefined watchlists**
  - Action: Hover over row in NIFTY50/Bank Nifty
  - Expected: Delete button NOT visible
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 4.3 Non-Logged-In Users
- [ ] **Only Buy/Sell buttons for non-logged-in users**
  - Action: Log out and hover over row
  - Expected: Only Buy and Sell buttons visible (no Chart/Delete/Options)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Buy/Sell buttons navigate to login**
  - Action: Click Buy or Sell button while logged out
  - Expected: Navigates to login page
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

### 5. Row-Level Visual Effects

#### 5.1 Row Background
- [ ] **Row background changes on hover**
  - Action: Hover over row
  - Expected: Background color changes to `var(--primhover)`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Row background returns on mouse leave**
  - Action: Move mouse away from row
  - Expected: Background color returns to original
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 5.2 Text Color Changes
- [ ] **Symbol text changes color on hover**
  - Action: Hover over row and check symbol name
  - Expected: Text color changes to primary color (`var(--primary)`)
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Symbol text returns on mouse leave**
  - Action: Move mouse away from row
  - Expected: Text color returns to original
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 5.3 Badge Background Changes
- [ ] **Exchange badge background changes on hover**
  - Action: Hover over row and check exchange badge
  - Expected: Background changes to `var(--mainbg)`
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Badge background returns on mouse leave**
  - Action: Move mouse away from row
  - Expected: Background returns to original
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

#### 5.4 Opacity Changes
- [ ] **Mutual fund chips become semi-transparent on hover**
  - Action: Hover over mutual fund row
  - Expected: Chips with `.table-hide` class become opacity 0.5
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

- [ ] **Opacity returns on mouse leave**
  - Action: Move mouse away from row
  - Expected: Opacity returns to 1.0
  - Actual: _______________
  - Status: [ ] PASS [ ] FAIL

## Test Scenarios

### Scenario 1: Standard Watchlist Row
1. Navigate to watchlist page
2. Hover over first row
3. Verify action bar appears
4. Verify all buttons visible
5. Verify button colors correct
6. Move mouse away
7. Verify action bar disappears

**Expected Result:** All buttons visible, colors correct, smooth transitions

### Scenario 2: Predefined Watchlist
1. Switch to NIFTY50 or Bank Nifty watchlist
2. Hover over any row
3. Verify Delete button NOT visible
4. Verify other buttons visible

**Expected Result:** Delete button hidden, other buttons visible

### Scenario 3: Non-Logged-In User
1. Log out
2. Navigate to watchlist page
3. Hover over any row
4. Verify only Buy/Sell buttons visible
5. Click Buy button
6. Verify navigation to login page

**Expected Result:** Only Buy/Sell visible, login navigation works

### Scenario 4: Index Row
1. Navigate to watchlist with index items
2. Hover over index row (instname == 'UNDIND' or 'COM')
3. Verify Buy/Sell buttons NOT visible
4. Verify Chart/Delete/Options buttons visible

**Expected Result:** Buy/Sell hidden, other buttons visible

### Scenario 5: Options/Futures Row
1. Navigate to watchlist with options/futures
2. Hover over options row
3. Verify Buy/Sell buttons visible
4. Verify all other buttons visible

**Expected Result:** All buttons visible including Buy/Sell

## Test Results Template

```
Visual Testing Results
=====================

Date: _______________
Tester: _______________
Browser: _______________
Version: _______________

Action Bar Appearance:
- [ ] Hover shows action bar
- [ ] Action bar centered
- [ ] Action bar at bottom (8px)
- [ ] Smooth appearance/disappearance

Button Visibility:
- [ ] Buy button visible (green)
- [ ] Sell button visible (red)
- [ ] Chart button visible
- [ ] Delete button visible (conditionally)
- [ ] Options menu visible

Button Styling:
- [ ] Buy button styled correctly
- [ ] Sell button styled correctly
- [ ] All buttons have white text
- [ ] Proper spacing between buttons

Conditional Rendering:
- [ ] Buy/Sell hidden for indices
- [ ] Delete hidden for predefined watchlists
- [ ] Login buttons for non-logged-in users

Row-Level Effects:
- [ ] Row background changes on hover
- [ ] Symbol text changes color
- [ ] Badge background changes
- [ ] Opacity changes for mutual fund chips

Issues Found:
1. _______________
2. _______________
3. _______________

Screenshots:
- [ ] Action bar visible
- [ ] Button colors correct
- [ ] Non-logged-in state
- [ ] Predefined watchlist

Status: [ ] PASS [ ] FAIL [ ] NEEDS FIXES

Notes:
_______________
_______________
```

## Next Steps

After completing Visual Testing:

1. ✅ Document all test results
2. ✅ Fix any issues found
3. ✅ Proceed to **Step 2: Functional Testing**
4. ✅ Proceed to **Step 3: Hover Effects Testing**
5. ✅ Proceed to **Step 4: Edge Cases Testing**

## Quick Reference

### CSS Variables to Verify
- `--maingreen` - Buy button background
- `--mainred` - Sell button background
- `--primhover` - Row background on hover
- `--primary` - Symbol text color on hover
- `--mainbg` - Badge background on hover
- `--outline` - Button border color

### Key CSS Classes
- `.table-hov` - Action bar container
- `.table-hov-text` - Symbol text
- `.table-hov-prd` - Exchange badge
- `.table-hide` - Mutual fund chips
- `.table-row` - Row container

### Button Positions
- Buy: First button (green)
- Sell: Second button (red)
- Chart: Third button (icon)
- Delete: Fourth button (only user watchlists)
- Options: Fifth button (three dots)

