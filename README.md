# User Agents

User Agents is a JavaScript module for generating random user agents according to how frequently they're used in the wild.
This is useful for web scraping because it's often desired to create realistic traffic patterns.
There are several other similar projects for generating random user agents, but User Agents is the only one that automatically publishes new versions with updated data on a regular basis.
This ensures that your user agents will always be realistic and up to date.


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


## Acknowledgements

The user agent frequency data used in this library is currently provided by the [Will's House Tech Blog](https://techblog.willshouse.com/2012/01/03/most-common-user-agents/).


## Contributing

Contributions are welcome, but please follow these contributor guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).


## License

Slice is licensed under a [BSD 2-Clause License](LICENSE) and is copyright [Intoli, LLC](https://intoli.com).
