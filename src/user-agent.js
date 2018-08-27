import userAgents from './user-agents.json';


class UserAgent extends Function {
  constructor(filters) {
    this.currentUserAgentProperties = new Set();

    this.randomize();
  }

  static random = (filters) => (
    new UserAgent(filters)
  );

  filter = (filters) => {
    if (!filters) {
      this.userAgents = userAgents;
    }
    // TODO: Apply filters to the list.
  };

  random = () => {
    const userAgent = new UserAgent();
    userAgent.userAgents = this.userAgents;
    userAgent.randomize();
  };

  randomize = () => {
    // TODO: Populate the random properties.
  }
};
