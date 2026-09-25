const boardTiles = [
    { id: 0, name: "Go", type: "corner", x: 93.5, y: 93.5 },

    { id: 1, name: "Kelpie", type: "property", price: 600, image: "asset/monopoly/assets/food_cards/kelpie.png", x: 82.89, y: 93.5 },
    { id: 2, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 74.67, y: 93.5 },
    { id: 3, name: "Holi", type: "property", price: 400, image: "asset/monopoly/assets/festival cards/holi.png", x: 66.45, y: 93.5 },
    { id: 4, name: "Challenge Quiz", type: "challenge", x: 58.23, y: 93.5 },
    { id: 5, name: "Fenrir", type: "property", price: 200, image: "asset/monopoly/assets/food_cards/fenrir.png", x: 50.01, y: 93.5 },
    { id: 6, name: "Garuda", type: "property", price: 100, image: "asset/monopoly/assets/food_cards/garuda.png", x: 41.79, y: 93.5 },
    { id: 7, name: "Challenge Quiz", type: "challenge", x: 33.57, y: 93.5 },
    { id: 8, name: "Jormungandr", type: "property", price: 100, image: "asset/monopoly/assets/food_cards/jormungandr.png", x: 25.35, y: 93.5 },
    { id: 9, name: "Sphinx", type: "property", price: 120, image: "asset/monopoly/assets/food_cards/sphinx.png", x: 17.13, y: 93.5 },

    { id: 10, name: "Just Visiting / Jail", type: "corner", x: 6.5, y: 93.5 },

    { id: 11, name: "Phoenix", type: "property", price: 140, image: "asset/monopoly/assets/food_cards/phoenix.png", x: 6.5, y: 82.89 },
    { id: 12, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 6.5, y: 74.67 },
    { id: 13, name: "Ganesh Chaturthi", type: "property", price: 140, image: "asset/monopoly/assets/festival cards/ganesh_chaturthi.png", x: 6.5, y: 66.45 },
    { id: 14, name: "Dragon", type: "property", price: 160, image: "asset/monopoly/assets/food_cards/dragon.png", x: 6.5, y: 58.23 },
    { id: 15, name: "Challenge Quiz", type: "challenge", x: 6.5, y: 50.01 },
    { id: 16, name: "Tanabata", type: "property", price: 180, image: "asset/monopoly/assets/festival cards/tanabata.png", x: 6.5, y: 41.79 },
    { id: 17, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 6.5, y: 33.57 },
    { id: 18, name: "Samhain", type: "property", price: 180, image: "asset/monopoly/assets/festival cards/samhain.png", x: 6.5, y: 25.35 },
    { id: 19, name: "Eid Al Fitr", type: "property", price: 200, image: "asset/monopoly/assets/festival cards/eid.png", x: 6.5, y: 17.13 },

    { id: 20, name: "Free Parking", type: "corner", x: 6.5, y: 6.5 },

    { id: 21, name: "Chinese New Year", type: "property", price: 220, image: "asset/monopoly/assets/festival cards/chinese_new_year.png", x: 17.13, y: 6.5 },
    { id: 22, name: "Challenge Quiz", type: "challenge", x: 25.35, y: 6.5 },
    { id: 23, name: "Dia de los Muertos", type: "property", price: 220, image: "asset/monopoly/assets/festival cards/diadelos.png", x: 33.57, y: 6.5 },
    { id: 24, name: "Hindu Mythology", type: "property", price: 240, image: "asset/monopoly/assets/monument_cards/hindu.png", x: 41.79, y: 6.5 },
    { id: 25, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 50.01, y: 6.5 },
    { id: 26, name: "Norse Mythology", type: "property", price: 260, image: "asset/monopoly/assets/monument_cards/norse.png", x: 58.23, y: 6.5 },
    { id: 27, name: "Greek Mythology", type: "property", price: 260, image: "asset/monopoly/assets/monument_cards/greek.png", x: 66.45, y: 6.5 },
    { id: 28, name: "Challenge Quiz", type: "challenge", x: 74.67, y: 6.5 },
    { id: 29, name: "Chinese Mythology", type: "property", price: 280, image: "asset/monopoly/assets/monument_cards/chinese.png", x: 82.89, y: 6.5 },

    { id: 30, name: "Go To Jail", type: "corner", x: 93.5, y: 6.5 },

    { id: 31, name: "Japanese Mythology", type: "property", price: 300, image: "asset/monopoly/assets/monument_cards/japanese.png", x: 93.5, y: 17.13 },
    { id: 32, name: "Challenge Quiz", type: "challenge", x: 93.5, y: 25.35 },
    { id: 33, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 93.5, y: 33.57 },
    { id: 34, name: "Diwali", type: "property", price: 320, image: "asset/monopoly/assets/festival cards/diwali.png", x: 93.5, y: 41.79 },
    { id: 35, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 93.5, y: 50.01 },
    { id: 36, name: "Challenge Quiz", type: "challenge", x: 93.5, y: 58.23 },
    { id: 37, name: "Yoruba Mythology", type: "property", price: 350, image: "asset/monopoly/assets/monument_cards/yoruba.png", x: 93.5, y: 66.45 },
    { id: 38, name: "reward", type: "reward", image: "asset/monopoly/assets/reward/frame_11.png", x: 93.5, y: 74.67 },
    { id: 39, name: "Mesopotamian Mythology", type: "property", price: 400, image: "asset/monopoly/assets/monument_cards/Mesopotamian.png", x: 93.5, y: 82.89 }
];

