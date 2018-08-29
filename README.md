<h1 vertical-align="middle">
    User Agents
</h1>

<p align="left">
    <a href="https://circleci.com/gh/intoli/user-agents/tree/master">
        <img src="https://img.shields.io/circleci/project/github/intoli/user-agents/master.svg"
            alt="Build Status"></a>
    <a href="https://circleci.com/gh/intoli/user-agents/tree/master">
        <img src="https://img.shields.io/github/last-commit/intoli/user-agents/master.svg"
            alt="Build Status"></a>
    <a href="https://github.com/intoli/user-agents/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/License-BSD%202--Clause-blue.svg"
            alt="License"></a>
    <a href="https://www.npmjs.com/package/user-agents">
        <img src="https://img.shields.io/npm/v/user-agents.svg"
            alt="NPM Version"></a>
    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    <a target="_blank" href="https://twitter.com/home?status=User%20Agents%20is%20a%20JavaScript%20module%20for%20generating%20random%20user%20agents%20that's%20updated%20daily%20with%20new%20market%20share%20data.%0A%0Ahttps%3A//github.com/intoli/user-agents">
        <img height="26px" src="https://simplesharebuttons.com/images/somacro/twitter.png"
            alt="Tweet"></a>
    <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//github.com/intoli/user-agents">
        <img height="26px" src="https://simplesharebuttons.com/images/somacro/facebook.png"
            alt="Share on Facebook"></a>
    <a target="_blank" href="http://reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Fintoli%2Fuser-agents&title=User%20Agents%20-%20Random%20user%20agent%20generation%20with%20daily-updated%20market%20share%20data">
        <img height="26px" src="https://simplesharebuttons.com/images/somacro/reddit.png"
            alt="Share on Reddit"></a>
    <a target="_blank" href="https://news.ycombinator.com/submitlink?u=https://github.com/intoli/user-agents&t=User%20Agents%20-%20Random%20user%20agent%20generation%20with%20daily-updated%20market%20share%20data">
        <img height="26px" src="media/ycombinator.png"
            alt="Share on Hacker News"></a>
</p>


###### [Installation](#installation) | [Examples](#examples) | [API](#api) | [How it Works](https://intoli.com/blog/user-agents/) | [Contributing](#contributing)

> User-Agents is a JavaScript package for generating random [User Agents](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent) based on how frequently they're used in the wild.
> A new version of the package is automatically released every day, so the data is always up to date.
> The generated data includes hard to find browser-fingerprint properties, and powerful filtering capabilities allow you to restrict the generated user agents to fit your exact needs.

Web scraping often involves creating realistic traffic patterns, and doing so generally requires a good source of data.
The User-Agents package provides a comprehensive dataset of real-world user agents and browser properties that are often used for browser finerprinting and blocking automated web browsers.
Unlike other random user agent generation libraries, the User-Agents package is updated automatically on a daily basis.
This means that you can use it without worrying about whether the data will be stale in a matter of months.

