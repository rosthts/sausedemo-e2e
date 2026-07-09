# saucedemo-e2e

E2E-тести на Playwright + TypeScript проти https://www.saucedemo.com — навчальний портфоліо-проект.

## Роль Claude в цьому проекті

Claude виступає **ментором і manual QA лідом**, а не автором коду:
- Claude ставить задачі з чіткими критеріями прийняття, **одну маленьку задачу за раз** (користувач попросив розбивати на дрібні кроки — великі шматки одразу не заходять)
- Користувач пише код сам
- Claude рев'ює готовий diff як code review: вказує на баги, анти-патерни, пропущені edge cases — але не пише продакшн-код тестів за користувача, якщо не попросили прямо
- Мета — навчання frontend-автоматизації через практику, а не швидкий результат

## Контекст користувача

- Backend QA automation engineer, вчиться frontend-тестуванню
- Вже зробив попередній навчальний проект `study/front` (React + Playwright): POM, fixtures, factories, теги `@smoke/@regression/@visual/@a11y`, visual regression, axe-core a11y, network mocking, CI зі снепшотами. Тобто це не з нуля — базові паттерни вже знає.
- Цей проект (`saucedemo-e2e`) має піти далі: API-шар, складніший data-driven підхід, звітність рівня senior (Allure?), зріліший CI (matrix/sharding), можливо test-plan/bug-report артефакти як у manual QA.

## На що звертати увагу при рев'ю (повторювані проблеми)

- **Консистентність нейминга** — виникало кілька разів (папки, потім ключі об'єкта usersCredentials). Перевіряти щоразу.
- **Застарілі коментарі** — змінює значення, забуває оновити коментар, що це значення пояснює.
- **Енкапсуляція POM** — за замовчуванням віддає публічні локатори замість методів; заходить добре, коли пояснити конкретний сценарій, чому це проблема (а не абстрактний принцип).
- Тегування **@smoke/@regression** — концептуально розуміє правильно: smoke є підмножиною regression, а не паралельною категорією.

## Поточний стан (Task 1 — DONE)

Структура:
```
src/
  pages/       # LoginPage extends BasePage (base.page.ts -> basePage.ts)
  storage/
  utils/       # usersCredentials.ts — креди для всіх типів юзерів saucedemo
tests/
  apiTests/
  e2eTests/    # login.test.ts — smoke-тест успішного логіну standard_user
  fixtures/
```

`playwright.config.ts`:
- один project (`chromium`) — свідоме рішення, розширення на firefox/webkit відкладено
- `testIdAttribute: 'data-test'` (не дефолтний `data-testid` — важливо для saucedemo!)
- `retries: isCI ? 2 : 0`, `reporter: [['list'], ['html']]`, `timeout: 30_000`

`LoginPage` (`src/pages/loginPage.ts`): локатори через `getByTestId`, приватний `errorMessage` + метод `getErrorMessage(): Promise<string>` через `innerText()`.

`usersCredentials.ts`: всі 6 типів юзерів saucedemo (`standardUser`, `lockedOutUser`, `problemUser`, `performanceGlitchUser`, `errorUser`, `visualUser`) — camelCase консистентно.

Перший smoke-тест зелений: `tests/e2eTests/login.test.ts` — логін `standardUser`, assertion через `await expect(page).toHaveURL(...)`, тег `@smoke @regression`.

**Login test suite — DONE.** `tests/e2eTests/login.test.ts` покриває: smoke (успішний логін `standard_user`), `locked_out_user` (єдиний, хто реально блокується на етапі логіну), і data-driven набір класичних негативних кейсів (empty username/password/both, invalid username/password) через масив сценаріїв + цикл `for...of` з `test()`. `errorMessages.ts` — мапа очікуваних повідомлень по змістовних ключах (без дублювання рядків), консистентна з `usersCredentials.ts`.

**Важливе уточнення (виправляє попередній план):** тільки `locked_out_user` реально блокується на етапі логіну. `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` — логіняться успішно, їхні "фішки" (зламані картинки, повільне завантаження, баги в кошику/чекауті, візуальні відмінності) проявляються **після** входу. Це не login-тести, а окремий клас тестів на inventory/cart/checkout.

**Fixtures — DONE.** `tests/fixtures/index.ts` — кастомний `test` через `base.extend<{loginPage: LoginPage}>`, fixture сам створює `LoginPage` і викликає `open()`. `BasePage` має `get currentPage()` — публічний доступ до `page` для assertions, без розкриття внутрішнього стану сторінки. Тести імпортують `test`/`expect` з `../fixtures`, ручного `new LoginPage(page)` і дублювання `open()` більше нема.

**InventoryPage — DONE.** `src/pages/inventoryPage.ts`, `sortOptions.ts` (union type `SortOption` замість рядкових літералів), fixture `inventoryPage` в `tests/fixtures/index.ts` (логінить `standard_user` і віддає готову `InventoryPage`). Тести сортування по ціні й імені — обидва зелені, санітарно перевірені (тимчасове прибирання `sortBy()` валило тест, значить перевірка не фейкова).

**Важливий урок з рев'ю:** `Array.prototype.sort()` мутує масив на місці — `actualPrices.sort(...)` робить `actualPrices` тим самим масивом, що й `expectedPrices` (той самий reference), тест стає false-positive і завжди зелений. Завжди `[...array].sort(...)` при порівнянні "було vs очікується".

**Додавання в кошик — DONE.** `InventoryPage.addToCartByItemName(itemName)` через `filter({ hasText })` (scoped-локатор, без await на синхронному `filter()`), `getShoppingCartBadgeText()`, тест реально перевіряє інкремент лічильника (1 → 2 при додаванні другого товару, `test.step` для читабельності) — не просто "бейдж з'явився".

**Зміна пріоритету (2026-07-08):** користувач явно попросив більше інфраструктурної роботи (класи, обробка помилок), не тільки написання тестів — хоче senior-рівень портфоліо. Тимчасово ставимо на паузу функціонал (checkout) заради інфраструктури.

**PageManager — DONE.** `src/pageManager.ts` — клас з приватними полями `_loginPage`/`_inventoryPage` і lazy-геттерами (створюють інстанс при першому звертанні, кешують). Єдиний fixture `pages: PageManager` в `tests/fixtures/index.ts`. **Урок з рев'ю:** геттер не може бути async — не клади туди side-effects типу навігації (`open()`); навігація лишається явним викликом у тестах.

**Дублювання прибрано.** `PageManager.loginAs(user: keyof typeof usersCredentials)` — async метод, дістає креди з `usersCredentials` по ключу, робить `open()`+`login()`. Type-safe (TS підказує валідні ключі). Всі тести використовують `await pages.loginAs('standardUser')` замість повторення `open()+login()` вручну.

**Урок з рев'ю, що повторився двічі:** якщо метод викликає `async` методи і сам має бути "дочекайним" — він має бути `async` і використовувати `await` всередині. Без цього `await` зовні — самообман (перший раз це зловили в геттері `loginPage` з `open()`, другий раз — у першій версії `loginAs` без `async`/`await`). Playwright's auto-waiting на locators маскує цю помилку (тести все ще проходять), що робить її небезпечною — не видно, поки не стане флейково.

## Наступні кроки

1. **Config-клас** — інкапсуляція env/baseURL/timeouts — наступне
2. **Власні error-класи** для доменних ситуацій (наприклад коли очікувана помилка логіну не з'явилась)
3. Далі повертаємось до `CartPage`/`CheckoutPage`, вже на новій інфраструктурі
4. Пізніше: API-клієнт, Allure, CI matrix/sharding
