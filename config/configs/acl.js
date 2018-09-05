const isUserProfileOwner = ({ user, _user }) => {
  if (!user || !_user) {
    return false;
  }
  return String(user.id) === String(_user.id);
};
const isAuthenticated = ({ _user }) => !!_user;

const rules = {
  '*': ['user:create'],
  user: [
    // USER
    {
      action: 'user:update:password',
      when: isUserProfileOwner
    },
    {
      action: 'user:update',
      when: isUserProfileOwner
    },
    {
      action: 'user:get',
      when: isUserProfileOwner
    },
    {
      action: 'user:list',
      when: isAuthenticated
    },
    {
      action: 'user:delete',
      when: isUserProfileOwner
    },
    // WORKER
    {
      action: 'worker:update',
      when: isAuthenticated
    },
    {
      action: 'worker:list',
      when: isAuthenticated
    },
    {
      action: 'worker:get',
      when: isAuthenticated
    },
    {
      action: 'worker:create',
      when: isAuthenticated
    },
    {
      action: 'worker:delete',
      when: isAuthenticated
    }
  ]
};

module.exports = rules;