const challengeImages = [
    "asset/monopoly/assets/challenge_questions/challenge_question-1.png",
    "asset/monopoly/assets/challenge_questions/challenge_question-2.png",
    "asset/monopoly/assets/challenge_questions/challenge_question-3.png",
    "asset/monopoly/assets/challenge_questions/challenge_question-4.png",
    "asset/monopoly/assets/challenge_questions/challenge_question-5.png",
    "asset/monopoly/assets/challenge_questions/challenge_question-6.png",
    "asset/monopoly/assets/challenge_questions/challenge_question.png",
];

const players = [
    { id: 0, name: "DX Player one", money: 1000, position: 0, avatar: "asset/game_character/char1.webp", properties: [] },
    { id: 1, name: "DX Player two", money: 1000, position: 0, avatar: "asset/game_character/char2.webp", properties: [] }
];

let challengeAnswers = {};
let currentPlayerIndex = 0;
let hasRolled = false;

function initBoard() {
    const boardEl = document.getElementById("board");

    players.forEach(p => {
        const pawn = document.createElement("div");
        pawn.className = "player-pawn";
        pawn.id = `pawn-${p.id}`;
        const avatar = document.createElement("img");
        avatar.src = p.avatar;
        avatar.alt = `${p.name} game_character`;
        pawn.appendChild(avatar);

        const offset = p.id === 0 ? -1 : 1;
        pawn.style.left = `calc(${boardTiles[0].x}% + ${offset}%)`;
        pawn.style.top = `calc(${boardTiles[0].y}% + ${offset}%)`;
        boardEl.appendChild(pawn);
    });
}

function updateUI() {
    updatePlayerNameDisplays();

    players.forEach(p => {

        const diceBox = document.getElementById(`dice-p${p.id}`);
        diceBox.classList.toggle("active", p.id === currentPlayerIndex && !hasRolled);

        const propsListEl = document.getElementById(`player-${p.id}-props-list`);
        propsListEl.innerHTML = "";

        p.properties.forEach(propName => {
            const propData = boardTiles.find(t => t.name === propName);
            const priceStr = propData && propData.price ? `M<span class="num">${propData.price}</span>` : "";

            const itemDiv = document.createElement("div");
            itemDiv.className = "prop-item";
            itemDiv.innerHTML = `<span>${propName}</span> <span>${priceStr}</span>`;
            propsListEl.appendChild(itemDiv);
        });

        const moneyDiv = document.createElement("div");
        moneyDiv.className = "prop-item";
        moneyDiv.style.fontWeight = "bold";
        moneyDiv.style.borderBottom = "1px solid rgba(0,0,0,0.1)";
        moneyDiv.style.marginBottom = "10px";
        moneyDiv.innerHTML = `<span>CASH</span> <span>M<span class="num">${p.money}</span></span>`;
        propsListEl.insertBefore(moneyDiv, propsListEl.firstChild);
    });
}

