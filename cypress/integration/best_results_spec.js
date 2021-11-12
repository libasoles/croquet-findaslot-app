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

      it("displays best result when user first click", () => {
        cy.get(".calendar [data-slot='2021-11-11T16:00:00.000Z']").click();

        cy.get(".results.block li")
          .should("contain", "Thursday, Nov 11 - 13hs")
          .should("contain", "1 votes");
      });
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

  context("Two different browsers", () => {
    // if it turns flaky, generate a new fresh URI, with no preconditions
    const testURI =
      "http://localhost:1234/en?q=6i8hkwil00#pw=WQY2ChTQifMvmbYebN8PYg";

    function anotherUserChecksSomeSlots() {
      cy.visit(testURI);
      cy.setCookie("userId", "mYzUiCvU");

      cy.get(".calendar .time-slot").should("not.have.class", "selected");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();
      cy.get(".calendar [data-slot='2021-11-12T13:00:00.000Z']").click();
    }

    before(() => {
      anotherUserChecksSomeSlots();
    });

    function userSelectOneSlotThatAlreadyHasAVote() {
      cy.get(".calendar [data-slot='2021-11-12T12:00:00.000Z']").click();
    }

    it("displays best result (with two votes) first when the rest has one", () => {
      cy.viewport(1280, 720);

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
      cy.setCookie("userId", "mYzUiCvU");

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
