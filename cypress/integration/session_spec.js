describe("Session", () => {
  it("stores the viewId as cookie", () => {
    cy.visit("localhost:1234/en");
    cy.get(".calendar .day").should("be.visible");

    cy.getCookie("userId").should("not.be.null");
  });

  /* This will possibly turn into a flaky test. */
  context("revisiting an existing session", () => {
    // must be a url with an anonymous existing user
    const testURI =
      "http://localhost:1234/en?q=gr2ca75q75#pw=p0-EGfqV-1ZxJJ4_vsD34g";
    before(() => {
      cy.viewport(1280, 720);

      cy.visit(testURI);
      cy.setCookie("userId", "xYzUiCv");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'")
        .should("not.have.class", "selected")
        .click();
    });

    beforeEach(() => {
      cy.viewport(1280, 720);
      cy.visit(testURI);
      cy.setCookie("userId", "xYzUiCv");
    });

    it("preselects the previously selected slots", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'").should(
        "have.class",
        "selected"
      );
    });

    it("preselects the previously selected pills", () => {
      // self
      cy.get(".users-pills .pill")
        .first()
        .should("contain", "Anonymous #1")
        .should("not.have.class", "selected");

      // another user
      cy.get(".users-pills .pill:nth-child(2)")
        .should("contain", "Anonymous #2")
        .should("have.class", "selected");
    });

    after(() => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'")
        .click()
        .should("not.have.class", "selected");
    });
  });
});
