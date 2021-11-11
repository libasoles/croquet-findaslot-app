describe("Pills", () => {
  context("Single user tab", () => {
    context("Desktop, 1280px width resolution", () => {
      beforeEach(() => {
        cy.viewport(1280, 720);

        const thursday = 1636641230277;
        cy.clock(thursday);

        cy.visit("localhost:1234/en");

        cy.get(".calendar .day").should("be.visible");
      });

      it("displays the section title and one default pill", () => {
        cy.get(".users-pills.block h3").should("contain", "Participants");
        cy.get(".users-pills.block .pill").should("have.length", 1);
      });

      it("displays the user name (Anonymous #1) selected by default, with no check mark", () => {
        cy.get(".users-pills .pill:first")
          .should("contain", "Anonymous #1")
          .should("have.class", "selected")
          .should("not.have.class", "checked");
      });

      it("displays the real user name when user writes it", () => {
        cy.get(".users-pills .pill:first").should("contain", "Anonymous #1");

        cy.get(".identity input").type("Guille").type("{enter}");

        cy.get(".users-pills .pill:first").should("contain", "Guille");
      });

      it("gets check when user selects some time slot", () => {
        cy.get(".users-pills .pill:first").should("not.have.class", "checked");

        cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'").click();

        cy.get(".users-pills .pill:first").should("have.class", "checked");
      });
    });

    context("Mobile, 600px width resolution", () => {
      it("shouldn't be visible", () => {
        cy.viewport(320, 480);

        cy.visit("localhost:1234/en");

        cy.get(".users-pills.block").should("not.be.visible");
      });
    });
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
