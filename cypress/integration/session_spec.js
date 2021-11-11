describe("Session", () => {
  it("stores the viewId as cookie", () => {
    cy.visit("localhost:1234/en");
    cy.get(".calendar .day").should("be.visible");

    cy.getCookie("userId").should("not.be.null");
  });
});
