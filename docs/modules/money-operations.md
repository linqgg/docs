---
sidebar_position: 2
description: Description of methods for working with user accounts and transactions on these accounts
---

# Money Operations

The LinQ Wallet system provides for the creation of an account for the user with the desired currency code, where funds are credited during the process of replenishment, transfer, or winning in a tournament.

The API provides three services for interaction. The first concerns the management of the game account, the second is needed to replenish the balance and transfer funds to the wallet for subsequent withdrawal, the third allows you to obtain a list of all transactions on the user account, which can be convenient for reconciling calculations.

## Account management

To manage the account, the [AccountsService](https://buf.build/linq/linq/docs/main:linq.money.accounts.v1#linq.money.accounts.v1.AccountsService) service is used. It allows you to receive the current state of the user’s account, as well as carry out operations that are needed during the game: take the amount to bet in the tournament and credit the winnings after the end of the tournament.

### View your balance

Within a wallet, a user can have several gaming accounts and a basic wallet account. Each account has its own code, analogous to the real currency code. When working with the API, you can only get the account balance for the current game and the wallet account balance. For security reasons, balances for other games are not available.

```typescript
const accountsService = new AccountsServiceClient(getTransport());

const gamingBalance = await accountsService.getActualBalance({ currency: "GSC" }, getAuthorization(authToken));
const walletBalance = await accountsService.getActualBalance({ currency: "LNQ" }, getAuthorization(authToken));

// gamingBalance.response.balance;
// walletBalance.response.balance;
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

## Payment transactions

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

### Native replenishment

#### Apple Pay

1. [Configure Apple Pay](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/apple_pay/setting_up_apple_pay)
   - [Apple developer account](https://developer.apple.com/account/resources/identifiers/list) - Enable Apple Pay Payment Processing for required bundle id, configure Merchant IDs
   - Xcode - add Apple Pay to Signing & Capabilities, enable Merchant IDs
   - Possible Merchant IDs
      - Staging
      ```
      merchant.games.galactica.linq-test
      merchant.games.galactica.linq-2-test
      ```
      - Production
      ```
      merchant.games.galactica.linq
      merchant.games.galactica.linq-2
      ```
2. Call [PaymentsService#newReplenishOrder](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PaymentsService.newReplenishOrder) to initiate order.

3. Call [NativePaymentsService#GetApplePayConfig](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.GetApplePayConfig) (authenticated by [public secret key](/modules/auth/tokens#public) and can be called from mobile) to get [apple_pay_config](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.ApplePayConfig) for order.

3. Build [PKPaymentRequest](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkpaymentrequest) using data from [apple_pay_config](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.ApplePayConfig). Proceed with Apple Pay and get [PKPayment](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkpayment) in response.

4. Call [NativePaymentsService#MakePayment](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.MakePayment) (authenticated by [public secret key](/modules/auth/tokens#public) and can be called from mobile) with data got at the previous steps.
   - apple_pay_payment should contain [payment_data json string](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkpaymenttoken/1617000-paymentdata)
   - pass billing address data got from [billingContact postalAddress](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkpayment/1619320-billingcontact). Map [Apple CNPostalAddress](https://developer.apple.com/documentation/contacts/cnpostaladdress) to [Buf BillingAddress](https://buf.build/linq/linq/docs/main:linq.shared#linq.shared.BillingAddress)
      - isoCountryCode -> country
      - state -> region
      - city -> city
      - street -> street
      - postalCode -> zip

```typescript
const payload = await service.makePayment(
  {
    // newReplenishOrder OrderStatusResponse id
    orderId: 'abcd-efgh'
    // PKPayment billingContact postalAddress
    address: {
      country: 'US',
      region: 'CA',
      city: 'Cupertino',
      street: 'One Apple Park Way',
      zip: '95014',
    },
    applePayPayment: {
      // PKPayment token paymentData
      paymentData: JSON.stringify({
        version: 'EC_v1',
        data: 'abcd...',
        signature: 'abcd...',
        header: {
          transactionId: 'abcd...',
          ephemeralPublicKey: 'abcd...',
          publicKeyHash: 'abcd...',
        },
      }),
    },
  },
  getAuthorization(secretPublicKey),
);

// payload.response.success - is transaction was successful
// payload.response.order - order info
```

#### Card

1. Implement screens to collect card data (number, expiration date, cvv, holder name) and billing address (country, region/state, city, street address, zip/postal code)
2. Integrate [Kount DDC](https://developer.kount.com/hc/en-us/sections/5319287642260-Integration-Guide?article=4411149718676) (to collect data for fraud prevention)
3. Call [PaymentsService#newReplenishOrder](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.PaymentsService.newReplenishOrder) to initiate order.
4. Call [NativePaymentsService#GetCardPaymentConfig](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.GetCardPaymentConfig) (authenticated by [public secret key](/modules/auth/tokens#public) and can be called from mobile) to get [card_payment_config](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.CardPaymentConfig) for order.
5. Make request to [Tokenex Mobile Api](https://docs.tokenex.com/docs/tokenize-with-cvv) using data from [tokenex_config](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.TokenexConfig) and card number with cvv to get Tokenex token and tokenHmac
```typescript
const response = await httpClient.post(tokenexConfig.url, {
  tokenexid: tokenexConfig.tokenexId,
  timestamp: tokenexConfig.timestamp,
  authenticationKey: tokenexConfig.authenticationKey,
  tokenScheme: tokenexConfig.tokenScheme,
  data: '4242424242424242',
  cvv: '123',
});

// response.Token
// response.TokenHMAC
```
6. Initiate [Kount DDC](https://developer.kount.com/hc/en-us/sections/5319287642260-Integration-Guide?article=4411149718676) with data from [kount_config](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.KountConfig), call `collect` and get kount `sessionId`.
7. Call [NativePaymentsService#MakePayment](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.NativePaymentsService.MakePayment) (authenticated by [public secret key](/modules/auth/tokens#public) and can be called from mobile) with [card](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.CardTokenexPayment), [address](https://buf.build/linq/linq/docs/5cdbcb323d77420d84adb6c08aab4d4c/linq.shared#linq.shared.BillingAddress) and [kount](https://buf.build/linq/linq/docs/main:linq.money.payments.v1#linq.money.payments.v1.KountData) data.
```typescript
const payload = await service.makePayment(
  {
    // newReplenishOrder OrderStatusResponse id
    orderId: 'abcd-efgh'
    // Billing address
    address: {
      country: 'US',
      region: 'CA',
      city: 'Cupertino',
      street: 'One Apple Park Way',
      zip: '95014',
    },
    cardTokenexPayment: {
      // token from Tokenize Mobile Api response
      token: '424242ABCDEF4242',
      // tokenHmac from Tokenize Mobile Api response
      tokenHmac: 'tokenHmac',
      // card expiration year
      expYear: '28',
      // card expiration month
      expMonth: '12',
      // card holder name
      cardHolderName: 'Galactica Games',
      kountData: {
        // sessionId from Kount DDC collect
        sessionId: '1234',
        // first 6 card digits,
        firstSix: '424242',
        // last 4 card digits,
        lastFour: '4242',
      },
    },
  },
  getAuthorization(secretPublicKey),
);

// payload.response.success - is transaction was successful
// payload.response.order - order info
```

### Order status

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
