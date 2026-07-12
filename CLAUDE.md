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

**Config-клас — DONE.** `src/config/config.ts` — `baseURL`/`timeout` з `process.env`, фолбек на дефолти. `dotenv/config` імпортується на початку `playwright.config.ts`. `.env.example` документує `BASE_URL`/`TIMEOUT` (узгоджено з реальними назвами env-змінних у `config.ts` — була розсинхронізація, виправлено). `.env` вже був у `.gitignore`. **Урок з рев'ю:** Playwright транспілює TS через esbuild без типоперевірки — звернення до неіснуючого поля об'єкта (`config.baseUrl` замість `config.baseURL`) тихо стає `undefined` замість помилки компіляції; такі баги ловляться лише запуском тестів, не читанням коду.

**Error-класи — DONE.** `src/errors/appError.ts` (базовий `AppError extends Error`, встановлює `this.name`), `src/errors/itemNotFoundError.ts` (`ItemNotFoundError extends AppError`). Використовується в `InventoryPage.addToCartByItemName` — перевіряє `(await item.count()) === 0` **перед** кліком і кидає `ItemNotFoundError` замість дефолтного 30-секундного Playwright timeout. Тест перевіряє через `expect(promise).rejects.toThrow(ItemNotFoundError)` — падає за ~2с, не за 30с.

**Інфраструктурний блок повністю закритий** (PageManager, Config, error-класи). Повертаємось до функціоналу.

**CartPage — DONE.** `src/pages/cartPage.ts` (`getCartItemNames`, `removeItemByName` з `ItemNotFoundError`, `goToCheckout`), геттер `pages.cartPage` в `PageManager`. `InventoryPage.goToCartPage()` тільки клікає на іконку кошика, не створює page object сам — навігаційні методи не повертають інші page objects, єдине джерело — `PageManager` (свідоме архітектурне рішення після обговорення fluent-стилю vs централізованого доступу). **Урок з рев'ю:** нейминг-помилка (`Card` замість `Cart`) розповзлася на 5+ файлів, перш ніж її виправили — перевіряти нейминг одразу після створення нового класу/файлу, не відкладати.

**Практика компонентів (composition):** користувач хотів практики з класами — вирішили розділити на: (а) компонент `CartBadge` (повторюваний фрагмент UI на кількох сторінках) і (б) `CheckoutPage` з композицією двох кроків (форма → summary, не повторювані фрагменти, а різні сторінки одного flow).

**Крок 1: `CartBadge` — DONE.** `src/components/cartBadge.ts` — не наслідує `BasePage` (це не сторінка), інкапсулює `shoppingCartBadge`+`shoppingCartLink`, методи `getShoppingCartBadgeText()`+`goToCartPage()`. Композиційно підключений у `InventoryPage` (`public readonly cartBadge: CartBadge`). **Урок з рев'ю:** була рекурсія — клас `CartBadge` в своєму ж конструкторі створював `new CartBadge(page)` (copy-paste помилка при спробі зробити композицію не в тому файлі) → `RangeError: Maximum call stack size exceeded`. Головна навичка з цього — вміти читати стек-трейс: коли один й той самий фрейм (`CartBadge` конструктор) повторюється сотні разів підряд — це рекурсія, шукай самовикликання. `CartPage` свідомо **не** отримав `cartBadge` (YAGNI — нема тесту, що цього потребує).

**Крок 2: `CheckoutPage` — DONE.** `src/components/checkoutInfoStep.ts` (форма: firstName/lastName/postalCode/Continue/Cancel), `src/components/checkoutOverviewStep.ts` (Finish/Cancel/totalPrice), `src/pages/checkoutPage.ts` — композиційно володіє обома кроками (`public readonly checkoutInfoStep`/`checkoutOverviewStep`), сама не тримає локаторів форми/summary. Геттер `checkoutPage` в `PageManager`. Повний checkout flow тест зелений (login → add to cart → cart → checkout info → overview → "Thank you").

**Урок з рев'ю (важливий, повторювана тема):** page objects не повинні містити `expect()`/assertions — тільки дії й повернення стану (локатора чи значення). Assertion-логіка лишається в тесті. Також: коли перевіряєш видимість/стан елемента в тесті, використовуй web-first `await expect(locator).toBeVisible()` (сам чекає й ретраїть), а не `.isVisible()` + `toBeTruthy()` (миттєвий знімок без очікування, ризик флейку) — той самий принцип, що й `toHaveURL()` vs `page.url()` раніше.

**Композиційна практика (CartBadge, CheckoutInfoStep/OverviewStep) — DONE.** Інфраструктурний блок і практика з класами повністю закриті.

**Зміна напрямку (2026-07-10):** користувач попросив API-шар перед поверненням до special-user тестів. **Важливо:** saucedemo.com — статичний SPA без реального backend API, тому вирішили не робити network mocking (це вже покрито в `front/`), а підняти окремий шар з реальним стороннім public API (**reqres.in**) — для практики побудови API-клієнта, схем відповідей, окремого `project` без браузера. Це не про сам saucedemo, а про API-testing навички в тому ж репозиторії/фреймворку.

**Playwright project 'api' — DONE.** `playwright.config.ts`: `chromium` project отримав `testIgnore: ['**/apiTests/**']`, новий `api` project з `testDir: './tests/apiTests'`, `baseURL: 'https://reqres.in/'`, без `devices` (без браузера). Перевірено: `--project=api --list` і `--project=chromium --list` не змішують тести.

**Зміна API-сервісу (2026-07-11):** `reqres.in` виявився незручним (обов'язкова реєстрація, `x-api-key` header, заплутана документація). Перейшли на **dummyjson.com** — не потребує ключа для GET, має реальний login/auth flow (JWT) і products/carts/users, тематично ближче до e-commerce (як і сам saucedemo). `REQRES_API_KEY` в `.env`/`.env.example`/`config.ts` — прибрати, більше не потрібен.

**В процесі:** `src/api/usersApiClient.ts` вже мав каркас під reqres (`getUserById` без типів) — переробити під dummyjson (`GET https://dummyjson.com/users/{id}`, форма відповіді пласка, без обгортки `data` — `{ id, firstName, lastName, email, ... }`, багато полів).

**API-шар — DONE.** `src/api/usersApiClient.ts` (dummyjson.com, `getUserById({id})` — навмисно named-param об'єкт для читабельності викликів, повністю типізований `API.GetUserResponse` у `src/api/types.ts`, детальна структура user). `src/apiManager.ts` — **користувач сам, без підказки**, застосував lazy-getter паттерн з `PageManager` до нового шару (гарне перенесення навички). Fixture `api: ApiManager` в `tests/fixtures/index.ts`. `playwright.config.ts` — `api` project без `REQRES_API_KEY`/`extraHTTPHeaders` (dummyjson не потребує ключа для GET). 14/14 тестів зелені (13 UI + 1 API).

## Наступні кроки

1. Тести на `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` — наступне (поведінка після успішного логіну: зламані картинки, повільне завантаження, баги в кошику/чекауті, візуальні відмінності — НЕ login-тести)
2. Пізніше: Allure, CI matrix/sharding
