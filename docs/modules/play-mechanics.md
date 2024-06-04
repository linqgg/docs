---
sidebar_position: 3
description: Description of methods for working with tournaments and its players
slug: /modules/play
---

# Play Mechanics 🏷️

## Overview

The play mechanics for managing tournaments consist of two primary services: `SessionsService` and `PlayersService`. These services facilitate the lifecycle of a tournament, from initiating a session to completing or dissolving it, and managing player interactions within the session.

### Services and Methods

#### [SessionsService](https://buf.build/linq/linq/docs/main:linq.play.sessions.v1)

The `SessionsService` manages the flow of tournaments on the wallet side and provides the following methods:

1. **Initiate** – Starts a new play session, as params receives player stakes.
2. **Complete** – Stops the tournament, including spreading rewards via a special flag.
3. **Dissolve** – Terminates the current session in case it is canceled, and returns the bets.

#### [PlayersService](https://buf.build/linq/linq/docs/main:linq.play.players.v1)

The `PlayersService` manages player interactions within a tournament session and provides the following methods:

1. **Join** – Attaches a player to the session (tournament), including internal checks and automatically takes bets according to the tournament config.
2. **Gain** – Allows a player to gain their reward if the tournament does not have automatic spreading.

The `reference` identifier can be used to check the history of operations, ensuring that all transactions are accurately recorded and can be reviewed for accountability and compliance purposes.

### Authorization for requests

Both services are designed for server-to-server usage, but they differ slightly in their authorization requirements. Requests to the `SessionsService` must be authorized by the game server using a [Private Secret Key](/modules/auth/tokens#private). In contrast, requests to the `PlayersService` must be authorized on behalf of the player using [Access Tokens](/modules/auth/tokens#access-tokens). This distinction ensures that game servers manage session-level operations securely, while player-specific actions are authenticated with tokens that represent the player's identity and permissions.

## Usage Documentation for Developers

### Getting Started

To use the tournament management API, follow these steps:

1. **Initiate a Session**: Use the `SessionsService.Initiate` method to start a new session. Note the sessison `id` returned. Required fieads are: `seats` - amount of players, `prize` - common sum of rewards, `entry` - cost for joining per user. The field `title` is optional, but we highly recommend providing it to simplify the dashboard search later.
2. **Join Players to Session**: Use the `PlayersService.Join` method to attach players to the session using the session `id` and their params, like `username`, `stake` and others. Method will return player `id` and applied order with information about money.
3. **Complete or Dissolve Session**:
    - If the tournament concludes normally, use the `SessionsService.Complete` method to complete the session and distribute rewards.
    - If the tournament is canceled, use the `SessionsService.Dissolve` method to terminate the session and return the bets.
4. **Player Rewards**: If the tournament does not automatically spread rewards, players can claim their rewards using the `PlayersService.Gain` method with their player `id` and the session `id`.

### Example Workflow

#### Initiate a Session

  ```typescript
    const remoteSession = await sessionService.initiate({ 
      title: "High Stakes",
      seats: 5,
      entry: 250, // 2.5$
      prize: 1000, // 10$
    }, getAuthorization(process.env.SECRET_KEY));

    // need to store remote id for later usage
    tournament.remote = remoteSession.id;
  ```

#### Join a Player
  
  ```typescript
    const remotePlayer = await playerService.join({
      session: tournament.remote,
      username: "John Doe",
      stake: {
        value: 200, // 2$ real cash
        bonus: 50,  // 0.5$ bonuses
      }
    }, getAuthorization(user.walletToken || user.accessToken));

    // need to store remote id for later usage
    player.remote = remotePlayer.id;
  ```

#### Complete the Session
  
  ```typescript
    //...
    positions.push(new Position({
      player: player.remote,
      place: player.place, // place taken by player
      prize: player.reward, // reward for player according tournament config
      score: player.score, // score earned by player, optional
      duration: player.duration, // time spent for game by player, optional
    }));
    //...

    const session = await playService.complete({
      session: tournament.remote,
      positions,
    }, getAuthorization(process.env.SECRET_KEY));
  ```

#### Player Gains Reward

  Normally one user as a player can take part only in one tournament. If it will change in the future, it is possible to use optional parameter `player` to define for which exact player under the current user to gain reward.

  ```typescript
    const remotePlayer = await playersSerivce.gain(
      { session: tournament.remote },
      getAuthorization(user.walletToken ?? user.accessToken)
    );
  ```

### Asynchronous Interaction

In cases, when API calls has to be used in asynchronous manner, we provide special field for setting dates. Normally we detect these dates on our side, in time when we handling requests, but you can redefine it. There are some example of such parameters.

```protobuf
message InitiateSessionRequest {
  // Timestamp when the session was initiated
  optional google.protobuf.Timestamp initiated_at = 5;
}
```

```protobuf
message Position {
  // Timestamp when the player exited the game
  optional google.protobuf.Timestamp exited_at = 7;
}
```

```protobuf
message CompleteSessionRequest {
  // Timestamp when the session was completed
  optional google.protobuf.Timestamp completed_at = 5;
}
```

It works the same for `DissolveSessionRequest` as well.

```protobuf
message JoinPlayerRequest {
  // Timestamp when player was joined to the session
  optional google.protobuf.Timestamp joined_at = 5;
}
```

```protobuf
message GainPlayerRequest {
  // Timestamp when player was gained his reward
  optional google.protobuf.Timestamp gained_at = 4;
}
```

### Referencing Orders

In various parts of the public API, the reference field is utilized to tag orders with custom user-defined keys. This functionality enables users to mark and track transactions, which can later be validated against the order history (transaction list). The Play API also supports this feature, allowing you to define the `reference` property for better tracking and validation of all money orders associated with tournament sessions. This ensures that every financial transaction, from bets to rewards, is accurately recorded and easily traceable.

### Idempotency Implementation

While the Play API does not use a specific idempotency property, it still adheres to idempotency principles. If a player attempts to join the same session multiple times, the API will return the same remote ID and associated order as the initial request. This approach ensures that duplicate requests do not result in multiple entries or duplicate transactions. The same idempotent behavior applies when players claim their rewards; repeated requests will yield the same result as the first successful attempt. This ensures consistency and reliability in the management of tournament sessions and rewards.

### Error Handling

Ensure to handle errors appropriately by checking the `status` and error messages in the API responses. For example:

This part will be updated when we add number for errors.

### Conclusion

By following this documentation, developers can efficiently integrate and manage tournament sessions and player interactions using the `SessionsService` and `PlayersService`. For any further assistance, refer to the detailed [API reference](https://buf.build/linq/linq) or contact support.
