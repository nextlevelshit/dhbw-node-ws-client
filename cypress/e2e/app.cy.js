describe("Websocket Client Tests", () => {
	it("Application runs and UI is in place", () => {
		cy.visit(`/`);
		expect(true).to.equal(true);
		cy.get("h1").should("have.text", "DHBW WebSocket Client");
		cy.get("#messages").should("exist");
		cy.get("[data-e2e=button-create-room]").should("have.text", "Create room");
		cy.get("[data-e2e=button-ping]").should("have.text", "ping");
	});
});