The fastest way to get started is to hop down to the [Examples](#examples) section and see it in action!


## Installation

The User Agents package is available on npm with the package name [user-agents](https://npmjs.com/package/user-agents).
You can install it using your favorite JavaScript package manager in the usual way.

```bash
# With npm: npm install user-agents
# With pnpm: pnpm install user-agents
# With yarn:
yarn add user-agents
```


## Examples


## API

### class: UserAgent([filters])

- `filters` <`Array`, `Function`, `Number`, `Object`, `RegExp`, or `String`> - A set of filters to apply to the generated user agents.
    The filter specification is extremely flexible, and reading through the [Examples](#examples) section is the best way to familiarize yourself with what sort of filtering is possible.

`UserAgent` is an object that contains the details of a randomly generated user agent and corresponding browser fingerprint.
Each time the class is instantiated, it will randomly populate the instance with a new user agent based on the specified filters.
The instantiated class can be cast to a user agent string by explicitly calling `toString()`, accessing the `userAgent` property, or implicitly converting the type to a primitive or string in the standard JavaScript ways (*e.g.* `` `${userAgent}` ``).
Other properties can be accessed as outlined below.


#### userAgent.random()

- returns: <`UserAgent`>

This method generates a new `UserAgent` instance using the same filters that were used to construct `userAgent`.
The following two examples accomplish the same effect.

```javascript
// Explicitly use the constructor twice.
const firstUserAgent = new UserAgent(filters);
const secondUserAgent = new UserAgent(filters);
```

```javascript
// Use the `random()` method to construct a second user agent.
const firstUserAgent = new UserAgent(filters);
const secondUserAgent = firstUserAgent.random();
```

The reason to prefer the second pattern is that it reuses the filter processing and preparation of the data for random selection.
Subsequent random generations can easily be over 100x faster than the initial construction.


#### userAgent()

- returns: <`UserAgent`>

As a bit of syntactic sugar, you can call a `UserAgent` instance like `userAgent()` as a shorthand for `userAgent.random()`.
This allows you to think of the instance as a generator, and lends itself to writing code like this.

```javascript
const generateUserAgent = new UserAgent(filters);
const userAgents = Array(100).fill().map(() => generateUserAgent());
```

#### userAgent.toString()

- returns: <`String`>

Casts the `UserAgent` instance to a string which corresponds to the user agent header.
Equivalent to accessing the `userAgent.userAgent` property.


#### userAgent.data

- returns: <`Object`>
    - `appName` <`String`> - The value of [navigator.appName](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID/appName).
    - `connection` <`Object`> - The value of [navigator.connection](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection).
    - `cpuClass` <`String`> - The value of [navigator.cpuClass](https://msdn.microsoft.com/en-us/library/ms531090\(v=vs.85\).aspx).
    - `deviceCategory` <`String`> - One of `desktop`, `mobile`, or `tablet` depending on the type of device.
    - `oscpu` <`String`> - The value of [navigator.oscpu](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/oscpu).
    - `platform` <`String`> - The value of [navigator.platform](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID/platform).
    - `pluginsLength` <`Number`> - The value of [navigator.plugins.length](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/plugins).
    - `screenHeight` <`Number`> - The value of [screen.height](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height).
    - `screenWidth` <`Number`> - The value of [screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width).
    - `vendor` <`String`> - The value of [navigator.vendor](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vendor).
    - `userAgent` <`String`> - The value of [navigator.userAgent](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID/userAgent).
    - `viewportHeight` <`Number`> - The value of [window.innerHeight](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight).
    - `viewportWidth` <`Number`> - The value of [window.innerWidth](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth).

The `userAgent.data` contains the randomly generated fingerprint for the `UserAgent` instance.
Note that each property of `data` is also accessible directly on `userAgent`.
For example, `userAgent.appName` is equivalent to `userAgent.data.appName`.


## Versioning

The project follows [the Semantic Versioning guidelines](https://semver.org/).
The automated deployments will always correspond to patch versions, and minor versions should not introduce breaking changes.
It's likely that the structure of user agent data will change in the future, and this will correspond to a new major version.

Please keep in mind that older major versions will cease to be updated after a new major version is released.
You can continue to use older versions of the software, but you'll need to upgrade to get access to the latest data.


## Acknowledgements

The user agent frequency data used in this library is generously provided by [Intoli](https://intoli.com), the premier residential and smart proxy provider for web scraping.
The details of how the data is updated can be found in the blog post [User-Agents — A random user agent generation library that's always up to date](https://intoli.com/blog/user-agents).

If you have a high-traffic website and would like to contribute data to the project, then send us an email at [contact@intoli.com](mailto:contact@intoli.com).
Additional data sources will help make the library more useful, and we'll be happy to add a link to your site in the acknowledgements.


## Contributing

Contributions are welcome, but please follow these contributor guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).


## License

User-Agents is licensed under a [BSD 2-Clause License](LICENSE) and is copyright [Intoli, LLC](https://intoli.com).
