import User from "../src/User";

describe("User", () => {
  it("has a name", () => {
    const user = new User({ userName: "Christian" });

    expect(user.isAnonymous()).toBe(false);
  });

  it("could be anonymous", () => {
    const user = new User({ userName: "" });

    expect(user.isAnonymous()).toBe(true);
  });

  it("is possible to create copies", () => {
    const user = new User({
      start: "123",
      userId: "xyz",
      userName: "Julian",
      views: ["mum"],
    });

    const newProperties = {
      start: "789",
      userId: "tew",
      userName: "Fabian",
      views: ["oit"],
    };

    const clonedUser = user.clone(newProperties);

    expect(clonedUser.start).toBe(newProperties.start);
    expect(clonedUser.userId).toBe(newProperties.userId);
    expect(clonedUser.userName).toBe(newProperties.userName);
    expect(clonedUser.views).toBe(newProperties.views);
  });

  it("shoudnt modify original object when cloning", () => {
    const user = new User({
      start: "123",
    });

    const newProperties = {
      start: "789",
    };

    user.clone(newProperties);

    expect(user.start).toBe("123");
  });
});
