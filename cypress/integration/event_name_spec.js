describe("Event name widget", () => {
  context("Single user tab", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);

      cy.visit("localhost:1234/en");
    });

    it("displays the placeholder", () => {
      cy.get(".event-name-widget input")
        .invoke("attr", "placeholder")
        .should("contain", "Event name");
    });

    it("submits when Enter key pressed", () => {
      cy.get(".event-name-widget .displayed-value").should("not.be.visible");

      cy.get(".event-name-widget input")
        .type("Monthly town hall")
        .type("{enter}");

      cy.get(".event-name-widget input").should("not.be.visible");

      cy.get(".event-name-widget .displayed-value").should(
        "contain",
        "Monthly town hall"
      );

      cy.get(".event-name-widget .displayed-value button.close").should(
        "be.visible"
      );
    });

    it("switches back to input form when close button clicked", () => {
      cy.get(".event-name-widget input")
        .type("Monthly town hall")
        .type("{enter}");

      cy.get(".event-name-widget input").should("not.be.visible");
      cy.get(".event-name-widget .displayed-value").should("be.visible");

      cy.get(".event-name-widget .displayed-value button.close").click();

      cy.get(".event-name-widget .displayed-value").should("not.be.visible");
      cy.get(".event-name-widget input").should("be.visible");

      cy.get(".event-name-widget input").should(
        "have.value",
        "Monthly town hall"
      );
    });
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
