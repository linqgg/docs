---
description: Description of the mechanism for working with tokens through Keychain (Apple) for cases when the wallet application has not yet been installed.
sidebar_position: 2
slug: /modules/auth/keychain
---

# Storing tokens in Keychain

During the integration process, you need to link the game and the LinQ application, this is done through the exchange of tokens and redirection to the LinQ application to confirm the link of accounts. However, this method will not work if the user does not yet have the LinQ application installed.

For such cases, you should use saving the access token in a special storage [Keychain](https://developer.apple.com/documentation/security/keychain\_services). Then, after redirecting the player to the Apple Store and installing the LinQ application, the LinQ application will be able to obtain this token from the storage and make a request to authorize the game.

After verifying the token and confirming their intention to link accounts, the user will be redirected back to the game, where they will need to complete [user login request](/modules/auth#authorization-and-obtaining-an-access-token) with a previously received token.

## Limitations when working with Keychain

There are two main restrictions: this mechanism only works in the Apple ecosystem and this mechanism only works when applications have one common account in the Apple Store. Thus, this integration can only be implemented after the game is transferred to the Galactica Games account.

There is no such solution for the Android version yet, but it may be available in the near future.

## Implementation example

Keychain access groups:

```
$(AppIdentifierPrefix)games.galactica.linq.stg.shared // staging
$(AppIdentifierPrefix)games.galactica.linq.shared // production
```

First configure keychain access groups, it's done by LinqSDK postbuild script, but asure everything is set up without issues. Access groups should appear in ios project `*.entitlements` file under `keychain-access-groups` key. (Xcode -> Signing & Capabilities -> Keychain Sharing)

```csharp
LinqUnity.Keychain.setAuthUserToken(token, "PD4C59QQ2H.games.galactica.linq.stg.shared" // or PD4C59QQ2H.games.galactica.linq.shared for production);
```

Next, you should implement processing of the situation when the user returns to the game and make a request to confirm the account link.

<!-- ## LinQ app token verification

This type of integration is _**not required**_, but it is possible. The LinQ application has the ability to check which of the registered games are installed on the user's phone and when entering the LinQ application, it offers to authorize this game, similar to the situation when the user was redirected from the game to the wallet.&#x20;

In this case, the LinQ application, for its part, generates `user_token` and, when confirmed by the user, authorizes this request, and places the token in the Keychain storage. On the game side, you should contact the Keychain storage and if there is a token there, then make a request to confirm the link of accounts.

```csharp
#if UNITY_IOS

  var token = Keychain.GetValue(TOKEN_MAP_KEY);

  API.AuthSignIn(token, OnSingInSuccess, OnSingInError);

#endif
``` -->
