describe("Session", () => {
  it("stores the viewId as cookie", () => {
    cy.visit("localhost:1234/en?q=gr2ca75q75#pw=p0-EGfqV-1ZxJJ4_vsD34g");
    cy.setCookie("userId", Cypress.config("test_user_cookie"));

    cy.get(".calendar .day").should("be.visible");

    cy.getCookie("userId").should("not.be.null");
  });

  /* This will possibly turn into a flaky test. */
  context("revisiting an existing session", () => {
    const testURI = "http://localhost:1234/en";

    before(() => {
      cy.viewport(1280, 720);
      cy.visit(testURI);
      cy.setCookie("userId", Cypress.config("test_user_cookie"));

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();
    });

    it("preselects the previously selected slots", () => {
      cy.reload();

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
    });
  });

  context("Two different browsers", () => {
    const testURI = "http://localhost:1234/en";

    before(() => {
      cy.viewport(1280, 720);

      cy.visit(testURI);
      cy.setCookie("userId", "another_coOkie");

      cy.get(".participants .pill").should("be.visible");

      cy.reload();
      cy.setCookie("userId", Cypress.config("test_user_cookie"));

      cy.get(".participants .pill").first().click(); // deselect self

      cy.get(".participants .pill:nth-child(2)").click(); // select the other user
    });

    it("preselects the previously selected pills", () => {
      cy.reload();

      // self
      cy.get(".participants .pill")
        .first()
        .should("contain", "Anonymous #1")
        .should("not.have.class", "selected");

      // another user
      cy.get(".participants .pill:nth-child(2)")
        .should("contain", "Anonymous #2")
        .should("have.class", "selected");
    });
  });
});
