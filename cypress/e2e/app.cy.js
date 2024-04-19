describe("Websocket Client Tests", () => {
	it("Application runs and UI is in place", () => {
		cy.visit(`/`);
		expect(true).to.equal(true);
		cy.get("h1").should("have.text", "DHBW WebSocket Client");
		cy.get("#messages").should("exist");
		cy.get("[data-e2e=button-create-room]").should("have.text", "Create room");
		cy.get("[data-e2e=button-ping]").should("have.text", "ping");
	});

	it("Create room", () => {
		cy.visit(`/`);

		cy.wait(1_000);

		cy.get("[data-e2e=button-leave-room]").should("be.disabled");
		cy.get("[data-e2e=button-roll-dice]").should("be.disabled");
		cy.get("[data-e2e=button-send]").should("be.disabled");
		cy.get("[data-e2e=button-create-room]").should("exist");

		cy.get("[data-e2e=button-create-room]").click();

		cy.get("[data-e2e=button-leave-room]").should("not.be.disabled");
		cy.get("[data-e2e=button-roll-dice]").should("not.be.disabled");
		cy.get("[data-e2e=button-send]").should("not.be.disabled");
	});

	it("Ping", () => {
		cy.visit(`/`);

		cy.wait(1_000);

		cy.get("[data-e2e=button-ping]").click();
	});

	it.only("Come in and find out", () => {
		cy.visit(`/`);

		cy.wait(1_000);

		cy.get("[data-e2e=button-leave-room]").should("be.disabled");
		cy.get("[data-e2e=button-roll-dice]").should("be.disabled");
		cy.get("[data-e2e=button-send]").should("be.disabled");

		cy.get("[data-e2e=button-create-room]").should("exist");
		cy.get("[data-e2e=button-create-room]").click();

		cy.get("[data-e2e=button-leave-room]").should("not.be.disabled");
		cy.get("[data-e2e=button-roll-dice]").should("not.be.disabled");
		cy.get("[data-e2e=button-send]").should("not.be.disabled");

		cy.get("[data-e2e=input-message]").type("Tagchen!");
		cy.get("[data-e2e=button-send]").click();
		cy.get("[data-e2e=input-message]").should("be.empty");

		cy.get("#messages").should("exist");
		cy.get("#messages").children("pre").first().should("contain.text", "Tagchen!");
	});
});
