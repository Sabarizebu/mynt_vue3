## Positions (Vue 2 -> Vue 3, Vuetify 2 -> 3, EventBus -> Web APIs) – Migration Notes

Use this checklist to migrate other pages (Orders, Holdings, etc.) with minimal friction.

### 1) Composition API + Pinia

- Converted Options API to `<script setup>` and replaced `data/computed/methods` with `ref`, `computed`, and functions.
- Centralized auth and app state in Pinia stores (`useAuthStore`, `useAppStore`).
- Hydrate auth from session on hard refresh before first API calls.

### 2) Vuetify 3 Data Table

- Headers: use `{ title, key, align }` (not `{ text, value }`).
- Selection: use `:item-value="'tokn'"` and `v-model` for selection; avoid legacy `item-key`.
- Footer: `:hide-default-footer="true"` for infinite tables.
- Sticky headers and compact density preserved.

### 3) Search and Filter

- Do not rely on V3 internal search during dynamic slot teardown. Implement explicit computed filters:
  - `filteredPositions` for exchange/product filters.
  - `searchedPositions`/`searchedExpositions` that run a simple `includeSearch(item, keys, term)` across safe keys.
- Toolbar inputs updated to V3 props (e.g., `variant="solo"`/`density`, `:bg-color`), removing V2-only props (`flat/solo/background-color`).

### 4) Slots and Tooltips (runtime safety)

- Guard table slots during re-render (especially while filtering/loading):
  - `v-if="item && item.tsym"` around tooltips/menus.
  - Fallback plain spans when `item` is undefined to prevent `$el` access errors.

### 5) WebSocket Standardization

- Replaced Vue 2 event bus with DOM `CustomEvent` + a global `webSocketEventBus` adapter.
- Subscribe on data load: `dispatchEvent('web-scoketOn', { flow:'sub', data, is:'pos', page:'position' })`.
- Unsubscribe on refresh and unmount to avoid duplicate ticks.
- Keep drawer data fresh by syncing from the array on each tick.

### 6) Stats/Chips Parity

- Rebuilt `computeStats()` using safe numeric coercions and formatting helper `differentView()`.
- Compute summary only for the active tab to avoid overwrites when two lists load back-to-back on refresh.

### 7) API adapter consistency

- All MyNT API functions read latest `userid/msession` from `sessionStorage` before calls (resolves early 401s).
- `getPostPnL` updated to use fresh creds.

### 8) Offline/Idle fallback

- Cache last good positions/exposures in `sessionStorage` (`positions_last`, `exposures_last`).
- On mount, load cache immediately for optimistic UI; replace when fresh API/WS data arrives.

### 9) Actions (Exit/Convert)

- Batch exit preserves freeze-qty logic; selection flows from data-table `posdselected` rather than legacy `disabled` flags.
- Conversion dialog maps product types consistently: CNC→C, MIS→I, NRML→M and applies MCX lot conversions.

### 10) Drawer details

- Ported legacy detail metrics with fallbacks (`NetAvgPrc ?? netavgprc` etc.).
- Displays all day/CF/open/total quantities, avgs, amts; formats numbers and lot-based qty for MCX.

### 11) Defensive logging and diagnostics

- Add concise logs for data counts, WS ticks, and stat results during migration; remove or gate behind dev flag later.

### 12) Common pitfalls when migrating

- V2 props removed in V3 (e.g., `flat`, `solo`, `background-color` on inputs; use `variant`, `density`, `:bg-color`).
- V2 data-table search/slots semantics changed; custom search avoids VNode `$el` access during filter.
- Avoid recomputing summaries for non-active tab to prevent flicker/wrong totals on refresh.
- Always unsubscribe WS on unmount/refresh to prevent duplicate updates.

### Snippets to copy

Headers (Vuetify 3):

```ts
const headers = [
  { title: "Instrument", key: "tsym" },
  { title: "P&L", key: "rpnl", align: "right" },
];
```

Table selection:

```vue
<v-data-table :item-value="'tokn'" v-model="selected" :headers="headers" />
```

Search helper:

```ts
function includeSearch(item: any, keys: string[], term: string) {
  if (!term) return true;
  const q = term.toLowerCase();
  return keys.some(
    (k) => item?.[k] !== undefined && String(item[k]).toLowerCase().includes(q)
  );
}
```

WS subscribe/unsubscribe:

```ts
window.dispatchEvent(
  new CustomEvent("web-scoketOn", {
    detail: { flow: "sub", data, is: "pos", page: "position" },
  })
);
window.dispatchEvent(
  new CustomEvent("web-scoketOn", {
    detail: { flow: "unsub", data, is: "pos", page: "position" },
  })
);
```

Cache last good data:

```ts
sessionStorage.setItem("positions_last", JSON.stringify({ a, o, c }));
const cached = JSON.parse(sessionStorage.getItem("positions_last") || "null");
```

Apply the same patterns to Orders/Holdings: table headers, selection, search, WS lifecycle, summary compute scoping, and API-fresh creds.
