// ==========================================
// PWA Service Worker Registration
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered!', registration);
    }).catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

// ==========================================
// Game Engine
// ==========================================
const sfx = {
    click: new Audio('audio/click.mp3'),
    ding: new Audio('audio/ding.mp3'),
    buzzer: new Audio('audio/buzzer.mp3'),
    chaching: new Audio('audio/chaching.mp3')
};

function playSfx(name) {
    if(sfx[name]) {
        sfx[name].currentTime = 0;
        sfx[name].play().catch(e => {});
    }
}

let bank = parseInt(localStorage.getItem('rf_coins')) || 0;
let unlockedPacks = JSON.parse(localStorage.getItem('rf_unlocks')) ||['wild_web', 'worldbuilder_history', 'measure_google_once'];

let allPacks = [];
let selectedPack = null;
let activeQuestions =[];
let teams =[];
let currentTeamIdx = 0;
let currentQIdx = 0;

let strikes = 0;
let roundBank = 0;
let currentAnswers =[];
let revealedCount = 0;
let isCoop = false;
let isStealMode = false;
let totalPossibleReveals = 0;
let totalActualReveals = 0;

window.onload = async () => {
    updateBankUI();
    try {
        const response = await fetch('packs.json');
        allPacks = await response.json();
    } catch (e) {
        alert("Error loading packs.json! Make sure it's in the same folder and you are running a local server.");
    }
};

function updateBankUI() {
    document.getElementById('menu-bank').textContent = `💰 ${bank} Coins`;
    document.getElementById('store-bank').textContent = `💰 ${bank} Coins`;
    localStorage.setItem('rf_coins', bank);
    localStorage.setItem('rf_unlocks', JSON.stringify(unlockedPacks));
}

function showScreen(id) {
    playSfx('click');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openAbout() {
    playSfx('click');
    document.getElementById('about-modal').classList.add('active');
}

function closeAbout() {
    playSfx('click');
    document.getElementById('about-modal').classList.remove('active');
}

function quitGame() {
    playSfx('click');
    if(confirm("Are you sure you want to quit? You will lose any points banked this round.")) {
        showScreen('menu-screen');
    }
}

function goToStore() {
    showScreen('store-screen');
    const container = document.getElementById('store-container');
    container.innerHTML = '';
    
    allPacks.forEach(pack => {
        const isOwned = unlockedPacks.includes(pack.id) || pack.unlockedByDefault;
        if(pack.unlockedByDefault && !unlockedPacks.includes(pack.id)) unlockedPacks.push(pack.id);

        let icon = pack.type === 'letter_pool' ? '🅰️' : '🔍';

        const card = document.createElement('div');
        card.className = 'pack-card';
        card.innerHTML = `
            <div>
                <h3>${icon} ${pack.name}</h3>
                <p>${pack.description}</p>
                <p style="color:var(--purple-neon)">${pack.questions.length} Questions</p>
            </div>
            <button class="buy-btn ${isOwned ? 'owned' : ''}" onclick="buyPack('${pack.id}', ${pack.price})">
                ${isOwned ? 'Owned' : 'Buy: 💰 ' + pack.price}
            </button>
        `;
        container.appendChild(card);
    });
    updateBankUI();
}

function buyPack(id, price) {
    if(bank >= price) {
        bank -= price;
        unlockedPacks.push(id);
        playSfx('chaching');
        goToStore();
    } else {
        playSfx('buzzer');
        alert("Not enough coins!");
    }
}

function goToPackSelect() {
    showScreen('setup-screen');
    resetPackSelection();
    const pContainer = document.getElementById('pack-select-container');
    pContainer.innerHTML = '';

    allPacks.forEach(pack => {
        if(unlockedPacks.includes(pack.id) || pack.unlockedByDefault) {
            const btn = document.createElement('button');
            let icon = pack.type === 'letter_pool' ? '🅰️' : '🔍';
            btn.textContent = `${icon} ${pack.name}`;
            btn.onclick = () => {
                playSfx('click');
                selectedPack = pack;
                document.getElementById('pack-select-container').style.display = 'none';
                document.getElementById('step-1-title').style.display = 'none';
                document.getElementById('selected-pack-display').textContent = `Pack: ${pack.name}`;
                document.getElementById('team-selection-area').style.display = 'block';
            };
            pContainer.appendChild(btn);
        }
    });
}

function resetPackSelection() {
    selectedPack = null;
    document.getElementById('pack-select-container').style.display = 'flex';
    document.getElementById('step-1-title').style.display = 'block';
    document.getElementById('team-selection-area').style.display = 'none';
}

function startGame(numTeams) {
    playSfx('click');
    isCoop = (numTeams === 1);
    teams = Array.from({length: numTeams}, (_, i) => ({ id: i+1, score: 0 }));
    
    activeQuestions = [...selectedPack.questions].sort(() => 0.5 - Math.random()).slice(0, 5);
    totalPossibleReveals = 0;
    
    if (selectedPack.type === 'letter_pool') {
        activeQuestions.forEach(q => {
            let uniqueLetters = new Set(q.a.toUpperCase().split(''));
            totalPossibleReveals += uniqueLetters.size;
        });
    } else {
        totalPossibleReveals = activeQuestions.length * 4;
    }
    
    totalActualReveals = 0;
    currentQIdx = 0;
    showScreen('game-screen');
    setupRound();
}

function getDecoyLetters(excludeLetters, totalTiles) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const available = alphabet.filter(l => !excludeLetters.includes(l));
    const shuffled = available.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, totalTiles - excludeLetters.length);
}

