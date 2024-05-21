---
description: Description of the tokens used and recommendations for their use
sidebar_position: 1
slug: /modules/auth/tokens
---

# Types of tokens

Four types of tokens exist and are used to provide access. Two of them are directly responsible for access, the other two are auxiliary.

## Access tokens

They are used to validate user requests and, based on them, access to certain service functions is provided.

### Access Token

This token is created upon request from a third-party service and is then used to sign user transactions in LinQ Wallet services. Works in conditional anonymity mode. The token should be saved to the user profile for subsequent operations. The token's lifetime is unlimited.

### Wallet Token

This token is issued after authorization through the LinQ application. Works similar to _Access Token_, but provides more rights. The token's lifetime is also unlimited. The token must be stored in the user profile.

After authorization, _Access Token_ can be replaced with _Wallet Token_, or you can store both, but use _Wallet Token_ first when authorizing.

The method of saving two tokens is used in one of the games. An example of using such a pair of tokens when creating an authorization header:

```typescript
getAuthorization(user.walletToken ?? user.accessToken);
```

## Auxiliary tokens

Auxiliary tokens are needed to ensure the technical implementation of the exchange of sensitive information between applications or services.

### Secret Keys

#### Private

The private secret key is issued before the integration begins and is used to verify requests coming from a third-party service. In response to a request with such a key, a user access token is returned, which can be used to sign the user's transactions.

It is recommended to pass it to the application as an environment variable, while ensuring that the code is not leaked. For example, use Google Secret Manager or similar services. The principle of operation is almost the same as that of any Secret Key.

#### Public

The public secret key is issued before the integration begins and is used to initialize LinQ SDKs(Unity) and in general verify requests coming from front-end.

### Secret Token

This token is required to initiate login through LinQ app from the application or game side. This token is involved in the formation of a special secret code, which is verified in the LinQ application, and based on this code, the accounts are finally linked.
