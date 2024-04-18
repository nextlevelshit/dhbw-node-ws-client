describe("Websocket Client Tests", () => {
	it("Application runs and UI is in place", () => {
		cy.visit("http://localhost:5173");
		expect(true).to.equal(true);
		cy.get("#messages").should("exist");
		cy.get("[data-e2e=button-create-room]").should("have.text", "Create room");
		cy.get("[data-e2e=button-ping]").should("have.text", "ping");
	});
});
