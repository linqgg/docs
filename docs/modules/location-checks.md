---
sidebar_position: 3
description: Integration module for checking user location to confirm transactions.
---

# Location Checks

Location verification is required to comply with regulatory requirements regarding financial transactions that the user carries out while using the application.

LinQ services use two types of user location verification, differing in more precise location determination and nature of operations.

Checking the user's location by IP address is carried out in order to limit access to services from regions that are subject to restrictions by the jurisdiction where business is conducted.

Checking the location using the user's coordinates is carried out to ensure the legality of operations in a given territory; as a rule, this applies to operations related to the movement of funds (deposits, withdrawals, placing a bet to participate in a tournament).

## IP verification

To check access over IP, the `RestrictionsService` service is used, which provides the `isAccessAllowed` method

<!-- ### List of countries and regions where transactions are restricted

In some cases, you may need to check access from a certain region through third-party services, in which case you can use the [ConfigurationService](https://buf.build/linq/linq/docs/main:linq.geo.restrictions.v1#linq.service.geo.restrictions.v1.ConfigurationService) to obtain an up-to-date list of countries and regions where restrictions on operations have been introduced.

This service requires authorization through a special game token ([Secret Key](https://galactica-games.gitbook.io/integration-sdk/sections/registraciya-i-avtorizaciya/vidy-tokenov#secret-key)), so as not disclose this information publicly. This is also necessary for the case when there are stricter restrictions for a particular game than for the platform as a whole.

For example, card games require an additional license in the state of Maine, so a request from Solitaire services will include that state as a prohibited state, while other applications will not.

```typescript
const service = new ConfigurationServiceClient(getTransport());

const payload = await service.getAvoidedRegions({
  token: process.env.GAME_SECRET_KEY ?? '',
});

/**
{
  "countries": [ "AF", "MK", "AL", "XK" ],
  "areas": [
    { "country": "US", "regions": [ "AZ", "LA", "SC", "DE", "WA" ] }
  ]
}
**/
``` -->

## Check by GEO

To check access to operations based on user coordinates, the LocationService service and the isOperationAllowed method are used.
