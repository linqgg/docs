---
id: operations
sidebar_position: 1
description: Description of methods for working with user accounts and transactions on these accounts
slug: /modules/money
---

# Money Operations

The LinQ system provides for the creation of an account for the user with the desired currency code, where funds are credited during the process of replenishment, transfer, or winning in a tournament.

The API provides three services for interaction. The first concerns the management of the game account, the second is needed to replenish the balance and transfer funds to the wallet for subsequent withdrawal, the third allows you to obtain a list of all transactions on the user account, which can be convenient for reconciling calculations.

## Account Management

To manage the account, the [AccountsService](https://buf.build/linq/linq/docs/main:linq.money.accounts.v1#linq.money.accounts.v1.AccountsService) service is used. It allows you to receive the current state of the user’s account, as well as carry out operations that are needed during the game: take the amount to bet in the tournament and credit the winnings after the end of the tournament.

### View your balance

Within a wallet, a user can have several gaming accounts and a basic wallet account. Each account has its own code, analogous to the real currency code. When working with the API, you can only get the account balance for the current game and the wallet account balance. For security reasons, balances for other games are not available.

```typescript
const accountsService = new AccountsServiceClient(getTransport());

const walletBalance = await accountsService.getActualBalance({ currency: "LNQ" }, getAuthorization(authToken));
const gamingBalance = await accountsService.getActualBalance({ currency: "GSC" }, getAuthorization(authToken));

// gamingBalance.response.balance;
// walletBalance.response.balance;
```

To avoid latency it is possible to request all balances in one request, but than you have to filter response on your side to match balances and currency in code of the game.

```typescript
const accountsService = new AccountsServiceClient(getTransport());

const accounts = await accountsService.getAllAccounts({}, getAuthorization(authToken));

const walletBalance = accounts.response.accounts.filter((v) => v.currency == "LNQ").pop()?.balance || 0;
const gamingBalance = accounts.response.accounts.filter((v) => v.currency == "GSC").pop()?.balance || 0;
```

### Withdrawal of funds

Withdrawal of funds from the account is carried out using a separate method, but in fact this operation generates an order, which is subsequently available in the transaction history.

```
// Some code
```

### Depositing funds

Similar to the process of withdrawing funds, funds are also credited to a specific user account.

```
// Some code
```

## Payment Transactions

When working with payments, the API operates with the concept of Order. The order stores information in general about the user's intent and the order goes through processing stages where additional technical information is added to it. The order works similarly to orders in e-commerce, but taking into account the specifics of the game. The [PaymentsService](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PaymentsService) service is responsible for the formation and processing of orders.

### Replenishment with checkout page

To replenish money, you need to create a replenishment order, where you need to indicate the amount to replenish, to which internal account the amount should be credited (usually the game account) and additional parameters for subsequent tracking of the order, if required.

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

### Native Payments

We provide an ability to integrate native payments in the game using special [Unity SDK](https://github.com/linqgg/unity-sdk), which is handle all operations with user sensitive payment data (like card number, cvv and others) on the client side. Such an approach makes the process much easier and PCI DSS compliant at the same time.

#### Native Payment Card

To implement native payments via debit or credit cards, you have to implement UI elements for capturing payment data, like **card number**, **protection code**, **cardholder name**, and **expiration date**, as well as elements for capturing player **billing address**. To be compliant with PCI standards, you have to avoid sending captured data to any of your backend services except providing payment details to the specified SDK methods.

We use certified third-party services for card tokenization in combination with anti-fraud checks, and we do not handle raw user payment information as well.

Before start integrating, you have to [install](https://github.com/linqgg/unity-sdk?tab=readme-ov-file#installation) and [configure](https://github.com/linqgg/unity-sdk?tab=readme-ov-file#setup) our Unity SDK.

If you integrated LinQ services before, the flow will remain almost the same. You have to generate a replenishment order by `newReplenishOrder` from Server SDK, and proceed with Unity SDK using the returned `order.id`.

```scharp
// Card Details
var details = new PaymentDetails()
{
  CardNumber = "4242424242424242",
  Expiration = "12/27",
  HolderName = "Kevon Chang",
  Protection = "123",
};

// Billing Address
var address = new BillingAddress()
{
  Country = "US", // 2-letter code
  Region = "Iowa",
  City = "Iowa City",
  Street = "109 S Johnson St",
  Zip = "52240"
};

try {
  var response = await LinqSDK.CheckoutByOrdinaryCard(order, details, address);
  Debug.Log("Order status: " + response.Status);
} catch (InvalidOperationException e) {
  Debug.Log("Failure: " + e.Message);
}
```

For testing purposes, you can use the following card credentials:

- Number: `4242 4242 4242 4242`
- Expriration: `12/27`
- Holder Name: `CARD HOLDER`
- CVV Code: `123`

In some cases, native modules, that are used under the hood, may not work. It is applied for situations when the game is running on Android or from Unity Editor. To not block the flow it is possible to skip anti-fraud checks by providing the word `NOFRAUD` in the field of the cardholder name.

#### Native Apple Pay

Apple Pay method does not require a billing address or card details, as it comes from the user's wallet. Additionally, need to handle some exceptions in case payment fails or is canceled by the user to avoid the application hanging out.

```scharp
try {
  var response = await LinqSDK.CheckoutByApplePayCard(order);
  Debug.Log("Order status: " + response.Status);
} catch (PaymentUnknownException e) {
  Debug.Log("Unknown: " + e.Message); // do nothing
} catch (PaymentFailureException e) {
  Debug.Log("Failure: " + e.Message); // show a message about failed payment
} catch (PaymentDiscardException e) {
  Debug.Log("Discard: " + e.Message); // handle logic about cancellation
}
```

For **Apple Pay** testing, you need to create special testing account and add there the next card details. Authorization may work with any cards and accounts, but transactions will fail on the provider side.

- Number: `5204 2452 5000 1488`
- Expriration: `11/2022`
- CVV Code: `111`

To get updated with the lates usage examples, please check relevant documentation section about [Unity SDK usage](https://github.com/linqgg/unity-sdk?tab=readme-ov-file#usage).

### Brazil Pix payment
To make the payment Pix code should be generated and displayed to the user.

To generate Pix code user's full name and email are required. They should be passed to us with help of [AuthUserService#SaveGameUser](https://buf.build/linq/linq/docs/main:linq.auth.user.v1#linq.auth.user.v1.AuthUserService.SaveGameUser) method. If the data won't be passed [NativePaymentsService#GetPixPaymentData](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.GetPixPaymentData) request will be failed.

First order should be initialized with `newReplenishOrder` called from the server.

Then call [NativePaymentsService#GetPixPaymentData](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.GetPixPaymentData) (authenticated by [Public token](/modules/auth/tokens#public)). It accepts optional [params](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PixPaymentRequest) tax_id and address. Tax id is Brazilian CPF number (ask if validation rules are required). Address - country is 2-letter code of Brazil (BR), region is 2-letter code of Brazilian state (ask if list of states with their full names are required).

After displaying Pix code to user wait for the some time and use [getOrderStatus](/modules/money#order-status) to determine if order status changed and if it succeed or not.


### Order Status

After creating a replenishment order, a link will be returned in response, which must be displayed inside the game using webview. After payment (successful or not), control will be returned back to the application, after which you should make sure what the status of the order is. It can be successfully paid or rejected by the payment system.

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

#### Passing data from webview

In the case of [UniWebView](https://uniwebview.com/) integration, the transfer of control from the webview back to Unity occurs through the generation of a special link where the user is redirected and the module intercepts them, returning control.

First, you need to create a browser window object and open the payment link you received earlier.

```csharp
browser = new GameObject("UniWebView").AddComponent<UniWebView>();
// ... other init params
browser.Load(url);
browser.Show();
```

Then you need to add an event handler that will fire when the page loads and indicate that UniWebView is being used, the code on the page will rely on this fact and send a response after the payment transaction is completed.

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

Next, you need to add a handler that will monitor the state of the current window and accept responses from the page inside.

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

Here are basic examples, the full class listing is available in the file below.

here files listing missed

### Transfer

To transfer money to a wallet, similar to replenishment, you need to create a transfer order.

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

## Operations history

To obtain the history of operations (or transactions), you should use the [OperationsService](https://buf.build/linq/linq/docs/main:linq.money.operations.v1#linq.money.operations.v1.OperationsService) service.

This service provides a list of all orders that were created by the user, allowing them to be used for analysis or display to the user, depending on the needs.

At the time of forming the request, it is possible to filter the data by type of operation (replenishment, rate, reward, etc.) and by status (completed, awaiting payment, etc.). In addition, you can set a time frame for what period you want to obtain data. The default is to return all operations.

## Limits

To check if any money operation limit reached use [IsLimitReached](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PaymentsService.IsLimitReached)

### Existing limits

#### Anonymous profiles

Current total deposit amount for anonymous profiles is limited to **20.00**.
To overcome it please [sign in user with LinQ wallet](/modules/auth#authorization-request) or [provide user's game account data](/modules/auth#save-game-user-data-to-anonymous-profile-to-avoid-deposit-limits)