function getFeudDistractors(currentQuestion, pack) {
    let allValidAnswers =[];
    pack.questions.forEach(q => {
        if(q.q !== currentQuestion.q) allValidAnswers.push(...q.a);
    });
    let uniqueDistractors = [...new Set(allValidAnswers)].sort(() => 0.5 - Math.random());
    return uniqueDistractors.slice(0, 4);
}

function setupRound() {
    let qData = activeQuestions[currentQIdx];
    document.getElementById('question-text').textContent = qData.q + (qData.q.endsWith('?') ? "" : "...");
    document.getElementById('strikes-display').textContent = '';
    document.getElementById('next-round-btn').style.display = 'none';
    document.getElementById('give-up-btn').style.display = 'block';
    document.getElementById('steal-banner').style.display = 'none';
    
    strikes = 0; roundBank = 0; revealedCount = 0; isStealMode = false;
    
    const choices = document.getElementById('choices-container');
    choices.innerHTML = '';

    if (selectedPack.type === 'letter_pool') {
        document.getElementById('board-container').style.display = 'none';
        document.getElementById('letter-board-container').style.display = 'flex';
        
        let targetWord = qData.a.toUpperCase();
        let uniqueLetters =[...new Set(targetWord.split(''))].filter(c => c.trim() !== '');
        currentAnswers = uniqueLetters.map(l => ({ text: l, revealed: false, points: 50 }));
        
        const lbc = document.getElementById('letter-board-container');
        lbc.innerHTML = '';
        targetWord.split('').forEach((char, idx) => {
            let div = document.createElement('div');
            if (char === ' ' || char === '-') {
                div.style.width = '3vmin'; div.style.border = 'none';
            } else {
                div.className = 'letter-blank hidden-letter';
                div.id = `blank-${idx}`;
                div.textContent = char;
                div.dataset.char = char;
            }
            lbc.appendChild(div);
        });
        
        let decoys = getDecoyLetters(uniqueLetters, 16);
        let combinedChoices = [...uniqueLetters, ...decoys].sort(() => 0.5 - Math.random());
        
        combinedChoices.forEach(letter => {
            let btn = document.createElement('button');
            btn.className = 'choice-btn letter-btn';
            btn.textContent = letter;
            btn.onclick = () => processLetterChoice(btn, letter, uniqueLetters.length);
            choices.appendChild(btn);
        });
        
    } else {
        document.getElementById('board-container').style.display = 'grid';
        document.getElementById('letter-board-container').style.display = 'none';
        
        const ptsArray =[100, 75, 50, 25];
        currentAnswers = qData.a.map((text, index) => ({ text: text, points: ptsArray[index], revealed: false }));

        const board = document.getElementById('board-container');
        board.innerHTML = '';
        currentAnswers.forEach((ans, idx) => {
            let row = document.createElement('div');
            row.className = 'board-row hidden-content';
            row.id = `row-${idx}`;
            row.innerHTML = `<div class="rank">${idx + 1}</div><div class="ans-text">${ans.text}</div><div class="ans-pts">${ans.points}</div>`;
            board.appendChild(row);
        });

        let distractors = getFeudDistractors(qData, selectedPack);
        let combinedChoices = [...qData.a, ...distractors].sort(() => 0.5 - Math.random());
        
        combinedChoices.forEach(choice => {
            let btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => processFeudChoice(btn, choice);
            choices.appendChild(btn);
        });
    }

    renderScores();
}

