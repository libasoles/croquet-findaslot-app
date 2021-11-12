describe("Pills", () => {
  context("Single user tab", () => {
    context("Desktop, 1280px width resolution", () => {
      beforeEach(() => {
        cy.viewport(1280, 720);

        cy.clock(Cypress.config("thursday_nov_11"));

        cy.visit("localhost:1234/en");

        cy.get(".calendar .day").should("be.visible");
      });

      it("displays the section title and one default pill", () => {
        cy.get(".participants.block h3").should("contain", "Participants");
        cy.get(".participants.block .pill").should("have.length", 1);
      });

      it("displays the user name (Anonymous #1) selected by default, with no check mark", () => {
        cy.get(".participants .pill:first")
          .should("contain", "Anonymous #1")
          .should("have.class", "selected")
          .should("not.have.class", "checked");
      });

      it("displays the real user name when user writes it", () => {
        cy.get(".participants .pill:first").should("contain", "Anonymous #1");

        cy.get(".identity input").type("Guille").type("{enter}");

        cy.get(".participants .pill:first").should("contain", "Guille");
      });

      it("gets check when user selects some time slot", () => {
        cy.get(".participants .pill:first").should("not.have.class", "checked");

        cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

        cy.get(".participants .pill:first").should("have.class", "checked");
      });

      it("display a message explaining there is currently no selection", () => {
        cy.get(".participants .message").contains("Your available slots");

        cy.get(".participants .message").contains("Nothing selected yet");
      });

      // TODO
      it("display a message just explaining that the color represents the selection", () => {
        cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

        cy.get(".participants .message").contains("Your available slots");

        cy.get(".participants .message .content").should("be.empty");
      });
    });

    context("Mobile, 600px width resolution", () => {
      it("shouldn't be visible", () => {
        cy.viewport(320, 480);

        cy.visit(Cypress.config("test_uri"));
        cy.setCookie("userId", Cypress.config("test_user_cookie"));

        cy.get(".participants.block").should("not.be.visible");
      });
    });
  });

  // TODO:
  // context("Two user tab in the same browser")

  context("Two different browsers", () => {
    let testURI = "http://localhost:1234/en";
    before(() => {
      cy.viewport(1280, 720);

      cy.clock(Cypress.config("thursday_nov_11"));

      cy.visit(testURI);
      cy.setCookie("userId", "another_coOkie");

      cy.get(".calendar .day").should("be.visible");

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();

      cy.reload();
      cy.setCookie("userId", Cypress.config("test_user_cookie"));
    });

    // TODO: test other user slots
    it("display the other user selection", () => {
      cy.viewport(1280, 720);

      cy.get(".participants .pill").first().click(); // select the other user

      cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
        "have.class",
        "selected"
      );
    });

    it("display a message explaining there are no matches if schedules don't overlap", () => {
      cy.viewport(1280, 720);

      cy.get(".participants .message").contains("Comparing");

      cy.get(".participants .message").contains("No overlap");
    });

    context("users have matching slots", () => {
      before(() => {
        cy.viewport(1280, 720);

        cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").click();
      });

      it("paint slots blue when two or more pills are selected and schedules match", () => {
        cy.get(".participants .pill").first().click(); // select the other user

        cy.get(".calendar [data-slot='2021-11-11T12:00:00.000Z']").should(
          "have.class",
          "match"
        );
      });

      it("display a message explaining there are no matches if schedules don't overlap", () => {
        cy.get(".participants .message").contains("Comparing");

        cy.get(".participants .message").contains(
          "Hurray! You have common slots"
        );
      });
    });
  });
});
