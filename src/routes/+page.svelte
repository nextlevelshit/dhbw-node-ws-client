<script>
	import { onMount } from "svelte";
	import DiceBox from "@3d-dice/dice-box";
	import debug from "debug";

	const info = debug("app:i:page");
	const verbose = debug("app:v:page");

	let message = "";
	let passcode = "";
	let messages = [];
	let rooms = [];
	let clientId;
	let socket;
	let currentRoom;

	$: canRollDice = !!currentRoom;
	$: canLeaveRoom = !!currentRoom;
	$: canSendMessage = !!currentRoom;

	function connect() {
		socket = new WebSocket(`ws://${location.host}/ws`);

		socket.onopen = () => {
			info("WebSocket connection established.");
		};

		socket.onmessage = (message) => {
			const event = JSON.parse(message.data);
			info("Received message:", event.type);
			messages = [message.data, ...messages];

			if ("connected" === event.type || "rooms" === event.type) {
				rooms = event.rooms;
				clientId = event.clientId;
			}

			if ("joined-room" === event.type) {
				currentRoom = event.id;
				info("Joined room", event.id);
			}
		};

		socket.onclose = () => {
			info("WebSocket connection closed.");
		};
	}

	const sendMessage = () => {
		if (message.trim() !== "") {
			socket.send(`{"type":"message","message":"${message}"}`);
			message = "";
		}
	};

	const createRoom = () => {
		info("Create room");
		socket.send(`{"type":"create-room"}`);
	};

	const leaveRoom = () => {
		info("Leave room");
		socket.send(`{"type":"leave-room"}`);
		currentRoom = null;
	};

	const listRooms = () => {
		info("Create room");
		socket.send(`{"type":"rooms"}`);
	};

	const ping = () => {
		info("ping");
		socket.send(`{"type":"ping"}`);
	};

	const joinRoom = () => {
		info("Join room");
		if (passcode.trim() !== "") {
			socket.send(`{"type":"join-room","passcode":"${passcode}"}`);
			passcode = "";
		}
	};

	const joinRoomById = (roomId) => {
		info("Join room by id", roomId);
		socket.send(`{"type":"join-room-by-id", "id": "${roomId}"}`);
	};

	const compareDiceRolls = (from, to) => {
		return to.map((value, index) => from[index] > value);
	};

	const dice = new DiceBox("#dice", {
		assetPath: "/public/assets/",
		themeColor: "#ff006e",
		scale: 8,
		startingHeight: 3,
		mass: 3,
		gravity: 2,
		shadowTransparency: 0.8,
		linearDamping: 0.8,
		offscreen: false,
		onRollComplete: (event) => {
			const [from, to] = event;
			const fromRolls = from.rolls
				.map((roll) => roll.value)
				.toSorted()
				.reverse();
			const toRolls = to.rolls
				.map((roll) => roll.value)
				.toSorted()
				.reverse();
			const winMap = compareDiceRolls(fromRolls, toRolls);
			const won = winMap.filter(Boolean).length;
			const lost = winMap.length - won;
			info(`${won} win(s)`);
			info(`${lost} loss(es)`);
			messages = [`{"type": "roll-dice", "player": "from", rolls: [${fromRolls}] }`, ...messages];
			info("FROM Territory roll complete", fromRolls);
			verbose(clientId, from);
			messages = [`{"type": "roll-dice", "player": "to", rolls: [${toRolls}] }`, ...messages];
			info("TO Territory roll complete", toRolls);
			socket.send(`{"type":"roll-result","clientId":"${clientId}","won":${won},"lost":${lost}}`);
		}
	});

	const rollDice = async () => {
		await Promise.all([
			dice.roll("3d6"),
			dice.add("3d6", {
				themeColor: "#9651fd"
			})
		]);
	};

	const clearDice = () => {
		dice.clear();
	};

	onMount(async () => {
		connect();
		await dice.init();
		await rollDice();
	});
</script>

<main class="ml-16">
	<h1 class="text-xl font-semibold my-8">DHBW WebSocket Client</h1>
	<!-- region Dice Canvases -->
	<div class="w-full">
		<div id="dice" class="absolute inset-0 w-full"></div>
	</div>
	<!-- endregion -->
	<!-- region Messages -->
	<div class="fixed flex gap-8 bottom-20 top-20 left-10 right-10 rounded-md p-6">
		<div class="w-2/3" id="messages" >
			{#each messages as message}
				<pre class="text-pretty break-all font-mono">{message}</pre>
			{/each}
		</div>
		<div class="rooms w-1/3 flex flex-col gap-3">
			{#if rooms.length > 0}
				{#each rooms as room (room)}
					<button class="text-center bg-amber-200 rounded-md p-8 cursor-pointer" on:click={() => joinRoomById(room)}>{room}</button>
				{/each}
			{/if}
		</div>
	</div>
	<!-- endregion -->
	<!-- region Button Bar -->
	<section class="fixed rounded-lg shadow-lg bottom-0 right-0 p-6 bg-white my-8 grid grid-cols-2 gap-2 opacity-80 hover:opacity-100">
		<form class="flex gap-2" on:submit|preventDefault={canSendMessage && sendMessage}>
			<input
				bind:value={message}
				class:outline-violet-300={canSendMessage}
				class="px-4 py-2 rounded-md flex-1 border-2"
				data-e2e="input-message"
				disabled={!canSendMessage}
				type="text"
				placeholder="Type your message"
			/>
			<button disabled={!canSendMessage} class:bg-violet-300={canSendMessage} class:text-violet-800={canSendMessage} class="px-4 py-2 rounded-md outline-2 text-gray-500" data-e2e="button-send">Send</button>
		</form>
		<form class="flex gap-2" on:submit|preventDefault={joinRoom}>
			<input
				bind:value={passcode}
				type="text"
				minlength="4"
				maxlength="4"
				class="uppercase px-4 py-2 rounded-md flex-1 border-2 outline-teal-300"
				placeholder="XXXX"
			/>
			<button data-e2e="button-join" class="px-4 py-2 rounded-md bg-teal-300 text-teal-800">Join</button>
		</form>
		<button on:click={createRoom} data-e2e="button-create-room" class="px-4 py-2 rounded-md bg-violet-300 text-violet-800 outline-2">Create room</button>
		<button on:click={listRooms} data-e2e="button-list-rooms" class="px-4 py-2 rounded-md bg-teal-300 text-teal-800 outline-2">List rooms</button>
		<button
			on:click={canLeaveRoom && leaveRoom}
			disabled={!canLeaveRoom}
			class:bg-gray-800={canLeaveRoom}
			class:text-white={canLeaveRoom}
			class="px-4 py-2 rounded-md outline-2"
			data-e2e="button-leave-room"
		>Leave {currentRoom}
		</button>
		<button on:click={ping} data-e2e="button-ping" class="px-4 py-2 rounded-md bg-gray-800 text-white outline-2">ping</button>
		<button
			on:click={canRollDice && rollDice}
			disabled={!canRollDice}
			class:bg-indigo-300={canRollDice}
			class:text-indigo-800={canRollDice}
			class="px-4 py-2 rounded-md outline-2"
			data-e2e="button-roll-dice"
		>
			Roll dice
		</button>
		<button
			on:click={clearDice}
			class="px-4 py-2 rounded-md outline-2 bg-indigo-300 text-indigo-800"
			data-e2e="button-clear-dice"
		>
			Clear dice
		</button>
	</section>
	<!-- endregion -->
</main>
