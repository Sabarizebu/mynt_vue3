## Positions Module — Unit Test Plan (Phase 8)

This plan outlines test cases for core logic. Implement with your preferred runner (e.g., Vitest/Jest) later.

### 1) computeStats
- Sums:
  - mtm = sum(mtm)
  - pnl = sum(rpnl)
  - tradeval = sum(val where val > 0)
  - oppnl = sum(rpnl where netqty != 0)
- Formatting:
  - differentView formats numbers to 2 decimals; 0/NaN -> "0.00"
- Edge cases:
  - Empty arrays -> all zeroed
  - Mixed string/number fields -> numeric coercion works

### 2) buildHeadersFrom
- When items empty -> use preferred columns
- When items provided -> include only keys present
- Numeric alignment -> right for numeric-like keys
- Appends Actions column when addActions = true

### 3) WebSocket updater (positions)
- Given quote { token, lp } updates:
  - ltp set to fixed(2)
  - val = avgprc * |netqty|
  - rpnl and mtm recomputed per parity logic
- Guards:
  - Missing token -> no-op
  - Non-numeric lp -> ignored/defaults

### 4) WebSocket updater (exposures)
- Given quote { token, lp } updates:
  - ltp fixed(2)
  - rpnl = netqty != 0 ? (lp - avgprc) * netqty : (SellValue - BuyValue)
  - val = avgprc * |netqty|

### 5) Selection sync
- Selecting rows propagates to `disabled` for open items
- Deselecting clears `disabled`

### 6) Conversion flow mapping
- CNC/MIS/NRML mapping to C/I/M
- Lot size handling for MCX vs others
- Payload structure for `getMPosotionCon`

### 7) Square-off batching
- Freeze-qty batching: full batches + remainder order
- trantype selection based on sign of netqty

### 8) Grouping & Chart
- Grouping key from tsym prefix; correct accumulation of group MTM
- Chart dataset transforms time labels and values arrays