function renderScores() {
    const sb = document.getElementById('scoreboard');
    sb.innerHTML = '';
    
    if (isCoop) {
        let pill = document.createElement('div');
        pill.className = 'score-pill active-team';
        pill.textContent = `SCORE: ${teams[0].score + roundBank}`;
        sb.appendChild(pill);
    } else {
        teams.forEach((t, i) => {
            let pill = document.createElement('div');
            let statusClass = '';
            if(i === currentTeamIdx && !isStealMode) statusClass = 'active-team';
            if(i === currentTeamIdx && isStealMode) statusClass = 'stealing-team';
            
            pill.className = `score-pill ${statusClass}`;
            let displayScore = t.score;
            if (statusClass !== '') displayScore += ` (+${roundBank} Bank)`;
            pill.textContent = `TEAM ${t.id}: ${displayScore}`;
            sb.appendChild(pill);
        });
    }
}

function processFeudChoice(btn, choiceText) {
    if (strikes >= 3 && !isStealMode) return; 
    
    let matchIdx = currentAnswers.findIndex(a => a.text === choiceText);

    if (matchIdx !== -1 && !currentAnswers[matchIdx].revealed) {
        playSfx('ding');
        currentAnswers[matchIdx].revealed = true;
        revealedCount++; totalActualReveals++;
        btn.classList.add('correct');
        
        let row = document.getElementById(`row-${matchIdx}`);
        row.classList.remove('hidden-content'); row.classList.add('revealed');
        
        if (isStealMode) {
            teams[currentTeamIdx].score += (roundBank + currentAnswers[matchIdx].points);
            roundBank = 0; finishRound();
        } else {
            roundBank += currentAnswers[matchIdx].points; renderScores();
            if (revealedCount === 4) {
                teams[currentTeamIdx].score += roundBank; roundBank = 0; finishRound();
            }
        }
    } else {
        playSfx('buzzer'); btn.classList.add('wrong'); btn.disabled = true;

        if (isStealMode) {
            let originalTeam = (currentTeamIdx - 1 + teams.length) % teams.length;
            teams[originalTeam].score += roundBank; roundBank = 0; finishRound();
        } else {
            triggerStrike();
        }
    }
}

