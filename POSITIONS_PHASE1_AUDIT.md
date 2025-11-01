## Positions Phase 1 — Data Contracts & Store Readiness (Audit)

This document maps the legacy Vue 2 Positions module data contracts to the Vue 3 implementation and confirms API adapter and Pinia store contracts.

### Files Compared
- Legacy: `SuperApp-FE-main-2/src/views/Positions/PosiTions.vue`
- New: `superApp_v4/src/views/Positions/PosiTions.vue`
- Adapters: `superApp_v4/src/components/mixins/getAPIdata.js`
- Stores: `superApp_v4/src/stores/authStore.js`, `superApp_v4/src/stores/appStore.js`

---

### A) Field Mapping (legacy → new)

Positions list items (from `getMPosotion`):
- `idx` → `idx` (number) [set in adapter]
- `token` → `token` (string)
- `tsym` → `tsym` (string)
- `exch` → `exch` (string)
- `netqty` → `netqty` (number)
- `way` → `way` ("open" | "close") [set in adapter]
- `disabled` → `disabled` (boolean|null) [set in adapter]
- `tokn` → `tokn` (string; `${token}_${idx}`) [set in adapter]
- `avgprc` → `avgprc` (number; derived from `netavgprc`/`netupldprc`/`upldprc`/`dayavgprc`) [set in adapter]
- `netavgprc` → `netavgprc` (number)
- `netupldprc` → `netupldprc` (number)
- `upldprc` → `upldprc` (number)
- `ltp` → `ltp` (string/number; updated via WS)
- `rpnl` → `rpnl` (number; realtime updated)
- `crpnl` → `crpnl` (number; snapshot PnL baseline) [set in adapter as copy of `rpnl`]
- `mtm` → `mtm` (number; realtime updated)
- `pnlc` → `pnlc` (string; percent, computed client-side)
- `daybuyqty`/`daysellqty`/`cfbuyqty`/`cfsellqty` → present (numbers)
- `totbuyavgprc`/`totsellavgprc` → present (numbers; formatted in adapter)
- `val` → computed in component for stats (value = avgprc * abs(netqty))
- `ls`/`mult`/`prcftr` → present where applicable (numbers)

Exposure list items (from `getEXPosition`):
- `idx` → `idx` (number) [set in component]
- `token` → `token` (string)
- `tsym` → `tsym` (string)
- `exch` → `exch` (string)
- `netqty` → `netqty` (number)
- `way` → `way` ("open" | "close") [set in component]
- `disabled` → `disabled` (boolean|null) [set in component]
- `avgprc` → `avgprc` (number; mapped from `NetAvgPrc`)
- `tokn` → `tokn` (string; `${token}_${idx}`)
- `BuyQuantity`/`SellQuantity`/`BuyPrice`/`BuyValue`/`SellPrice`/`SellValue` → present (numbers)
- `ltp`, `rpnl`, `val` → computed/updated in component on WS

Stats model (component-level):
- `positive`/`negative`/`close`/`open`: arrays filtered by `rpnl` and `netqty`
- `tradeval`: sum of positive `val`
- `oppnl`: sum of `rpnl` for open positions
- `pnl`: sum of all `rpnl`
- `mtm`: sum of `mtm`

Grouping model (component-level):
- `postgroups`: `{ [groupKey]: { data: Position[], tysm: string[], color, text, mtm } }`
- `liveposgrp`: current key; `getPostPnL(tysm)` drives chart

Conclusion: New component preserves legacy fields and augments via adapters where appropriate. Dynamic headers in Vue 3 version align with available keys.

---

### B) Adapter Contracts (confirmed)

`getMPosotion(flowis: boolean)` → `{ a: Position[], o: Position[], c: Position[] }`
- Augments each item with: `idx`, `way`, `disabled` (for open), `tokn`, `avgprc`, `crpnl`, and temp PnL helpers.
- Uses sessionStorage `userid`/`msession` dynamically.

`getEXPosition()` → `ExposureItem[]`
- Raw array; component sets `idx`, `way`, `disabled`, `avgprc` (from `NetAvgPrc`), `tokn`.

`getMPosotionCon(item)` → `{ stat: 'Ok' | 'Not_Ok', ... }`
- Expected payload: `{ uid, actid, exch, tsym, qty(string), prd('C'|'I'|'M'), prevprd('C'|'I'|'M'), trantype('B'|'S'), postype:'DAY', ordersource }`.

`getPlaceOrder(item, type?)` → `{ stat: 'Ok' | 'Not_Ok', ... }`
- Expected payload for place: `{ uid, actid, exch, prctyp:'MKT'|..., prd, prc, qty(string), ret:'DAY', tsym(URI-encoded), trantype('B'|'S'), app_inst_id, usr_agent, ipaddr }`.
- Component’s freeze-qty batching logic matches legacy.

`getPostPnL(tysm: string[])` → `{ mtm: { name: string|date, value: number }[] }`
- Vue 3 chart integration expects exactly this.

All above adapters exist and match usage in `PosiTions.vue` (Vue 3).

---

### C) Pinia Stores (confirmed)

`useAuthStore`
- Provides: `uid`, `token`, `mtoken` refs and actions to load from session/URL.
- Vue 3 component reads `authStore.uid` and falls back to `sessionStorage` — acceptable.

`useAppStore`
- Provides `showSnackbar(color, msg)` and additional UI helpers.
- Error/session handling aligns with component calls (`appStore.showSnackbar(2, msg)`).

Conclusion: Stores expose required fields and helpers for Phase 1 acceptance.

---

### D) Notes and Follow-ups
- Fix stray backticks in `superApp_v4/src/views/Positions/PosiTions.vue` near session check: `const res = sessionStorage.getItem('c3RhdHVz')`` → remove trailing backticks to avoid runtime error.
- Ensure event names are consistent: `'web-scoketOn'`/`'web-scoketConn'` are used intentionally and listened in the component.

---

### Acceptance Check (Phase 1)
- No missing fields detected for tables, stats, actions after initial loads.
- Adapter and store contracts confirmed; shapes match component usage.
