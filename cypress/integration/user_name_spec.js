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

    it("displays the name from a previous cookie", () => {
      cy.setCookie("userName", "Guille");

      cy.get(".identity .displayed-value")
        .should("be.visible")
        .should("contain", "Guille");
    });

    it("update the cookie when user name edited", () => {
      cy.setCookie("userName", "Guille");

      cy.get(".identity .displayed-value button.close").click();

      cy.get(".identity input").clear().type("Agustin").type("{enter}");

      cy.getCookie("userName").should("have.property", "value", "Agustin");
    });
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