function updatePlayerNameDisplays() {
    players.forEach((player) => {
        document.querySelectorAll(`.player-name[data-player-id="${player.id}"]`).forEach((nameEl) => {
            if (document.activeElement !== nameEl && nameEl.textContent !== player.name) {
                nameEl.textContent = player.name;
            }
        });

        document.querySelectorAll(`.edit-name-button[data-player-id="${player.id}"]`).forEach((button) => {
            button.setAttribute("aria-label", `Edit ${player.name} name`);
        });

        const avatar = document.querySelector(`#pawn-${player.id} img`);
        if (avatar) {
            avatar.alt = `${player.name} game_character`;
        }
    });
}

function commitPlayerName(nameEl) {
    const playerId = Number(nameEl.dataset.playerId);
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const nextName = nameEl.textContent.trim().replace(/\s+/g, " ");
    player.name = nextName || player.name;
    updatePlayerNameDisplays();
}

function setupEditablePlayerNames() {
    document.querySelectorAll(".player-name").forEach((nameEl) => {
        nameEl.addEventListener("focus", () => {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(nameEl);
            selection.removeAllRanges();
            selection.addRange(range);
        });

        nameEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                nameEl.blur();
            }
        });

        nameEl.addEventListener("blur", () => commitPlayerName(nameEl));
    });

    document.querySelectorAll(".edit-name-button").forEach((button) => {
        button.addEventListener("click", () => {
            const nameEl = document.querySelector(`.player-name[data-player-id="${button.dataset.playerId}"]`);
            if (nameEl) {
                nameEl.focus();
            }
        });
    });
}

function drawDiceFace(playerIndex, value) {
    const face = document.getElementById(`dice-face-p${playerIndex}`);
    face.innerHTML = "";
    const dotsMap = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8]
    };
    for (let i = 0; i < 9; i++) {
        const d = document.createElement("div");
        d.className = "dot";
        if (dotsMap[value].includes(i)) d.classList.add("filled");
        face.appendChild(d);
    }
}

function rollDice(playerIndex) {
    if (hasRolled || playerIndex !== currentPlayerIndex) return;

    const total = Math.floor(Math.random() * 6) + 1;

    drawDiceFace(playerIndex, total);

    const p = players[currentPlayerIndex];
    let stepsTaken = 0;

    hasRolled = true;
    updateUI();

    const moveInterval = setInterval(() => {
        p.position = (p.position + 1) % 40;

        const pawn = document.getElementById(`pawn-${p.id}`);
        const tile = boardTiles[p.position];
        const offset = p.id === 0 ? -1 : 1;
        pawn.style.left = `calc(${tile.x}% + ${offset}%)`;
        pawn.style.top = `calc(${tile.y}% + ${offset}%)`;

        stepsTaken++;

        if (stepsTaken >= total) {
            clearInterval(moveInterval);
            updateUI();
            setTimeout(() => {
                handleTileAction(p, boardTiles[p.position]);
            }, 400);
        }
    }, 400);
}

function handleTileAction(player, tile) {
    if (tile.type === "property") {
        const owner = players.find(p => p.properties.includes(tile.name));

        if (!owner) {

            showModal(tile.name, tile.image, [
                { text: `Buy for M${tile.price}`, class: "btn-primary", onClick: () => buyProperty(player, tile) },
                { text: "Pass", class: "btn-secondary", onClick: closeModal }
            ]);
        } else if (owner.id !== player.id) {

            const rent = Math.floor(tile.price * 0.5);
            showModal(tile.name, tile.image, [
                { text: `Pay Rent M${rent} to ${owner.name}`, class: "btn-primary", onClick: () => payRent(player, owner, rent) }
            ]);
        }
    } else if (tile.type === "reward") {
        showModal("reward", tile.image, [
            { text: "Collect M100", class: "btn-primary", onClick: () => { player.money += 100; closeModal(); updateUI(); } }
        ]);
    } else if (tile.type === "challenge") {

        const randomImg = challengeImages[Math.floor(Math.random() * challengeImages.length)];
        const correctOpt = challengeAnswers[randomImg];

        const makeChoice = (choice) => {
            if (choice === correctOpt) {
                alert(`Correct! You earned M100.`);
                player.money += 100;
            } else {
                alert(`Wrong! The correct answer was Option ${correctOpt}.`);
            }
            document.getElementById("image-click-zones").style.display = "none";
            closeModal();
            updateUI();
        };

        document.querySelectorAll('.click-zone').forEach(zone => {
            zone.onclick = () => makeChoice(zone.getAttribute('data-choice'));
        });

        document.getElementById("image-click-zones").style.display = "block";

        showModal("Challenge Quiz", randomImg, []);
    } else if (tile.id === 30) {

        showModal("Go To Jail", null, [
            { text: "Oh no!", class: "btn-primary", onClick: () => {
                player.position = 10;
                const pawn = document.getElementById(`pawn-${player.id}`);
                const jtile = boardTiles[10];
                const offset = player.id === 0 ? -1 : 1;
                pawn.style.left = `calc(${jtile.x}% + ${offset}%)`;
                pawn.style.top = `calc(${jtile.y}% + ${offset}%)`;
                closeModal();
            }}
        ]);
    } else if (tile.id === 0) {
         showModal("Passed GO", null, [
            { text: "Collect M200", class: "btn-primary", onClick: () => { player.money += 200; closeModal(); updateUI(); } }
        ]);
    } else {

        setTimeout(endTurn, 1500);
    }
}

