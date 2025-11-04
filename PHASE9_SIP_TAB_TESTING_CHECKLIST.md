# Phase 9: SIP Tab Implementation - Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the SIP tab implementation in the buy/sell dialog component (`StockOrderWindow.vue`) and SIP orders page (`StockSIPorders.vue`).

## Implementation Summary

### Completed Phases
- ✅ Phase 1: SIP Tab Click Handler
- ✅ Phase 2: Event Listener Integration
- ✅ Phase 3: Form Field Validation
- ✅ Phase 4: API Integration Enhancement
- ✅ Phase 5: SIP Order Placement API (handled in Phase 4)
- ✅ Phase 6: Scrips Management Enhancement
- ✅ Phase 7: UI/UX Matching Old App
- ✅ Phase 8: Integration with Orders Page

---

## Testing Checklist

### 1. SIP Tab Navigation and Integration

#### 1.1 SIP Tab Click from Buy/Sell Dialog (Not on Orders Page)
- [ ] Click SIP tab in buy/sell dialog when NOT on orders page
- [ ] Verify navigation to `/orders/sip` route
- [ ] Verify query params contain security data (token, tsym, exch, ls)
- [ ] Verify SIP tab is automatically selected in orders page
- [ ] Verify SIP dialog opens automatically
- [ ] Verify security data is pre-filled in SIP dialog

#### 1.2 SIP Tab Click from Buy/Sell Dialog (Already on Orders Page)
- [ ] Click SIP tab in buy/sell dialog when already on orders page
- [ ] Verify `order-tab` event is emitted (switches to SIP tab)
- [ ] Verify SIP tab is selected in orders page
- [ ] Verify SIP dialog opens automatically
- [ ] Verify security data is pre-filled in SIP dialog

#### 1.3 Direct Navigation to SIP Orders Page
- [ ] Navigate directly to `/orders/sip` route
- [ ] Verify SIP tab is automatically selected
- [ ] Verify SIP orders list is displayed

---

### 2. SIP Dialog Functionality

#### 2.1 Dialog Opening and Closing
- [ ] SIP dialog opens when triggered from buy/sell dialog
- [ ] SIP dialog opens when clicking "+ Create SIP" button
- [ ] SIP dialog closes when clicking X (close) button
- [ ] SIP dialog closes after successful SIP order placement
- [ ] SIP dialog closes after canceling SIP order

#### 2.2 Dialog Header
- [ ] Dialog title shows "Create SIP order" in create mode
- [ ] Dialog title shows "Edit SIP order" in edit mode
- [ ] Close button (X icon) is visible and functional
- [ ] Divider is displayed below header

---

### 3. Form Field Validation

#### 3.1 SIP Name Validation
- [ ] SIP name field accepts only letters and spaces
- [ ] SIP name field rejects numbers and special characters
- [ ] SIP name is required (validation error if empty)
- [ ] Duplicate SIP name shows error in create mode
- [ ] SIP name can be edited in modify mode (even if duplicate)
- [ ] Whitespace is trimmed from SIP name before validation

#### 3.2 Start Date Validation
- [ ] Start date picker opens when clicking date field
- [ ] Start date cannot be before today
- [ ] Start date must be in YYYY-MM-DD format
- [ ] Start date is required (validation error if empty)
- [ ] Date picker closes after selecting date

#### 3.3 Frequency Validation
- [ ] Frequency dropdown shows all options (Daily, Weekly, Fortnightly, Monthly)
- [ ] Frequency is required (validation error if empty)
- [ ] Frequency can be changed

#### 3.4 No. of SIPs Validation
- [ ] No. of SIPs accepts only numbers
- [ ] No. of SIPs must be greater than 0
- [ ] No. of SIPs is required (validation error if empty)
- [ ] No. of SIPs cannot be negative

#### 3.5 Scrips Validation
- [ ] At least one scrip is required (validation error if empty)
- [ ] Each scrip must have valid token, exch, tsym
- [ ] Quantity must be > 0 for Qty-based investments
- [ ] Amount must be > 0 for Amount-based investments
- [ ] Investment type (Qty/Amount) is required for each scrip

---

### 4. Scrips Management

