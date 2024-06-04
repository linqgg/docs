---
sidebar_position: 1
description: General description of interactions with LinQ services
slug: /
---

# Introduction

This documentation describes the integration process with LinQ services, as well as the login mechanism through the special LinQ application. Logging in through the LinQ app allows users to authenticate and gives access to all cash flow related features. This is necessary to improve usability and security. However, basic functions are available without authorization through the application.

## Features

Integration through the application includes the following modules:

* [Authentication](modules/auth "Registration and authorization in services")
* [Location Checks](modules/location-checks.md "Check the location by IP address and more precise way using coordinates")
* [Money Operations](modules/money "All cash related operations, including transfers and custom rewards")
* [Play Mechanics](modules/play "Playing related actions, like tournaments starting and players joining")

For integration, the gRPC procedure call protocol is used together with Protocol Buffers.

To connect to services, you must use generated client libraries, which are issued according to agreements.

Technical details of connecting to LinQ services are described on the page [Getting Started](./getting-started.mdx)

### Ways of use

In both cases of using the API, the user in the LinQ system creates his own payment account, and an internal account is created for it in the internal currency associated with the game. Deposit and transfer transactions operate on the balances in these internal accounts.

#### Anonymous (conditional)

In the case of an anonymous account, an account is created in the same way as for a regular account, with the exception that transfers to a wallet account or other games are not available. Also, in the case of an anonymous account, there are restrictions on the maximum amount of funds stored on accounts.

#### Authorized

After the user is authorized through the application, all operations occur on behalf of the user account registered in LinQ services. This allows you to have full access to all the features provided by LinQ services. In particular, go through KYC, withdraw the money you win to your wallet and then to a bank account or card, or use it in other games.

### Check location

Location verification is required to satisfy the requirements of the local government where the business is conducted regarding available operations and overall ability to use services. For example, there are restrictions on financial transactions in territories included in the sanctions lists. There may also be restrictions in certain territories for certain operations or applications where additional licensing is required and has not yet been issued.

A ban by IP restricts the use of the application as a whole from the region, a ban by coordinates prohibits individual operations, but in general allows you to use the application in demo mode or for free games.

### Financial operations

After integrating the solution, the user will have access to the following options:

* top up your internal game account using a card or Apple Pay
* transfer funds from your wallet account to your game account
* use money from your account to participate in a tournament (or other in-game purchases)
* withdraw money to your wallet for subsequent payment to an account or card