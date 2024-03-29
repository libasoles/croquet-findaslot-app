describe("Calendar", () => {
  context("Single user tab", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);

      cy.clock(Cypress.config("thursday_nov_11"));

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
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']")
        .should("not.have.class", "selected")
        .click()
        .should("have.class", "selected");
    });

    it("deselects a slot when clicked", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']")
        .should("not.have.class", "selected")
        .click()
        .should("have.class", "selected")
        .click()
        .should("not.have.class", "selected");
    });

    it("displays a single dot when slot clicked", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 0);

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 1);
    });

    it("selects multiple slots by dragging", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']")
        .trigger("mousedown", { which: 1 })
        .trigger("mousemove", { clientX: 600, clientY: 100 })
        .trigger("mouseup", { force: true });

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-11T13:00:00.000Z']").should(
        "have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-12T13:00:00.000Z']").should(
        "have.class",
        "selected"
      );
    });

    it("deselects slots by dragging", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']")
        .trigger("mousedown", { which: 1 })
        .trigger("mousemove", { clientX: 0, clientY: 100 })
        .trigger("mouseup", { force: true });

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-11T13:00:00.000Z']").should(
        "have.class",
        "selected"
      );

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']")
        .trigger("mousedown", { which: 1 })
        .trigger("mousemove", { clientX: 600, clientY: 100 })
        .trigger("mouseup", { force: true });

      cy.wait(100);

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
        "not.have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-11T13:00:00.000Z']").should(
        "not.have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
      cy.get(".calendar [data-slot='2021-11-12T13:00:00.000Z']").should(
        "have.class",
        "selected"
      );
    });
  });

  // TODO:
  // context("Two user tab in the same browser")

  context("Two different browsers", () => {
    const testURI = "http://localhost:1234/en";

    before(() => {
      cy.viewport(1280, 720);

      cy.clock(Cypress.config("thursday_nov_11"));

      cy.visit(testURI);
      cy.setCookie("userId", "another_coOkie");
      cy.setCookie("userName", "Pedro");

      cy.get(".calendar").should("be.visible");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 1);

      cy.reload();
      cy.setCookie("userId", Cypress.config("test_user_cookie"));
      cy.setCookie("userName", "Guille");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".dot")
        .should("have.length", 2);
    });

    it("displays a tooltip with a list of users who selected the slot", () => {
      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".tooltip .content")
        .should("not.be.visible");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z'] .dots")
        .find(".tooltip")
        // .invoke("trigger", "contextmenu")
        // .trigger("mouseenter")
        // .invoke("show")
        // .trigger("mouseover")
        .find(".content")
        .should("be.visible")
        .should("contain", "Pedro, Guille");
    });
  });
});
