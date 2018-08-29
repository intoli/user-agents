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


## Usage

The `userAgents.random()` method can be used to generate a random user agent.
The most common user agents are weighted with higher probabilities so that the randomly generated user agents will follow realistic probability distributions.
For example, the following code snippet will generate five random user agents based on these probabilities.

```javascript
// Import the User Agents package.
const userAgents = require('user-agents');

// Log out five random user agents.
for (let i = 0; i < 5; i++) {
    const userAgent = userAgents.random();
    console.log(userAgents);
};
```

The output will be random, and will also depend on which package version you're using, but a typical output would look something like this.

```literal
Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0
Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36
```


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
