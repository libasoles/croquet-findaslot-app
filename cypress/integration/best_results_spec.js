describe("Best results", () => {
  context("Single user tab", () => {
    context("Desktop, 1280px width resolution", () => {
      beforeEach(() => {
        cy.viewport(1280, 720);

        const thursday = 1636641230277;
        cy.clock(thursday);

        cy.visit("localhost:1234/en");

        cy.get(".calendar .day").should("be.visible");
      });

      it("displays title and empty list message", () => {
        cy.get(".results.block h3").should("contain", "Best results");
        cy.get(".results.block .best-results").should(
          "contain",
          "No results to display yet"
        );
      });

      it.only("displays best result when user first click", () => {
        cy.get(".calendar [data-slot='2021-11-11T16:00:00.000Z'").click();

        cy.get(".results.block li")
          .should("contain", "Thursday, Nov 11 - 13hs")
          .should("contain", "1 votes");
      });

      // TODO: prepopulate with another user selection and count votes
    });

    context("Mobile, 600px width resolution", () => {
      it("shouldn't be visible", () => {
        cy.viewport(320, 480);

        cy.visit("localhost:1234/en");

        cy.get(".results.block").should("not.be.visible");
      });
    });
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
