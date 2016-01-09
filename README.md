jenca-router
---------

the front facing HTTP router for the backend services.

The router will proxy the incoming HTTP request back to the correct micro-service based on the path.

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