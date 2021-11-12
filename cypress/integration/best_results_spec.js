describe("Best results", () => {
  context("Single user tab", () => {
    context("Desktop, 1280px width resolution", () => {
      beforeEach(() => {
        cy.viewport(1280, 720);

        cy.clock(Cypress.config("thursday_nov_11"));

        cy.visit("localhost:1234/en");
        cy.setCookie("userId", Cypress.config("test_user_cookie"));

        cy.get(".calendar .day").should("be.visible");
      });

      it("displays title and empty list message", () => {
        cy.get(".results.block h3").should("contain", "Best results");
        cy.get(".results.block .best-results").should(
          "contain",
          "No results to display yet"
        );
      });

      it("displays best result when user first click", () => {
        cy.get(".calendar [data-slot='2021-11-11T16:00:00.000Z']").click();

        cy.get(".results.block li")
          .first()
          .should("contain", "Thursday, Nov 11 - 13hs")
          .should("contain", "1 votes");
      });

      after(() => {
        cy.get(".calendar [data-slot='2021-11-11T16:00:00.000Z']").click();

        cy.get(".results.block li").should("have.length", 0);
      });
    });

    context("Mobile, 600px width resolution", () => {
      it("shouldn't be visible", () => {
        cy.viewport(320, 480);

        cy.visit(Cypress.config("test_uri"));
        cy.setCookie("userId", Cypress.config("test_user_cookie"));

        cy.get(".results.block").should("not.be.visible");
      });
    });
  });

  // TODO:
  // context("Two user tab in the same browser")

  context("Two different browsers", () => {
    let testURI = "http://localhost:1234/en";

    function anotherUserChecksSomeSlots() {
      cy.visit(testURI);
      cy.setCookie("userId", "another_coOkie");

      cy.get(".calendar .time-slot").should("not.have.class", "selected");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T13:00:00.000Z']").click();

      cy.url().then((url) => (testURI = url));
    }

    before(() => {
      anotherUserChecksSomeSlots();
    });

    function userSelectOneSlotThatAlreadyHasAVote() {
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();
    }

    it("displays best result (with two votes) first when the rest has one", () => {
      cy.viewport(1280, 720);

      cy.visit(testURI);
      cy.setCookie("userId", "myCookiE");
      cy.reload();

      userSelectOneSlotThatAlreadyHasAVote();

      cy.get(".results.block li")
        .should("contain", "Friday, Nov 12 - 9hs")
        .should("contain", "2 votes");
    });

    function cleanUp() {
      cy.visit(testURI);
      cy.setCookie("userId", "myCookiE");
      cy.reload();

      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();

      cy.wait(100);

      cy.reload();
      cy.setCookie("userId", "another_coOkie");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T13:00:00.000Z']").click();

      cy.get(".calendar .time-slot").should("not.have.class", "selected");
    }

    after(() => {
      cleanUp();
    });
  });
});
