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
The User-Agents package provides a comprehensive dataset of real-world user agents and other browser properties which are commonly used for browser fingerprinting and blocking automated web browsers.
Unlike other random user agent generation libraries, the User-Agents package is updated automatically on a daily basis.
This means that you can use it without worrying about whether the data will be stale in a matter of months.

Generating a realistic random user agent is as simple as running `new UserAgent()`, but you can also easily generate user agents which correspond to a specific platform, device category, or even operating system version.
The fastest way to get started is to hop down to the [Examples](#examples) section where you can see it in action!


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

The User-Agents library offers a very flexible interface for generating user agents.
These examples illustrate some common use cases, and show how the filtering API can be used in practice.


### Generating a Random User Agent

The most basic usage involves simply instantiating a `UserAgent` instance.
It will be automatically populated with a random user agent and browser fingerprint.


```javascript
import UserAgent from 'user-agents';


const userAgent = new UserAgent();
console.log(userAgent.toString());
console.log(JSON.stringify(userAgent.data, null, 2));
```

In this example, we've generated a random user agent and then logged out stringified versions both the `userAgent.data` object and `userAgent` itself to the console.
An example output might look something like this.

```literal
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36
```

```json
{
  "appName": "Netscape",
  "connection": {
    "downlink": 10,
    "effectiveType": "4g",
    "rtt": 0
  },
  "platform": "Win32",
  "pluginsLength": 3,
  "vendor": "Google Inc.",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
  "viewportHeight": 660,
  "viewportWidth": 1260,
  "deviceCategory": "desktop",
  "screenHeight": 800,
  "screenWidth": 1280
}
```

The `userAgent.toString()` call converts the user agent into a string which corresponds to the actual user agent.
The `data` property includes a randomly generated browser fingerprint that can be used for more detailed emulation.


### Restricting Device Categories

By passing an object as a filter, each corresponding user agent property will be restricted based on its values.

```javascript
import UserAgent from 'user-agents';

const userAgent = new UserAgent({ deviceCategory: 'mobile' })
```

This code will generate a user agent with a `deviceCategory` of `mobile`.
If you replace `mobile` with either `desktop` or `tablet`, then the user agent will correspond to one of those device types instead.


### Generating Multiple User Agents With The Same Filters

There is some computational overhead involved with applying a set of filters, so it's far more efficient to reuse the filter initialization when you need to generate many user agents with the same configuration.
You can call any initialized `UserAgent` instance like a function, and it will generate a new random instance with the same filters (you can also call `userAgent.random()` if you're not a fan of the shorthand).

```javascript
import UserAgent from 'user-agents';

const userAgent = new UserAgent({ platform: 'Win32' });
const userAgents = Array(1000).fill().map(() => userAgent());
```

This code example initializes a single user agent with a filter that limits the platform to `Win32`, and then uses that instance to generate 1000 more user agents with the same filter.


### Regular Expression Matching

You can pass a regular expression as a filter and the generated user agent will be guaranteed to match that regular expression.

```javascript
import UserAgent from 'user-agents';

const userAgent = new UserAgent(/Safari/);
```

This example will generate a user agent that contains a `Safari` substring.


### Custom Filter Functions

It's also possible to implement completely custom logic by using a filter as a function.
The raw `userAgent.data` object will be passed into your function, and it will be included as a possible candidate only if your function returns `true`.
In this example, we'll use the [useragent](https://www.npmjs.com/package/useragent) package to parse the user agent string and then restrict the generated user agents to iOS devices with an operating system version of 11 or greater.

```javascript
import UserAgent from 'user-agents';
import { parse } from 'useragent';

const userAgent = new UserAgent((data) => {
  const os = parse(data.userAgent).os;
  return os.family === 'iOS' && parseInt(os.major, 10) > 11;
});
```

The filtering that you apply here is completely up to you, so there's really no limit to how specific it can be.


### Combining Filters With Arrays

You can also use arrays to specify collections of filters that will all be applied.
This example combines a regular expression filter with an object filter to generate a user agent with a connection type of `wifi`, a platform of `MacIntel`, and a user agent that includes a `Safari` substring.

```javascript
import UserAgent from 'user-agents';

const userAgent = new UserAgent([
  /Safari/,
  {
    connection: {
      type: 'wifi',
    },
    platform: 'MacIntel',
  },
]);
```

This example also shows that you can specify both multiple and nested properties on object filters.


## API

### class: UserAgent([filters])

- `filters` <`Array`, `Function`, `Object`, `RegExp`, or `String`> - A set of filters to apply to the generated user agents.
    The filter specification is extremely flexible, and reading through the [Examples](#examples) section is the best way to familiarize yourself with what sort of filtering is possible.

`UserAgent` is an object that contains the details of a randomly generated user agent and corresponding browser fingerprint.
Each time the class is instantiated, it will randomly populate the instance with a new user agent based on the specified filters.
The instantiated class can be cast to a user agent string by explicitly calling `toString()`, accessing the `userAgent` property, or implicitly converting the type to a primitive or string in the standard JavaScript ways (*e.g.* `` `${userAgent}` ``).
Other properties can be accessed as outlined below.


#### userAgent.random()

- returns: <`UserAgent`>

This method generates a new `UserAgent` instance using the same filters that were used to construct `userAgent`.
The following examples both generate two user agents based on the same filters.

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
The details of how the data is updated can be found in the blog post [User-Agents — A random user agent generation library that's always up to date](https://intoli.com/blog/user-agents/).

If you have a high-traffic website and would like to contribute data to the project, then send us an email at [contact@intoli.com](mailto:contact@intoli.com).
Additional data sources will help make the library more useful, and we'll be happy to add a link to your site in the acknowledgements.


## Contributing

Contributions are welcome, but please follow these contributor guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).


## License

User-Agents is licensed under a [BSD 2-Clause License](LICENSE) and is copyright [Intoli, LLC](https://intoli.com).
