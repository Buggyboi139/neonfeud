const library =[
    { q: "why does my dog", a: ["eat grass", "lick me", "stare at me", "sigh"], d: ["do backflips", "speak english", "pay taxes", "drive"] },
    { q: "is it illegal to", a:["drive barefoot", "collect rainwater", "kill a praying mantis", "own a monkey"], d:["eat an orange in the bath", "sneeze with eyes open", "walk backwards", "sleep all day"] },
    { q: "i accidentally ate", a:["mold", "raw chicken", "plastic", "glass"], d:["a car", "my homework", "a ghost", "the sun"] },
    { q: "how to hide a", a:["hickey", "dead body", "fart", "double chin"], d:["stolen car", "million dollars", "dinosaur", "spaceship"] },
    { q: "can i eat", a:["raw salmon", "dry ice", "pumpkin seeds", "snow"], d: ["lava", "clouds", "uranium", "bricks"] },
    { q: "what happens if you microwave", a:["aluminum foil", "an egg", "grapes", "a phone"], d: ["a microwave", "water", "air", "a ghost"] },
    { q: "my husband thinks he is", a:["always right", "a woman", "a cat", "funny"], d: ["a potato", "an alien", "the president", "invisible"] },
    { q: "never put", a:["metal in the microwave", "water on a grease fire", "q tips in your ear", "a battery in your mouth"], d:["ketchup on a hotdog", "shoes on a bed", "pineapple on pizza", "milk before cereal"] },
    { q: "why are babies", a: ["so cute", "always crying", "born without kneecaps", "so expensive"], d:["so tall", "glowing", "magnetic", "telepathic"] },
    { q: "is my cat trying to", a: ["kill me", "tell me something", "protect me", "mate with me"], d: ["build a bomb", "hack my wifi", "steal my identity", "fly"] },
    { q: "why do people", a: ["cheat", "smoke", "lie", "yawn"], d:["exist", "eat rocks", "turn purple", "lay eggs"] },
    { q: "where can i buy a", a: ["monkey", "capybara", "sloth", "penguin"], d:["dragon", "time machine", "human soul", "unicorn"] },
    { q: "how to legally", a: ["change your name", "not pay taxes", "make money", "drop out of school"], d:["rob a bank", "steal a car", "become a bird", "fight a bear"] },
    { q: "is it normal to", a:["talk to yourself", "sweat a lot", "eat your boogers", "cry every day"], d:["breathe fire", "have three eyes", "eat dirt", "bark at cars"] },
    { q: "why does it hurt when i", a:["pee", "breathe", "swallow", "poop"], d:["think", "exist", "look at math", "sleep"] },
    { q: "why is my poop", a:["green", "black", "floating", "spicy"], d: ["glowing", "screaming", "invisible", "square"] },
    { q: "how much is a", a:["kidney worth", "bar of gold", "polar bear", "private jet"], d: ["human life", "single potato", "cloud", "high five"] },
    { q: "can you die from", a:["a broken heart", "drinking too much water", "holding your breath", "eating too much"], d:["being too cool", "doing homework", "extreme boredom", "eating vegetables"] },
    { q: "i think my child is", a:["a psychopath", "gifted", "autistic", "a genius"], d:["a vampire", "an alien", "an undercover cop", "a robot"] },
    { q: "why does my eye", a:["twitch", "hurt", "itch", "water"], d:["change color", "fall out", "squeak", "shoot lasers"] },
    { q: "what to do if you", a:["swallow a magnet", "get stung by a bee", "break a toe", "find a bat in your house"], d:["turn invisible", "meet an alien", "forget your name", "fall into a volcano"] },
    { q: "why do cats", a: ["purr", "knead", "hate water", "bring you dead animals"], d: ["speak latin", "explode", "lay eggs", "pay rent"] },
    { q: "can a human", a:["mate with an animal", "survive without water", "outrun a bear", "drink pig blood"], d: ["fly", "breathe underwater naturally", "lay an egg", "photosynthesize"] },
    { q: "is the earth", a:["flat", "hollow", "dying", "getting hotter"], d: ["a triangle", "made of cheese", "a simulation run by cats", "a donut"] },
    { q: "do men", a:["have periods", "get hot flashes", "like to cuddle", "have a biological clock"], d:["lay eggs", "have feelings", "exist", "shed their skin"] },
    { q: "why did they cancel", a:["firefly", "manifest", "the owl house", "mindhunter"], d: ["the sun", "gravity", "sleep", "the alphabet"] },
    { q: "am i allergic to", a:["water", "the sun", "my dog", "weed"], d: ["math", "my boss", "paying taxes", "waking up"] },
    { q: "how to survive a", a:["bear attack", "nuclear war", "plane crash", "zombie apocalypse"], d: ["paper cut", "bad haircut", "boring conversation", "monday"] },
    { q: "why is the sky", a:["blue", "orange today", "purple", "falling"], d: ["green", "loud", "crunchy", "angry"] },
    { q: "is it illegal to own a", a: ["fox", "raccoon", "squirrel", "kangaroo"], d:["cloud", "ghost", "star", "imaginary friend"] },
    { q: "i swallowed a", a: ["penny", "fly", "toothpick", "piece of glass"], d:["live swordfish", "entire car", "skyscraper", "cloud"] },
    { q: "why is my pee", a:["neon yellow", "red", "cloudy", "smelling like coffee"], d:["carbonated", "solid", "musical", "glowing in the dark"] },
    { q: "how to get rid of", a: ["hiccups", "a hickey", "fruit flies", "bed bugs"], d:["a curse", "a ghost roommate", "my annoying neighbor", "bad karma"] },
    { q: "do ghosts", a: ["exist", "sleep", "eat", "feel cold"], d:["pay taxes", "use smartphones", "hate garlic", "have passports"] },
    { q: "why do men", a: ["ghost", "pull away", "stare", "cheat"], d:["sparkle", "spontaneously combust", "bark", "photosynthesize"] },
    { q: "how to tell if your dog is", a: ["happy", "sick", "in pain", "dying"], d:["a secret agent", "judging you", "plotting revenge", "an alien"] },
    { q: "why is my tongue", a: ["white", "yellow", "sore", "black"], d:["vibrating", "speaking french", "detachable", "transparent"] },
    { q: "what happens if you eat", a: ["moldy bread", "raw pork", "silica gel", "a weed brownie"], d:["a cloud", "the mona lisa", "plutonium", "a black hole"] },
    { q: "can i put a", a:["glass bowl in the oven", "yeti in the dishwasher", "paper plate in the microwave", "car seat in the washing machine"], d:["baby in the dishwasher", "ghost in a jar", "cloud in the fridge", "dream in a box"] },
    { q: "why do pregnant women", a: ["crave ice", "waddle", "snore", "cry so much"], d: ["glow in the dark", "float", "speak ancient sumerian", "turn purple"] }
];

