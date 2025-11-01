## Positions Module — Phase 8 Verification Checklist

Use this checklist to validate critical behaviors after Vue 3 migration.

### Tables, Headers, Sorting, Filters
- [ ] Headers visible in Positions and All Positions tables
- [ ] Numeric columns right-aligned
- [ ] Sorting toggles asc/desc and reorders rows
- [ ] Search filters rows by `tsym`
- [ ] `exchtype` filter shows correct subsets

### Actions — Exit and Convert
- [ ] Exit dialog opens via row action and bulk Exit button
- [ ] Batch square-off respects freeze quantity (full orders + remainder)
- [ ] Success snackbar on order placement, error snackbar on failures
- [ ] Conversion dialog defaults (qty, product) are correct
- [ ] Conversion API succeeds and updates local state

### Stats and Chips
- [ ] `tradeval` = sum of positive `val`
- [ ] `oppnl` = sum of open positions’ `rpnl`
- [ ] `pnl` and `mtm` totals correct and formatted to 2 decimals
- [ ] Positive/Negative/Closed/Open chip counts accurate

### Grouping and Chart
- [ ] Grouping by symbol prefix matches legacy logic
- [ ] Default group set to first entry when groups exist
- [ ] MTM color/text parity updates on data change
- [ ] Chart updates when changing group
- [ ] Chart resizes on window resize; no console errors on unmount

### Realtime Updates
- [ ] Subscribe on load and unsubscribe on unmount
- [ ] Positions/exposures update ltp, rpnl, mtm without flicker
- [ ] Guards prevent crashes on missing/partial payloads

### UX Consistency
- [ ] Loaders/disabled states appear when network actions run
- [ ] Snackbars show success/warning/error consistently

### Smoke Scenarios
- [ ] Load Positions and Exposures without errors
- [ ] Execute a test square-off (paper/mock) to validate batching
- [ ] Convert a position and verify state/UI updates

### Notes
- Record any deviations and their root causes below:

```
- Issue:
- Impact:
- Root cause:
- Fix:
```