function buyProperty(player, tile) {
    if (player.money >= tile.price) {
        player.money -= tile.price;
        player.properties.push(tile.name);
        closeModal();
        updateUI();
    } else {
        alert("Not enough money!");
    }
}

function payRent(payer, payee, amount) {
    payer.money -= amount;
    payee.money += amount;
    closeModal();
    updateUI();
}

function showModal(title, imageSrc, actions) {
    const modal = document.getElementById("card-modal");
    const modalContent = modal.querySelector('.modal-content');

    modal.classList.add("hidden");

    const titleEl = document.getElementById("modal-title");
    titleEl.innerHTML = title.replace(/(\d+)/g, '<span class="num">$1</span>');

    const actionsEl = document.getElementById("modal-actions");
    actionsEl.innerHTML = "";

    actions.forEach(act => {
        const btn = document.createElement("button");
        btn.className = `btn ${act.class}`;
        btn.innerHTML = act.text.replace(/(\d+)/g, '<span class="num">$1</span>');
        btn.onclick = act.onClick;
        actionsEl.appendChild(btn);
    });

    const imgEl = document.getElementById("modal-image");

    if (imageSrc) {

        titleEl.style.display = "none";

        if (title === "Challenge Quiz") {
            modalContent.style.maxWidth = "800px";
            modalContent.style.padding = "0";
            modalContent.style.background = "transparent";
            modalContent.style.border = "none";
            modalContent.style.boxShadow = "none";
            imgEl.style.width = "100%";
        } else if (title === "reward") {
            modalContent.style.maxWidth = "400px";
            modalContent.style.padding = "30px";
            modalContent.style.background = "var(--bg-color)";
            modalContent.style.border = "1px solid var(--border-color)";
            modalContent.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)";
            imgEl.style.width = "60%";
        } else {

            modalContent.style.maxWidth = "700px";
            modalContent.style.padding = "30px";
            modalContent.style.background = "var(--bg-color)";
            modalContent.style.border = "1px solid var(--border-color)";
            modalContent.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)";
            imgEl.style.width = "100%";
        }

        imgEl.onload = () => {
            imgEl.style.display = "block";
            modal.classList.remove("hidden");
        };

        imgEl.onerror = () => {
            imgEl.style.display = "none";
            modal.classList.remove("hidden");
        };

        imgEl.src = imageSrc;
    } else {
        titleEl.style.display = "block";
        imgEl.style.display = "none";
        modalContent.style.maxWidth = "400px";
        modalContent.style.padding = "30px";
        modalContent.style.background = "var(--bg-color)";
        modalContent.style.border = "1px solid var(--border-color)";
        modalContent.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)";
        modal.classList.remove("hidden");
    }
}

function closeModal() {
    document.getElementById("card-modal").classList.add("hidden");
    document.getElementById("image-click-zones").style.display = "none";
    setTimeout(endTurn, 1500);
}

function endTurn() {
    if (!hasRolled) return;

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    hasRolled = false;

    updateUI();
}

document.getElementById("dice-p0").addEventListener("click", () => rollDice(0));
document.getElementById("dice-p1").addEventListener("click", () => rollDice(1));

window.onload = () => {
    fetch('answers.json')
        .then(r => r.json())
        .then(data => { challengeAnswers = data; });

    initBoard();
    setupEditablePlayerNames();
    drawDiceFace(0, 6);
    drawDiceFace(1, 6);
    updateUI();
};
