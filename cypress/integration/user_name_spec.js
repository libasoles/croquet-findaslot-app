describe("User name widget", () => {
  context("Single user tab", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);

      cy.visit("localhost:1234/en");
    });

    it("displays the placeholder", () => {
      cy.get(".identity input")
        .invoke("attr", "placeholder")
        .should("contain", "Your name");
    });

    it("submits when Enter key pressed", () => {
      cy.get(".identity .displayed-value").should("not.be.visible");

      cy.get(".identity input").type("Guille").type("{enter}");

      cy.get(".identity input").should("not.be.visible");

      cy.get(".identity .displayed-value").should("contain", "Guille");

      cy.get(".identity .displayed-value button.close").should("be.visible");
    });

    it("switches back to input form when close button clicked", () => {
      cy.get(".identity input").type("Guille").type("{enter}");

      cy.get(".identity input").should("not.be.visible");
      cy.get(".identity .displayed-value").should("be.visible");

      cy.get(".identity .displayed-value button.close").click();

      cy.get(".identity .displayed-value").should("not.be.visible");
      cy.get(".identity input").should("be.visible");

      cy.get(".identity input").should("have.value", "Guille");
    });
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
