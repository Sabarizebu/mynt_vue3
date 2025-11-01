# Orders – Testing Checklist

## Functional
- Load Orders Book: shows open/executed counts and rows
- Reload icon fetches latest and reflects changes
- Search filters Open Orders by symbol, exch, type, status/reason
- Time column uses exchange time or falls back to norentm
- Executed Orders tab displays correct data and formatting
- Empty states render icon + caption with no console warnings

## Realtime
- `orderbook-update` triggers refresh
- `tempdata-update` with `stat` updates lists without hard reload
- Event listeners removed on route leave (no duplicate events on return)

## UX/Consistency
- Tabs: Orders Book/Executed switch preserves scroll
- Top navigation tabs route correctly to SIP, Mutual funds, IPOs, Bonds
- All headers aligned; numeric columns right-aligned

## Resilience
- On API failure, snackbar error appears
- Cached `orders_last` hydrates on reload if API down

## Performance
- Large lists (500+ rows) scroll smoothly; no layout thrash

## Browser
- Validate in Chromium/WebKit; responsive widths look correct
