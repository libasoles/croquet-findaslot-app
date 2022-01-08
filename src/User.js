export default class User {
  constructor({ start, userId, userName, views }) {
    this.start = start;
    this.userId = userId;
    this.userName = userName;
    this.views = views;
  }

  isAnonymous() {
    return !this.userName.trim();
  }

  clone(properties) {
    const user = new User({ ...this });

    Object.entries(properties).forEach(([key, value]) => {
      user[key] = value;
    });

    return user;
  }

  hasView(viewId) {
    return this.views.includes(viewId);
  }
}
