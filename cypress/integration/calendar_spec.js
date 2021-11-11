describe("Calendar", () => {
  context("Single user tab", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);

      const thursday = 1636641230277;
      cy.clock(thursday);

      cy.visit("localhost:1234/en");
    });

    it("displays today column", () => {
      cy.get(".calendar-columns .day .title").should("contain", "11 Thursday");
    });

    it("doesn't displays weekend columns", () => {
      cy.get(".calendar-columns .day .title").should(
        "not.contain",
        "13 Saturday"
      );
      cy.get(".calendar-columns .day .title").should(
        "not.contain",
        "14 Sunday"
      );
    });

    it("does displays weekend columns when settings change", () => {
      cy.get(".calendar .day").should("be.visible");

      cy.get(".include-weekends").click();

      cy.get(".calendar-columns .day .title").should("contain", "13 Saturday");
      cy.get(".calendar-columns .day .title").should("contain", "14 Sunday");
    });

    it("selects a slot when clicked", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'")
        .should("not.have.class", "selected")
        .click()
        .should("have.class", "selected");
    });

    it("deselects a slot when clicked", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'")
        .should("not.have.class", "selected")
        .click()
        .should("have.class", "selected")
        .click()
        .should("not.have.class", "selected");
    });

    it("displays a single dot when clicked", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 0);

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 1);
    });

    // TODO: test drag selection
  });

  // TODO:
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