function processLetterChoice(btn, choiceText, targetRevealCount) {
    if (strikes >= 3 && !isStealMode) return; 

    let matchIdx = currentAnswers.findIndex(a => a.text === choiceText);

    if (matchIdx !== -1 && !currentAnswers[matchIdx].revealed) {
        playSfx('ding');
        currentAnswers[matchIdx].revealed = true;
        revealedCount++; totalActualReveals++;
        btn.classList.add('correct');
        
        document.querySelectorAll('.letter-blank').forEach(blank => {
            if (blank.dataset.char === choiceText) {
                blank.classList.remove('hidden-letter');
                blank.classList.add('revealed-letter');
            }
        });
        
        if (isStealMode) {
            if (revealedCount === targetRevealCount) {
                teams[currentTeamIdx].score += (roundBank + currentAnswers.reduce((sum, a) => sum + a.points, 0)); 
                roundBank = 0; finishRound();
            }
        } else {
            roundBank += currentAnswers[matchIdx].points; renderScores();
            if (revealedCount === targetRevealCount) {
                teams[currentTeamIdx].score += roundBank; roundBank = 0; finishRound();
            }
        }
    } else {
        playSfx('buzzer'); btn.classList.add('wrong'); btn.disabled = true;

        if (isStealMode) {
            let originalTeam = (currentTeamIdx - 1 + teams.length) % teams.length;
            teams[originalTeam].score += roundBank; roundBank = 0; finishRound();
        } else {
            triggerStrike();
        }
    }
}

function triggerStrike() {
    strikes++;
    document.getElementById('strikes-display').textContent = 'X '.repeat(strikes).trim();
    
    if (strikes >= 3) {
        if (isCoop) {
            roundBank = 0; setTimeout(finishRound, 1000);
        } else {
            setTimeout(() => {
                isStealMode = true; currentTeamIdx = (currentTeamIdx + 1) % teams.length;
                document.getElementById('steal-banner').style.display = 'block';
                document.getElementById('strikes-display').textContent = ''; renderScores();
            }, 1000);
        }
    }
}

function giveUpRound() { playSfx('click'); roundBank = 0; finishRound(); }

function finishRound() {
    document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
    document.getElementById('give-up-btn').style.display = 'none';
    document.getElementById('next-round-btn').style.display = 'block';
    
    if (selectedPack.type === 'letter_pool') {
        document.querySelectorAll('.letter-blank.hidden-letter').forEach(blank => {
            blank.classList.remove('hidden-letter'); blank.classList.add('missed-letter');
        });
    } else {
        currentAnswers.forEach((ans, idx) => {
            if (!ans.revealed) {
                let row = document.getElementById(`row-${idx}`);
                row.classList.remove('hidden-content'); row.classList.add('missed');
            }
        });
    }
    renderScores();
    
    document.getElementById('game-screen').scrollTo({ top: document.getElementById('game-screen').scrollHeight, behavior: 'smooth' });
}

function nextRound() {
    playSfx('click');
    currentQIdx++;
    if (currentQIdx >= activeQuestions.length) {
        showGameOver();
    } else {
        if (!isCoop && !isStealMode) currentTeamIdx = (currentTeamIdx + 1) % teams.length;
        setupRound();
    }
}

function showGameOver() {
    showScreen('end-screen');
    playSfx('chaching');
    
    let standings = document.getElementById('final-standings'); standings.innerHTML = '';
    let sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    
    let accuracy = totalActualReveals / totalPossibleReveals; let title = "";
    if(accuracy >= 0.9) title = "Search Engine Scholars 🎓";
    else if(accuracy >= 0.7) title = "Algorithm Whisperers 🤖";
    else if(accuracy >= 0.5) title = "Autocomplete Amateurs ⌨️";
    else title = "Incognito Mode Rookies 🕵️";

    // Reward: Winning score goes to Bank, reduced by 25% for difficulty
    let reward = Math.floor(sortedTeams[0].score * 0.75);
    bank += reward; updateBankUI();
    document.getElementById('end-earned').textContent = `Earned ${reward} Coins!`;

    sortedTeams.forEach((t, i) => {
        let row = document.createElement('div'); row.className = `final-row ${i === 0 ? 'winner-row' : ''}`;
        let teamName = isCoop ? 'Final Score' : `Team ${t.id} ${i === 0 ? '👑' : ''}`;
        row.innerHTML = `<div>${teamName}${i === 0 ? `<span class="rank-title">Rank: ${title}</span>` : ''}</div><span>${t.score}</span>`;
        standings.appendChild(row);
    });
}
