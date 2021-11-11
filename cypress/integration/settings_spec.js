describe("Settings", () => {
  context("Single user tab", () => {
    context("Desktop, 1280px width resolution", () => {
      beforeEach(() => {
        cy.viewport(1280, 720);

        cy.visit("localhost:1234/en");
      });

      it("displays the title", () => {
        cy.contains("Settings");
      });

      it("displays all controls", () => {
        cy.contains("Include weekends");
        cy.contains("Days range");
        cy.contains("Time range");
      });

      it("change the days range (number of columns)", () => {
        cy.get(".calendar .day").should("be.visible");

        cy.get(".days-range .upper").should("have.value", 4);

        cy.get(".days-range .upper")
          .invoke("val", 2)
          .trigger("input", { data: "2", force: true });

        cy.get(".days-range .upper").should("have.value", 2);

        // keep in mind internal values starts from 0 while displayed values (and then number of columns) starts from 1
        cy.get(".calendar-columns > .day").should("have.length", 3);
      });

      it("change the time range (number of row)", () => {
        cy.get(".calendar .day").should("be.visible");

        cy.get(".time-range .upper").should("have.value", 18);

        cy.get(".time-range .upper")
          .invoke("val", 10)
          .trigger("input", { data: "10", force: true });

        cy.get(".time-range .upper").should("have.value", 10);

        cy.wait(100); // potentially flaky

        // keep in mind internal values starts from 0 while displayed values (and then number of columns) starts from 1
        cy.get(".calendar-columns .day")
          .first()
          .find(".time-slot")
          .should("have.length", 2);
      });
    });

    context("Mobile, 600px width resolution", () => {
      it("shouldn't be visible", () => {
        cy.viewport(320, 480);

        cy.visit("localhost:1234/en");

        cy.get(".settings").should("not.be.visible");
      });
    });
  });

  // TODO
  // context("Two user tab in the same browser")
  // context("Two different browsers")
});
