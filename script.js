const library =[
    { q: "why is my poop", a: ["green", "black", "floating", "spicy", "blue", "so big"] },
    { q: "is it illegal to", a:["own a monkey", "drive barefoot", "kill a praying mantis", "collect rainwater", "sleep in your car", "marry your cousin"] },
    { q: "i accidentally ate", a:["mold", "raw chicken", "a bug", "glass", "plastic", "a magnet"] },
    { q: "why do dogs", a:["eat grass", "stare at you", "howl", "lick you", "eat poop", "sigh"] },
    { q: "how to hide a", a:["dead body", "hickey", "fart", "piercing", "pregnancy", "drunk"] },
    { q: "can i eat", a:["raw salmon", "pumpkin seeds", "dry ice", "acorns", "raw eggs", "snow"] },
    { q: "why does my cat", a:["bite me", "stare at me", "knead", "meow so much", "lick me", "purr"] },
    { q: "what happens if you microwave", a:["aluminum foil", "a phone", "nothing", "an egg", "metal", "grapes"] },
    { q: "my husband thinks he is", a:["always right", "a woman", "god", "funny", "a cat", "sick"] },
    { q: "i think my child is", a:["a psychopath", "gifted", "autistic", "a genius", "possessed", "colorblind"] },
    { q: "never put", a:["water on a grease fire", "aluminum foil in the microwave", "metal in the microwave", "a battery in your mouth", "your fingers in a socket", "q tips in your ear"] },
    { q: "why are babies", a:["so cute", "born without kneecaps", "so annoying", "always crying", "so expensive", "so strong"] },
    { q: "is my cat trying to", a:["kill me", "tell me something", "eat me", "protect me", "mate with me", "annoy me"] },
    { q: "how much is a", a:["kidney worth", "bar of gold worth", "polar bear", "private jet", "lamborghini", "gallon of gas"] },
    { q: "can you die from", a:["a broken heart", "drinking too much water", "eating too much", "holding your breath", "lack of sleep", "eating raw chicken"] },
    { q: "why do people", a: ["cheat", "lie", "smoke", "yawn", "snore", "hate me"] },
    { q: "where can i buy a", a:["monkey", "capybara", "sloth", "penguin", "fox", "duck"] },
    { q: "how to legally", a:["change your name", "not pay taxes", "make money", "drop out of school", "emancipate yourself", "disappear"] },
    { q: "is it normal to", a:["talk to yourself", "eat your boogers", "sweat a lot", "be tired all the time", "have imaginary friends", "cry every day"] },
    { q: "why does it hurt when i", a:["pee", "breathe", "swallow", "poop", "cough", "blink"] }
];

let teams =[];
let currentTeamIndex = 0;
let currentQuestionIndex = 0;
let currentQuestion = {};
let revealedAnswers =[];
let strikes = 0;

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const queryPrefix = document.getElementById('query-prefix');
const guessInput = document.getElementById('guess-input');
const answersBoard = document.getElementById('answers-board');
const scoreboard = document.getElementById('scoreboard');
const strikesContainer = document.getElementById('strikes-container');
const guessBtn = document.getElementById('guess-btn');
const passBtn = document.getElementById('pass-btn');
const nextRoundBtn = document.getElementById('next-round-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame(numTeams) {
    teams = Array.from({ length: numTeams }, (_, i) => ({ id: i + 1, score: 0 }));
    shuffle(library);
    currentQuestionIndex = 0;
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    loadRound();
}

function loadRound() {
    currentQuestion = library[currentQuestionIndex];
    revealedAnswers = Array(currentQuestion.a.length).fill(false);
    strikes = 0;
    strikesContainer.textContent = '';
    queryPrefix.textContent = currentQuestion.q + " ";
    guessInput.value = '';
    guessInput.focus();
    renderBoard();
    renderScores();
}

function getPoints(index, total) {
    return (total - index) * 1000;
}

function renderBoard() {
    answersBoard.innerHTML = '';
    currentQuestion.a.forEach((ans, index) => {
        const li = document.createElement('li');
        const points = getPoints(index, currentQuestion.a.length);
        if (revealedAnswers[index]) {
            li.innerHTML = `<span>${ans}</span><span class="points">${points}</span>`;
            li.classList.remove('hidden-answer');
        } else {
            li.innerHTML = `<span>?</span><span class="points">${points}</span>`;
            li.classList.add('hidden-answer');
        }
        answersBoard.appendChild(li);
    });
}

function renderScores() {
    scoreboard.innerHTML = '';
    teams.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'team-score';
        if (index === currentTeamIndex) div.classList.add('active-team');
        div.textContent = `Team ${team.id}: ${team.score}`;
        scoreboard.appendChild(div);
    });
}

function handleGuess() {
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) return;

    let foundIndex = -1;
    currentQuestion.a.forEach((ans, index) => {
        if (ans.toLowerCase() === guess && !revealedAnswers[index]) {
            foundIndex = index;
        }
    });

    if (foundIndex !== -1) {
        revealedAnswers[foundIndex] = true;
        teams[currentTeamIndex].score += getPoints(foundIndex, currentQuestion.a.length);
        guessInput.value = '';
        renderBoard();
        renderScores();
        checkRoundOver();
    } else {
        strikes++;
        strikesContainer.textContent = 'X '.repeat(strikes);
        guessInput.value = '';
        if (strikes >= 3) {
            nextTurn();
            strikes = 0;
            strikesContainer.textContent = '';
        }
    }
    guessInput.focus();
}

function nextTurn() {
    currentTeamIndex = (currentTeamIndex + 1) % teams.length;
    renderScores();
}

function checkRoundOver() {
    if (revealedAnswers.every(v => v === true)) {
        setTimeout(() => {
            alert("Board cleared! Moving to next round.");
            handleNextRound();
        }, 500);
    }
}

function handleNextRound() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= library.length) {
        alert("Game Over! Check final scores.");
        location.reload();
    } else {
        nextTurn();
        loadRound();
    }
}

guessBtn.addEventListener('click', handleGuess);
passBtn.addEventListener('click', () => {
    strikes = 0;
    strikesContainer.textContent = '';
    nextTurn();
});
nextRoundBtn.addEventListener('click', () => {
    revealedAnswers = Array(currentQuestion.a.length).fill(true);
    renderBoard();
    setTimeout(handleNextRound, 2000);
});
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});