let teams =[];
let currentTeamIndex = 0;
let currentQuestionIndex = 0;
let currentQuestion = {};
let revealedAnswers =[];
let strikes = 0;
let isSinglePlayer = false;

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const queryPrefix = document.getElementById('query-prefix');
const answersBoard = document.getElementById('answers-board');
const choicesGrid = document.getElementById('choices-grid');
const scoreboard = document.getElementById('scoreboard');
const strikesContainer = document.getElementById('strikes-container');
const nextRoundBtn = document.getElementById('next-round-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] =[array[j], array[i]];
    }
}

function startGame(numTeams) {
    isSinglePlayer = (numTeams === 1);
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
    queryPrefix.textContent = currentQuestion.q + "...";
    nextRoundBtn.style.display = 'none';
    
    renderBoard();
    renderChoices();
    renderScores();
}

function getPoints(index) {
    return (currentQuestion.a.length - index) * 1000;
}

function renderBoard() {
    answersBoard.innerHTML = '';
    currentQuestion.a.forEach((ans, index) => {
        const li = document.createElement('li');
        const points = getPoints(index);
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

function renderChoices() {
    choicesGrid.innerHTML = '';
    let combinedChoices =[...currentQuestion.a, ...currentQuestion.d];
    shuffle(combinedChoices);

    combinedChoices.forEach(choiceText => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choiceText;
        btn.onclick = () => handleChoice(btn, choiceText);
        choicesGrid.appendChild(btn);
    });
}

function renderScores() {
    scoreboard.innerHTML = '';
    if (isSinglePlayer) {
        const div = document.createElement('div');
        div.className = 'team-score active-team';
        div.textContent = `Score: ${teams[0].score}`;
        scoreboard.appendChild(div);
    } else {
        teams.forEach((team, index) => {
            const div = document.createElement('div');
            div.className = 'team-score';
            if (index === currentTeamIndex) div.classList.add('active-team');
            div.textContent = `Team ${team.id}: ${team.score}`;
            scoreboard.appendChild(div);
        });
    }
}

function handleChoice(btn, choiceText) {
    const foundIndex = currentQuestion.a.indexOf(choiceText);

    if (foundIndex !== -1) {
        btn.classList.add('correct');
        revealedAnswers[foundIndex] = true;
        teams[currentTeamIndex].score += getPoints(foundIndex);
        renderBoard();
        renderScores();
        checkRoundOver(true);
    } else {
        btn.classList.add('wrong');
        strikes++;
        strikesContainer.textContent = 'X '.repeat(strikes);
        if (strikes >= 3) {
            disableAllChoices();
            checkRoundOver(false);
        } else if (!isSinglePlayer) {
            nextTurn();
        }
    }
}

function nextTurn() {
    if (!isSinglePlayer) {
        currentTeamIndex = (currentTeamIndex + 1) % teams.length;
        renderScores();
    }
}

function disableAllChoices() {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');
}

function checkRoundOver(wasCorrect) {
    const allRevealed = revealedAnswers.every(v => v === true);
    if (allRevealed || strikes >= 3) {
        disableAllChoices();
        if (allRevealed) {
            setTimeout(() => {
                nextRoundBtn.style.display = 'block';
            }, 500);
        } else {
            revealedAnswers = Array(currentQuestion.a.length).fill(true);
            setTimeout(() => {
                renderBoard();
                nextRoundBtn.style.display = 'block';
                if (!isSinglePlayer) nextTurn();
            }, 1000);
        }
    }
}

nextRoundBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex >= library.length) {
        alert("Game Over! Check your final score.");
        location.reload();
    } else {
        if (!isSinglePlayer) {
            currentTeamIndex = (currentTeamIndex + 1) % teams.length;
        }
        loadRound();
    }
});
