# eslint-plugin-axios-swagger

> ESLint plugin to lint routes used in the app with axios using swagger spec.

This plugin takes your swagger spec json files and checks whether the method and routes you use with axios exists.

## Getting Started

1. Install the package

    ```sh
    npm install --save-dev @devil7softwares/eslint-plugin-axios-swagger
    ```

    (or)

    ```sh
    yarn add --dev @devil7softwares/eslint-plugin-axios-swagger
    ```

2. Add the plugin to the eslint configuration
    ```json
    {
        "plugins": ["@devil7softwares/axios-swagger"]
    }
    ```
3. Add rules to the eslint configuratin
    ```json
    {
        "rules": {
            "@devil7softwares/axios-swagger/no-unknown-route": "error",
            "@devil7softwares/axios-swagger/no-unsupported-method": "error"
        }
    }
    ```
4. Add paths to swagger spec to settings in the eslint configuration
    ```json
    {
        "settings": {
            "axios-swagger": {
                "specs": ["./spec/swagger.json"]
            }
        }
    }
    ```

## Available Settings

<table>
    <thead>
        <tr>
            <th>Key</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>specs</td>
            <td>Array&lt;string&gt;</td>
            <td>✔</td>
            <td>Paths of swagger specification files. Paths should be relative to the package root where the plugin is installed.</td>
        </tr>
        <tr>
            <td>basePath</td>
            <td>string</td>
            <td></td>
            <td>Base path for URL.</td>
        </tr>
    </tbody>
</table>

## Available Rules

<table>
    <thead>
        <tr>
            <th>Rule</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>@devil7softwares/axios-swagger/no-unknown-route</td>
            <td>Enforces that no routes that are not specified in the swagger spec can be used</td>
        </tr>
        <tr>
            <td>@devil7softwares/axios-swagger/no-unsupported-method</td>
            <td>Enforces that the matched routes are used only with methods specified in the swagger spec</td>
        </tr>
    </tbody>
</table>

## Cavets

> **NOTE:** I wrote this plugin for using in my own projects. So, I handled all the scenarios I encountered. I have listed some of the scenarios where this plugin might not work. Feel free to make a pull request to fit your needs or let me know, maybe I'll look into it when I have the time.

-   Only JSON format of swagger spec is supported
-   The plugin only checks the routes of axios calls made using `get`, `post`, `put`, `delete` methods. e.g. `axios.get('/users')` or `axios.post('/users', data)`
-   The baseUrl can only be used globally i.e. you can't use different baseUrls for different places.
