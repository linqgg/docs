---
sidebar_position: 1
description: Описание методов работы со счетами пользователей и транзакциями по этим счетам
---

# Денежные операции

В системе LinQ Wallet предусмотрено создание счета для пользователя с нужным кодом валюты, куда происходит зачисление средств в процессе пополнения, перевода, или выигрыша в турнире.

API предоставляет три сервиса для взаимодействия. Первый касается управления игровым счетом, второй нужен для пополнения баланса и перевода средств в кошелек для последующего вывода, третий позволяет получать список всех транзакций по аккаунту пользователя, что может быть удобно для сверки расчетов.

## Управление счётом

Для управления счетом используется сервис [AccountsService](https://buf.build/linq/linq/docs/main:linq.money.accounts.v1#linq.money.accounts.v1.AccountsService). Он позволяет получать актуальное состояние счета пользователя, а так же проводить операции, которые нужны во время игры: взять сумму для ставки в турнире и зачислить выигрыш после завершения турнира.

### Просмотр баланса

В рамках кошелька у пользователя может быть несколько игровых счетов и базовый счет кошелька. У каждого счета свой код, аналог кода реальной валюты. В рамках работы с API можно получить только баланс аккаунта для текущей игры и баланс аккаунта кошелька. В целях безопасности балансы для других игр недоступны.

```typescript
const accountsService = new AccountsServiceClient(getTransport());

const gamingBalance = await accountsService.getActualBalance({ currency: "GSC" }, getAuthorization(authToken));
const walletBalance = await accountsService.getActualBalance({ currency: "LNQ" }, getAuthorization(authToken));

// gamingBalance.response.balance;
// walletBalance.response.balance;
```

### Изъятие средств

Изъятие средств со счета осуществляется отдельным методом, но по факту данная операция генерирует ордер, который в последствии доступен в истории операций.

```
// Some code
```

### Ввод средств

Аналогично процессу изъятия средств, происходит и зачисление средств на определенный аккаунт пользователя.

```
// Some code
```

## Платежные операции

API при работе с платежами оперирует понятием Заказа (Order). В заказе хранится информация в целом о намерении пользователя и заказ проходит через стадии обработки, где к нему добавляется дополнительная техническая информация. Заказ работает аналогично заказам в e-commerce, но с учетом игровой специфики. За формирование и обработку заказов отвечает сервис [PaymentsService](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PaymentsService).

### Пополнение

Для пополнения денег необходимо создать заказ на пополнение, где нужно указать сумму для пополнения, на какой внутренний счет сумма должна быть зачислена (как правило счет игры) и дополнительные параметры для последующего отслеживания заказа, если требуется.

```typescript
const payload = await service.newReplenishOrder(
  {
    asset: 'GSC',
    amount: input.amount, // amount in coins
    reference: 'any', // any kind of internal reference
  },
  getAuthorization(user.walletToken ?? user.accessToken),
);

// payload.response.checkout - link to checkout page
```

### Статус заказа

После создания заказа на пополнение в ответ вернется ссылка, которую необходимо отобразить внутри игры средствами webview. После оплаты (успешной или нет), будет возвращен контроль обратно в приложение, после чего следует удостовериться, в каком статусе находится заказ. Он может быть успешно оплачен или отклонен платежной системой.&#x20;

```typescript
const service = new PaymentsServiceClient(getTransport());

const payload = await service.getOrderStatus(
  { id: input.order },
  getAuthorization(user.walletToken ?? user.accessToken),
);

if (payload.response.status === 'completed') {
  // apply internal operation
}
```

#### Передача данных из webview

В случае интеграции [UniWebView](https://uniwebview.com/) передача контроля из webview обратно в Unity происходит через генерацию специальной ссылки, куда перенаправляется пользователь и модуль их перехватывает, возвращая контроль.

Для начала нужно создать объект окна браузера и открыть ссылку для оплаты, полученную ранее.

```csharp
browser = new GameObject("UniWebView").AddComponent<UniWebView>();
// ... other init params
browser.Load(url);
browser.Show();
```

Затем нужно добавить обработчик события, который запустится после загрузки страницы и укажет, что используется UniWebView, код на странице будет полагаться на данный факт и отправит ответ после завершения операции оплаты.

```csharp
browser.OnPageFinished += (view, statusCode, url) => {
    browser.AddUrlScheme("http");
    browser.AddUrlScheme("https");
    browser.EvaluateJavaScript("window.uniwebview = true;", (payload) => {
        if (payload.resultCode.Equals("0")) {
            Debug.Log("UniWebView registered!");
        } else {
            Debug.Log("Something goes wrong: " + payload.data);
        }
    });
};
```

Далее необходимо добавить обработчик, который будет следить за состоянием текущего окна и принимать ответы от страницы внутри.&#x20;

```csharp
browser.OnMessageReceived += (view, message) => {
    if (message.Path.Equals("completion")) {
        var success = bool.TryParse(message.Args["success"], out var parsedValue) && parsedValue;
        if (success) {
            onSuccess?.Invoke();
            Close();
            return;
        }
        onError?.Invoke();
        Close();
        return;
    };
};
```

Здесь базовые примеры, полный листинг класса доступен в файле ниже.

here files listing missed

### Перевод

Для перевода денег в кошелек аналогично пополнению требуется создать заказ на перевод.&#x20;

```typescript
const service = new PaymentsServiceClient(getTransport());

const payload = await service.newTransferOrder(
  {
    amount: input.amount,
    fromAsset: operation == Operations.depositing ? "LNQ" : "GSC",
    toAsset: operation == Operations.depositing ? "GSC" : "LNQ",
    idempotencyKey: 'any'
  },
  getAuthorization(user.walletToken),
);
```

## История операций

Для получения истории операций (или транзакций) следует воспользоваться сервисом [OperationsService](https://buf.build/linq/linq/docs/main:linq.money.operations.v1#linq.money.operations.v1.OperationsService).

Данный сервис предоставляет список всех ордеров, которые были созданы пользователем позволяет использовать их для анализа или отображения пользователю, а зависимости от потребностей.

В момент формирования запроса есть возможность отфильтровать данные по типу операции (пополнение, ставка, награда и прочее) и по статусу (завершен, ожидает оплаты и другие). Кроме того, можно выставить временные рамки, за какой период требуется получить данные. По умолчанию возвращаются все операции.