---
description: tbd
sidebar_position: 2
slug: /modules/money/migration
---

# Migrating to V2 🏷️

## Overview

This short tutorial describes how to best migrate existing money requests to the new [Play API](/modules/play).

## AccountsService v2

To address previous issues and improve system design, we are introducing a new version of the AccountsService, which reduces direct operations with accounts to enhance safety. Instead, we recommend managing transactions related to tournaments through the [Play API](/modules/play).

[The second version of the service](https://buf.build/linq/linq/docs/main:linq.money.accounts.v2) introduces a new method, `GetActualBalances`, which returns the balances for both the current game account and the linked LinQ/PlayPal account, if available. The balance information includes two types: `current` and `available`. Currently, both values are the same, but in the future, `available` will represent the money that can be spent, while current will reflect the actual state of the account.

Additionally, the new version provides a method called `ApplyCustomReward`. This method, which can be enabled upon request, allows for sending special custom rewards directly to a user's account. This is useful for awarding users with real money. The `ApplyCustomReward` method is turned off by default and can be activated as needed.

## Migrating to Play API

New Play API introduces special entity like `Session`, which has to be linked with every tournament. Also, in this session we attach players and do all needed transactions for them on our side, providing results of such operations.

To migrate, first of all, need link tournaments with remote session, using special service [`SessionsService`](/modules/play#sessionsservice) and use its methods for managing remote sessions.

### How to replace `getMoney`

In the initial version, you directly debited money from the user's account using the `getMoney` method. This approach is now deprecated. Instead, we recommend using the `Join` method of the `PlayersService`. This method attaches the player to the appropriate session, performing all necessary integrity checks on our side. As a result, it returns information about the created order, which will also appear in the transaction history. **Note that if a player joins using only bonuses, no order will be created.**

Example of the returned `Order`:

```protobuf
message AppliedPlayerOrder {
  // Order identifier, uuid string
  string id = 1;
  // Type of the order, bet, stake or any other
  string type = 2;
  // Amount of the order for bet or win
  uint32 amount = 3;
  // Order status after transaction has beed applied
  string status = 4;
  // Reference data that was placed into the order during the creation
  string reference = 5;
}
```

### How to replace `putMoney`

Similar to `getMoney`, the `putMoney` method is now deprecated. To award prizes to players, you first need to complete the current session by providing the tournament table with all required data. Based on this information, the system generates all necessary orders and returns them within the response to the `SessionsService.Complete` method call.

Example of `Position` message description:

```protobuf
message Position {
  // Remote player ID returned on Join request
  string player = 1;
  // Place taken by the player
  int32 place = 2;
  // Prize that has to be paid to the player
  int32 prize = 3;
  // Score earned by the player
  optional int32 score = 4;
  // Duration spend by the player, in seconds
  optional int32 duration = 5;
  // Reference data that was placed into the order during the creation
  // Will be applied only when spread is true
  optional string reference = 6;
  // Timestamp when the player exited the game
  optional google.protobuf.Timestamp exited_at = 7;
}
```

Optionally, you can complete a session in two ways:

- **Without Generating Orders**: This option performs all necessary checks but does not generate orders, meaning no real money transactions are created during the call.
- **With Order Generation**: By defining the parameter `spread`, all transactions will be created during the API call, resulting in real money transactions being processed.

```protobuf
message CompleteSessionRequest {
  // Marks that tournament after finishin has to spread money automatically
  // based on the leaderboard table
  optional bool spread = 3;
}
```

#### Handling Rewards

If auto-spreading is not applied, you need to provide the user with the ability [to claim their reward](/modules/play#player-gains-reward). This ensures that users can manually collect their earnings from the tournament.
