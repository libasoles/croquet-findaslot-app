import { Model, View } from "@croquet/croquet";
import { InputWidget } from "./InputWidget";
import i18next from "i18next";
import { readCookie } from "./utils";

export default class Identity extends Model {
  init() {
    this.connectedUsers = new Map();

    this.subscribe(this.id, "register-user", this.registerUser);
    this.subscribe(this.id, "register-user-view", this.registerUserView);
    this.subscribe(this.id, "name-changed", this.updateUser);
  }

  registerUser(viewId) {
    if (this.connectedUsers.has(viewId)) return;

    this.connectedUsers.set(viewId, {
      start: this.now(),
      userId: viewId,
      userName: "",
      views: [viewId],
    });

    this.identityEstablished();
  }

  registerUserView({ userId, viewId, userName }) {
    if (!this.connectedUsers.has(userId)) {
      this.registerUser(userId);

      return;
    }

    const user = this.connectedUsers.get(userId);

    this.connectedUsers.set(userId, {
      ...user,
      userName,
      views: [...user.views, viewId],
    });

    this.identityEstablished(userId);
  }

  identityEstablished(userId) {
    this.publish("identity", "established", this.connectedUsers.get(userId));
  }

  updateUser({ userId, userName }) {
    const user = this.connectedUsers.get(userId);

    this.connectedUsers.set(userId, {
      ...user,
      userName,
    });

    this.publish("identity", "update-name", { userId, userName });
  }

  name(userId) {
    return this.connectedUsers.get(userId).userName;
  }

  selfId(viewId) {
    for (const [userId, user] of this.connectedUsers) {
      if (user.views.includes(viewId)) {
        return userId;
      }
    }
  }

  allUsers() {
    return Array.from(this.connectedUsers).map(([userId, user]) => {
      return {
        userId,
        userName: user.userName,
      };
    });
  }
}

export class IdentityView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.hydrate();

    this.initForm();

    this.subscribe("identity", "update-name", this.updateName);
  }

  hydrate() {
    const userId = readCookie("userId");

    if (!userId) {
      this.register();
    } else {
      this.login(userId);
    }
  }

  register() {
    document.cookie = `userId=${this.viewId}`;

    this.publish(this.model.id, "register-user", this.viewId);
  }

  login(userId) {
    const userName = readCookie("userName");

    this.publish(this.model.id, "register-user-view", {
      userId,
      userName,
      viewId: this.viewId,
    });
  }

  initForm() {
    const selector = document.querySelector(".identity");

    const userName = readCookie("userName");

    this.widget = new InputWidget(
      selector,
      {
        name: "name",
        placeholder: i18next.t("your_name"),
        value: userName,
      },
      {
        onChange: (userName) => this.userNameChanged(userName),
        formatValue: (value) => <h3>{value}</h3>,
      }
    );
  }

  userNameChanged(userName) {
    const userId = readCookie("userId");

    document.cookie = `userName=${userName}`;

    this.publish(this.model.id, "name-changed", { userId, userName });
  }

  updateName({ userId, userName }) {
    const selfId = readCookie("userId");

    if (userId === selfId) this.widget.displayValue(userName);
  }
}
