jenca-router
---------

the front facing HTTP router for the backend services.

The router will proxy the incoming HTTP request back to the correct micro-service based on the path.

```
HTTP Request
     |
   Proxy <------> Authentication
     |
   Proxy <------> Authorization
     |
   Router<------ config.json
     |
  Backend
 Services
```

## config

The configuration for this is defined inside [config.json](config.json) - here is an example:

```json
{
  "routes":{
    "/v1/gui":"env:GUI_URL",
    "/v1/library":"env:LIBRARY_URL",
    "/v1/projects":"env:PROJECTS_URL",
    "/v1/auth":"env:AUTHENTICATE_URL"
  },
  "default":"/v1/gui"
}
```

The `routes` hash maps the url of the incoming request onto backends.  You can use the `env:` syntax to use an environment variable as the route value.

## CLI

The server is started with the following options:

```js
var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config',
    a:'authorize'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG || path.join(__dirname, 'config.json'),
    authorize:process.env.AUTHORIZE_URL
  }
})
```

The `port` setting controls the TCP port the server listens on.
The `config` setting controls the path to the config file.
The `authorize` setting (defaults to env.AUTHORIZE_URL) controls how the proxy speaks to the authorization service (which is a private url)