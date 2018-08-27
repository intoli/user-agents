import UserAgent from './user-agent';

const random = (...args) => UserAgent.random(...args);


export {
  UserAgent as default,
  UserAgent,
  random,
};
