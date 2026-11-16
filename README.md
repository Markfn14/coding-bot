# coding-bot
This is meant to contain all the trading bots I'm working on

## To-do list page

`index.html` is a self-contained to-do list page (no backend, no accounts, no
database): add items with Enter or the "Add" button, click an item to check it
off (click again to uncheck), and delete items with the "Delete" button.

Open it directly in a browser, or serve the folder:

```sh
python3 -m http.server 4173
# then visit http://127.0.0.1:4173/index.html
```

Browser tests (Playwright, Chromium):

```sh
npm install
npx playwright install chromium
npm test
```
