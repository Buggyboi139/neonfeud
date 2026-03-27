if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {});
  });
}

const sfx = {
    click: new Audio('audio/click.mp3'),
    ding: new Audio('audio/ding.mp3'),
    buzzer: new Audio('audio/buzzer.mp3'),
    chaching: new Audio('audio/chaching.mp3')
};

let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('mute-btn').textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
}

function playSfx(name) {
    if(!isMuted && sfx[name]) {
        sfx[name].currentTime = 0;
        sfx[name].play().catch(e => {});
    }
}

function vibrate(pattern) {
    if (!isMuted && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

let bank = parseInt(localStorage.getItem('rf_coins')) || 0;
let unlockedPacks = JSON.parse(localStorage.getItem('rf_unlocks')) ||['wild_web', 'worldbuilder_history', 'measure_google_once'];
let customPacks = JSON.parse(localStorage.getItem('rf_custom_packs')) || [];

let allPacks =[];
let selectedPack = null;
let activeQuestions = [];
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

let timerInterval;
let timeLeft = 60;
let wagerAmount = 0;

window.onload = async () => {
    updateBankUI();
    try {
        const response = await fetch('packs.json');
        let fetchedPacks = await response.json();
        allPacks = [...fetchedPacks, ...customPacks];
    } catch (e) {
        allPacks = [...customPacks];
    }
};

function applyTheme(color) {
    if(!color) color = '#b066ff';
    document.documentElement.style.setProperty('--theme-color', color);
    let grad = `linear-gradient(135deg, ${color}, #ffffff)`;
    document.documentElement.style.setProperty('--theme-grad', grad);
}

function updateBankUI() {
    document.getElementById('menu-bank').textContent = `💰 ${bank} Coins`;
    document.getElementById('store-bank').textContent = `💰 ${bank} Coins`;
    localStorage.setItem('rf_coins', bank);
    localStorage.setItem('rf_unlocks', JSON.stringify(unlockedPacks));
}

function wipeData() {
    if(confirm("Are you sure? This will wipe all coins and custom packs.")) {
        localStorage.clear();
        location.reload();
    }
}

function showScreen(id) {
    playSfx('click');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    applyTheme('#b066ff');
}

function openAbout() { playSfx('click'); document.getElementById('about-modal').classList.add('active'); }
function closeAbout() { playSfx('click'); document.getElementById('about-modal').classList.remove('active'); }

function quitGame() {
    playSfx('click');
    if(confirm("Quit and lose banked points?")) {
        clearInterval(timerInterval);
        showScreen('menu-screen');
    }
}

function goToStore() {
    showScreen('store-screen');
    const container = document.getElementById('store-container');
    container.innerHTML = '';
    
    allPacks.filter(p => !customPacks.includes(p)).forEach(pack => {
        const isOwned = unlockedPacks.includes(pack.id) || pack.unlockedByDefault;
        if(pack.unlockedByDefault && !unlockedPacks.includes(pack.id)) unlockedPacks.push(pack.id);

        let icon = pack.type === 'letter_pool' ? '🅰️' : '🔍';

        const card = document.createElement('div');
        card.className = 'pack-card';
        card.innerHTML = `
            <div>
                <h3 style="color:${pack.color || 'var(--purple-neon)'}">${icon} ${pack.name}</h3>
                <p>${pack.description}</p>
                <p style="color:#aaa">${pack.questions.length} Questions</p>
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
        vibrate([50, 50, 50]);
        alert("Not enough coins!");
    }
}

function goToCreator() {
    showScreen('creator-screen');
    buildCreatorForm();
}

function buildCreatorForm() {
    let type = document.getElementById('c-pack-type').value;
    let container = document.getElementById('creator-questions');
    container.innerHTML = '';
    for(let i=1; i<=5; i++) {
        let block = document.createElement('div');
        block.className = 'creator-q-block';
        block.innerHTML = `<input type="text" id="cq-${i}" placeholder="Question ${i}" class="creator-input">`;
        if(type === 'feud') {
            block.innerHTML += `
                <input type="text" id="ca-${i}-1" placeholder="Answer 1 (Top)" class="creator-input">
                <input type="text" id="ca-${i}-2" placeholder="Answer 2" class="creator-input">
                <input type="text" id="ca-${i}-3" placeholder="Answer 3" class="creator-input">
                <input type="text" id="ca-${i}-4" placeholder="Answer 4" class="creator-input">
            `;
        } else {
            block.innerHTML += `<input type="text" id="ca-${i}-word" placeholder="Target Word" class="creator-input">`;
        }
        container.appendChild(block);
    }
}

function saveCustomPack() {
    let name = document.getElementById('c-pack-name').value;
    let type = document.getElementById('c-pack-type').value;
    if(!name) return alert("Name required");
    
    let pack = {
        id: 'custom_' + Date.now(),
        name: name,
        description: "Custom user created pack.",
        price: 0,
        unlockedByDefault: true,
        type: type,
        color: "#ffffff",
        questions:[]
    };

    for(let i=1; i<=5; i++) {
        let q = document.getElementById(`cq-${i}`).value;
        if(!q) continue;
        if(type === 'feud') {
            let a1 = document.getElementById(`ca-${i}-1`).value;
            let a2 = document.getElementById(`ca-${i}-2`).value;
            let a3 = document.getElementById(`ca-${i}-3`).value;
            let a4 = document.getElementById(`ca-${i}-4`).value;
            if(a1 && a2 && a3 && a4) pack.questions.push({q: q, a:[a1,a2,a3,a4]});
        } else {
            let word = document.getElementById(`ca-${i}-word`).value;
            if(word) pack.questions.push({q: q, a: word});
        }
    }

    if(pack.questions.length < 1) return alert("Add at least 1 full question!");
    customPacks.push(pack);
    localStorage.setItem('rf_custom_packs', JSON.stringify(customPacks));
    allPacks.push(pack);
    unlockedPacks.push(pack.id);
    updateBankUI();
    alert("Saved!");
    showScreen('menu-screen');
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
            if(pack.color) btn.style.borderTopColor = pack.color;
            btn.onclick = () => {
                playSfx('click');
                selectedPack = pack;
                applyTheme(pack.color);
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
    applyTheme('#b066ff');
    document.getElementById('pack-select-container').style.display = 'flex';
    document.getElementById('step-1-title').style.display = 'block';
    document.getElementById('team-selection-area').style.display = 'none';
}

function startGame(numTeams) {
    playSfx('click');
    isCoop = (numTeams === 1);
    teams = Array.from({length: numTeams}, (_, i) => ({ id: i+1, score: 0 }));
    
    let maxQ = Math.min(5, selectedPack.questions.length);
    activeQuestions = [...selectedPack.questions].sort(() => 0.5 - Math.random()).slice(0, maxQ);
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
    checkWagerOrSetup();
}

function checkWagerOrSetup() {
    if (currentQIdx === 4 && !isCoop) {
        showWagerModal();
    } else {
        setupRound();
    }
}

function showWagerModal() {
    document.getElementById('wager-modal').classList.add('active');
    document.getElementById('wager-prompt').textContent = `Team ${teams[currentTeamIdx].id}, wager up to your score of ${teams[currentTeamIdx].score}!`;
    let input = document.getElementById('wager-input');
    input.max = teams[currentTeamIdx].score;
    input.value = 0;
}

function submitWager() {
    playSfx('click');
    let input = parseInt(document.getElementById('wager-input').value) || 0;
    let max = teams[currentTeamIdx].score;
    if(input > max) input = max;
    if(input < 0) input = 0;
    wagerAmount = input;
    document.getElementById('wager-modal').classList.remove('active');
    setupRound();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    let d = document.getElementById('timer-display');
    d.textContent = timeLeft;
    d.classList.remove('panic');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        d.textContent = timeLeft;
        if(timeLeft === 10) d.classList.add('panic');
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            playSfx('buzzer');
            vibrate([200, 100, 200]);
            forceStrikeOut();
        }
    }, 1000);
}

function forceStrikeOut() {
    strikes = 3;
    document.getElementById('strikes-display').textContent = 'X X X';
    if (isCoop) {
        roundBank = 0; setTimeout(finishRound, 1000);
    } else {
        setTimeout(() => {
            isStealMode = true; currentTeamIdx = (currentTeamIdx + 1) % teams.length;
            document.getElementById('steal-banner').style.display = 'block';
            document.getElementById('strikes-display').textContent = ''; 
            startTimer(); 
            renderScores();
        }, 1000);
    }
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
    if(allValidAnswers.length === 0) allValidAnswers = ["Apple", "Banana", "Car", "Dog", "House"];
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
    document.getElementById('lifeline-bar').style.display = 'flex';
    
    strikes = 0; roundBank = 0; revealedCount = 0; isStealMode = false;
    updateLifelineUI();
    
    const choices = document.getElementById('choices-container');
    choices.innerHTML = '';

    if (selectedPack.type === 'letter_pool') {
        document.getElementById('board-container').style.display = 'none';
        document.getElementById('letter-board-container').style.display = 'flex';
        
        let targetWord = qData.a.toUpperCase();
        let uniqueLetters = [...new Set(targetWord.split(''))].filter(c => c.trim() !== '');
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
        currentAnswers = qData.a.map((text, index) => ({ text: text, points: ptsArray[index] || 10, revealed: false }));

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
    startTimer();
}

function updateLifelineUI() {
    document.getElementById('ll-5050').disabled = bank < 50;
    document.getElementById('ll-hint').disabled = bank < 100;
    document.getElementById('ll-mulligan').disabled = bank < 150 || strikes === 0;
}

function use5050() {
    if(bank < 50) return;
    bank -= 50; updateBankUI(); playSfx('chaching');
    let wrongBtns = Array.from(document.querySelectorAll('.choice-btn:not(.correct):not(.wrong)')).filter(b => !currentAnswers.find(a => a.text === b.textContent));
    wrongBtns.sort(() => 0.5 - Math.random());
    let toRemove = Math.floor(wrongBtns.length / 2);
    for(let i=0; i<toRemove; i++) {
        wrongBtns[i].classList.add('wrong');
        wrongBtns[i].disabled = true;
    }
    updateLifelineUI();
}

function useFirstLetter() {
    if(bank < 100 || selectedPack.type === 'letter_pool') return; 
    bank -= 100; updateBankUI(); playSfx('chaching');
    let unrevealed = currentAnswers.findIndex(a => !a.revealed);
    if(unrevealed !== -1) {
        let row = document.getElementById(`row-${unrevealed}`);
        let textDiv = row.querySelector('.ans-text');
        textDiv.textContent = currentAnswers[unrevealed].text.charAt(0) + "...";
        textDiv.style.opacity = '1';
        textDiv.style.color = '#aaa';
    }
    updateLifelineUI();
}

function useMulligan() {
    if(bank < 150 || strikes === 0) return;
    bank -= 150; updateBankUI(); playSfx('chaching');
    strikes--;
    document.getElementById('strikes-display').textContent = 'X '.repeat(strikes).trim();
    updateLifelineUI();
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let val = Math.floor(progress * (end - start) + start);
        if (obj.textContent.includes('TEAM')) {
            obj.textContent = obj.textContent.replace(/: \d+/, ': ' + val);
        } else {
            obj.textContent = `SCORE: ${val}`;
        }
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
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
            if (statusClass !== '') displayScore += ` (+${roundBank})`;
            if (currentQIdx === 4 && i === currentTeamIdx && wagerAmount > 0 && !isStealMode) {
                displayScore += ` [W: ${wagerAmount}]`;
            }
            pill.textContent = `TEAM ${t.id}: ${displayScore}`;
            sb.appendChild(pill);
        });
    }
}

function processFeudChoice(btn, choiceText) {
    if (strikes >= 3 && !isStealMode) return; 
    
    let matchIdx = currentAnswers.findIndex(a => a.text === choiceText);

    if (matchIdx !== -1 && !currentAnswers[matchIdx].revealed) {
        playSfx('ding'); vibrate(100);
        currentAnswers[matchIdx].revealed = true;
        revealedCount++; totalActualReveals++;
        btn.classList.add('correct');
        
        let row = document.getElementById(`row-${matchIdx}`);
        row.querySelector('.ans-text').textContent = currentAnswers[matchIdx].text;
        row.querySelector('.ans-text').style.color = '';
        row.classList.remove('hidden-content'); row.classList.add('revealed');
        
        if (isStealMode) {
            teams[currentTeamIdx].score += (roundBank + currentAnswers[matchIdx].points);
            roundBank = 0; finishRound();
        } else {
            roundBank += currentAnswers[matchIdx].points; renderScores();
            if (revealedCount === 4) {
                teams[currentTeamIdx].score += roundBank;
                if(currentQIdx === 4 && wagerAmount > 0) teams[currentTeamIdx].score += wagerAmount;
                roundBank = 0; finishRound();
            }
        }
    } else {
        playSfx('buzzer'); vibrate([50, 50, 50]); btn.classList.add('wrong'); btn.disabled = true;

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
        playSfx('ding'); vibrate(100);
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
                teams[currentTeamIdx].score += roundBank;
                if(currentQIdx === 4 && wagerAmount > 0) teams[currentTeamIdx].score += wagerAmount;
                roundBank = 0; finishRound();
            }
        }
    } else {
        playSfx('buzzer'); vibrate([50, 50, 50]); btn.classList.add('wrong'); btn.disabled = true;

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
    updateLifelineUI();
    
    if (strikes >= 3) {
        if(currentQIdx === 4 && wagerAmount > 0 && !isStealMode) {
            teams[currentTeamIdx].score -= wagerAmount;
            if(teams[currentTeamIdx].score < 0) teams[currentTeamIdx].score = 0;
        }

        if (isCoop) {
            roundBank = 0; setTimeout(finishRound, 1000);
        } else {
            clearInterval(timerInterval);
            setTimeout(() => {
                isStealMode = true; currentTeamIdx = (currentTeamIdx + 1) % teams.length;
                document.getElementById('steal-banner').style.display = 'block';
                document.getElementById('strikes-display').textContent = ''; 
                startTimer();
                renderScores();
            }, 1000);
        }
    }
}

function giveUpRound() { playSfx('click'); roundBank = 0; finishRound(); }

function finishRound() {
    clearInterval(timerInterval);
    document.getElementById('timer-display').textContent = "-";
    document.getElementById('timer-display').classList.remove('panic');
    document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
    document.getElementById('give-up-btn').style.display = 'none';
    document.getElementById('lifeline-bar').style.display = 'none';
    document.getElementById('next-round-btn').style.display = 'block';
    
    if (selectedPack.type === 'letter_pool') {
        document.querySelectorAll('.letter-blank.hidden-letter').forEach(blank => {
            blank.classList.remove('hidden-letter'); blank.classList.add('missed-letter');
        });
    } else {
        currentAnswers.forEach((ans, idx) => {
            if (!ans.revealed) {
                let row = document.getElementById(`row-${idx}`);
                row.querySelector('.ans-text').textContent = ans.text;
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
    wagerAmount = 0;
    if (currentQIdx >= activeQuestions.length) {
        showGameOver();
    } else {
        if (!isCoop && !isStealMode) currentTeamIdx = (currentTeamIdx + 1) % teams.length;
        checkWagerOrSetup();
    }
}

function fireConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles =[];
    for(let i=0; i<100; i++) {
        particles.push({
            x: canvas.width/2, y: canvas.height/2,
            r: Math.random()*6+2,
            dx: Math.random()*10-5, dy: Math.random()*-10-5,
            color: `hsl(${Math.random()*360}, 100%, 50%)`
        });
    }
    function render() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = p.color; ctx.fill();
            p.x += p.dx; p.y += p.dy; p.dy += 0.2;
        });
        if(particles[0].y < canvas.height + 100) requestAnimationFrame(render);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    render();
}

function showGameOver() {
    showScreen('end-screen');
    playSfx('chaching');
    fireConfetti();
    
    let standings = document.getElementById('final-standings'); standings.innerHTML = '';
    let sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    
    let accuracy = totalActualReveals / (totalPossibleReveals || 1); 
    let title = "";
    if(accuracy >= 0.9) title = "Search Engine Scholars 🎓";
    else if(accuracy >= 0.7) title = "Algorithm Whisperers 🤖";
    else if(accuracy >= 0.5) title = "Autocomplete Amateurs ⌨️";
    else title = "Incognito Mode Rookies 🕵️";

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