#### 4.1 Add Scrip from Buy/Sell Dialog
- [ ] Security data from buy/sell dialog is added to scrips list
- [ ] Default values are set: prd='C', invby='Qty', qty=lot size
- [ ] Duplicate scrip (same token + exchange) shows error message
- [ ] Scrip is added with idx for sorting

#### 4.2 Add Scrip from Search
- [ ] Search autocomplete converts input to uppercase
- [ ] Search filters by selected exchange (NSE/BSE)
- [ ] Selecting a scrip from search adds it to list
- [ ] Duplicate scrip shows error message
- [ ] Search field clears after adding scrip
- [ ] Default values are set correctly

#### 4.3 Remove Scrip
- [ ] Delete button removes scrip from list
- [ ] Scrip is removed immediately (Vue reactivity)
- [ ] Remaining scrips maintain their idx values

#### 4.4 Edit Scrip
- [ ] Quantity can be edited for Qty-based investments
- [ ] Amount can be edited for Amount-based investments
- [ ] Investment type can be changed (Qty ↔ Amount)
- [ ] When switching to Qty, amount field is removed
- [ ] When switching to Amount, quantity field is removed
- [ ] Default values are set when switching investment type

---

### 5. Data Table Display

#### 5.1 Table Structure
- [ ] Table shows all scrips with correct columns
- [ ] Table is sorted by idx in descending order (newest first)
- [ ] Table has fixed header (scrollable body)
- [ ] Table height is 240px
- [ ] Table shows "no data" message when empty

#### 5.2 Table Columns
- [ ] Instrument column shows tsym and exchange
- [ ] Invest by column shows Qty/Amount dropdown
- [ ] Qty column shows input field for Qty-based investments
- [ ] Amount column shows input field for Amount-based investments
- [ ] Actions column shows delete button (SVG icon)

#### 5.3 Delete Button
- [ ] Delete button uses SVG icon (matching old app)
- [ ] Delete button removes scrip on click
- [ ] Delete button has proper styling (text-align-center, mt-2)

---

### 6. API Integration

#### 6.1 Create SIP Order
- [ ] API call is made with correct format
- [ ] Scrips array is formatted correctly (qty/prc as strings, prd='C')
- [ ] SIP name is trimmed before sending
- [ ] Start date is formatted as DDMMYYYY
- [ ] Frequency is mapped correctly (Daily='0', Weekly='1', etc.)
- [ ] Success message is displayed
- [ ] Dialog closes after successful creation
- [ ] Orderbook refreshes after creation

#### 6.2 Modify SIP Order
- [ ] Existing SIP order data is loaded correctly
- [ ] Scrips are loaded with correct invby values
- [ ] API call is made with correct format (includes internal)
- [ ] Success message is displayed
- [ ] Dialog closes after successful modification
- [ ] Orderbook refreshes after modification

#### 6.3 Error Handling
- [ ] API errors are displayed as snackbar messages
- [ ] Validation errors are displayed as snackbar messages
- [ ] Error messages are clear and actionable

---

### 7. UI/UX Matching Old App

#### 7.1 Visual Elements
- [ ] Dialog header matches old app (title, close button, divider)
- [ ] Form layout matches old app (4-column grid for first row)
- [ ] Search field converts to uppercase automatically
- [ ] Exchange filter chips match old app colors
- [ ] Data table styling matches old app
- [ ] Delete button icon matches old app (SVG)
- [ ] No-data template matches old app structure

#### 7.2 Form Fields
- [ ] SIP name field styling matches old app
- [ ] Start date field styling matches old app
- [ ] Frequency dropdown styling matches old app
- [ ] No. of SIPs field styling matches old app
- [ ] Search autocomplete styling matches old app

#### 7.3 Action Buttons
- [ ] "Create SIP Order" / "Modify SIP Order" button styling matches old app
- [ ] Button is disabled when form is invalid
- [ ] Button shows loading state during API call
- [ ] Button text changes based on mode (Create/Modify)

---

### 8. Integration Points

#### 8.1 Buy/Sell Dialog Integration
- [ ] SIP tab is visible in buy/sell dialog
- [ ] SIP tab is only shown for NSE/BSE exchanges
- [ ] Clicking SIP tab navigates correctly
- [ ] Security data is passed correctly

