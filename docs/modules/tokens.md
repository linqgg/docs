---
description: Описание используемых токенов и рекомендации по их использованию
---

# Виды токенов

Существует и используется четыре вида токенов для обеспечения доступа. Два из них отвечают за доступ непосредственно, два других вспомогательные.

## Токены доступа

Используются для валидации запросов пользователя и на основе них предоставляется доступ к определенным функциям сервиса.

### Access Token

Данный токен создается по запросу от стороннего сервиса и далее используется для подписи операций пользователя в сервисах LinQ Wallet. Работает в режиме условной анонимности. Токен следует сохранить в профиль пользователя для последующих операций. Время жизни токена не ограничено.

### Wallet Token

Данный токен выдается после того, как произведена авторизация через приложение LinQ Wallet. Работает аналогично _Access Token_, но предоставляет больше прав. Время жизни токена так же не ограничено. Токен необходимо хранить в профиле пользователя.

После авторизации _Access Token_ можно заменить на _Wallet Token_ либо хранить оба, но при авторизации первым использовать _Wallet Token_.&#x20;

Способ с сохранением двух токенов используется в одной из игр. Пример использования такой пары токенов при создании заголовка авторизации:

```typescript
getAuthorization(user.walletToken ?? user.accessToken);
```

## Вспомогательные токены

Вспомогательные токены нужны, чтобы обеспечить техническую реализацию обмена чувствительной информацией между приложениями или сервисами.

### Secret Key

Секретный ключ выдается перед началом интеграции и используется для проверки запросов, приходящих от стороннего сервиса. В ответ на запрос с таким ключом возвращается токен доступа пользователя, который можно использовать для подписи операций пользователя.

Рекомендуется передавать его в приложение как переменную окружения, при этом обеспечивая сохранность кода от утечки. Например, использовать Google Secret Manager или аналогичные сервисы. Принцип действия практически как у любого Secret Key.&#x20;

### Secret Token

Данный токен необходим, чтобы инициировать вход через LinQ Wallet со стороны приложения или игры. Данный токен участвует в формировании специального секретного кода, который проверятся в приложении LinQ Wallet, и на основе этого кода происходит окончательное связывание аккаунтов.