#### 8.2 Orders Page Integration
- [ ] SIP tab is visible in orders page tabs
- [ ] SIP tab can be clicked directly
- [ ] SIP orders list is displayed correctly
- [ ] Create SIP button is functional

#### 8.3 Event Handling
- [ ] `siporder-trigger` event is emitted correctly
- [ ] `siporder-trigger` event is received correctly
- [ ] `order-tab` event switches tabs correctly
- [ ] Events are cleaned up on component unmount

---

### 9. Edge Cases and Error Scenarios

#### 9.1 Empty States
- [ ] Empty scrips list shows "no data" message
- [ ] Empty SIP orders list shows "no data" message
- [ ] Form validation works with empty fields

#### 9.2 Duplicate Handling
- [ ] Duplicate SIP name shows error
- [ ] Duplicate scrip shows error
- [ ] Error messages are clear

#### 9.3 Network Errors
- [ ] API errors are handled gracefully
- [ ] Error messages are displayed
- [ ] Dialog doesn't close on error

#### 9.4 Data Persistence
- [ ] Form data persists during editing
- [ ] Scrips list persists during editing
- [ ] Changes are lost when dialog closes (as expected)

---

### 10. Performance and Responsiveness

#### 10.1 Loading States
- [ ] Loading indicator shows during API calls
- [ ] Buttons are disabled during API calls
- [ ] Search autocomplete shows loading state

#### 10.2 Reactivity
- [ ] Scrips list updates immediately when adding/removing
- [ ] Form validation updates immediately
- [ ] Table updates immediately when data changes

#### 10.3 Responsive Design
- [ ] Dialog is responsive on different screen sizes
- [ ] Form layout adapts to screen size
- [ ] Table is scrollable when needed

---

## Testing Scenarios

### Scenario 1: Create SIP Order from Buy/Sell Dialog
1. Open buy/sell dialog for a stock
2. Click SIP tab
3. Verify navigation to SIP orders page
4. Verify SIP dialog opens with security data
5. Fill in SIP name, start date, frequency, No. of SIPs
6. Verify scrip is added automatically
7. Click "Create SIP Order"
8. Verify success message
9. Verify dialog closes
10. Verify orderbook refreshes

### Scenario 2: Create SIP Order with Multiple Scrips
1. Navigate to SIP orders page
2. Click "+ Create SIP"
3. Fill in form fields
4. Add multiple scrips from search
5. Edit quantities/amounts
6. Change investment types
7. Click "Create SIP Order"
8. Verify all scrips are included in API call
9. Verify success

### Scenario 3: Modify Existing SIP Order
1. Click edit button on existing SIP order
2. Verify all fields are pre-filled correctly
3. Modify SIP name, start date, frequency
4. Add/remove scrips
5. Edit quantities/amounts
6. Click "Modify SIP Order"
7. Verify success message
8. Verify changes are reflected in orderbook

### Scenario 4: Form Validation
1. Try to create SIP with empty fields
2. Verify validation errors appear
3. Try to create SIP with duplicate name
4. Verify error message
5. Try to create SIP with invalid date
6. Verify validation error
7. Try to create SIP with no scrips
8. Verify validation error

### Scenario 5: Scrip Management
1. Add scrip from search
2. Try to add duplicate scrip
3. Verify error message
4. Change investment type
5. Verify fields update correctly
6. Delete scrip
7. Verify scrip is removed

---

## Expected Results

### Success Criteria
- ✅ All navigation flows work correctly
- ✅ All form validations work correctly
- ✅ All API calls are successful
- ✅ All UI/UX matches old app
- ✅ All edge cases are handled
- ✅ No console errors
- ✅ No linter errors

### Performance Criteria
- ✅ Dialog opens within 100ms
- ✅ API calls complete within 3 seconds
- ✅ Form validation is instant
- ✅ Table updates are instant

---

## Notes

- All phases (1-8) have been completed
- Implementation uses Vue 3 Composition API
- Implementation uses Vuetify 3 components
- Implementation uses Pinia for state management
- Event handling uses CustomEvent (not EventBus)
- API calls use `getSIPOrderset` function
- Date formatting uses `moment` library

---

## Next Steps

After completing all tests:
1. Fix any issues found during testing
2. Verify all edge cases are handled
3. Update documentation if needed
4. Mark implementation as complete

