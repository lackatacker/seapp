const tg = window.Telegram.WebApp;
tg.expand();

let gameSequence = [];
let userSequence = [];
let level = 0;
let isPlayingSequence = false;

const creatureIds = ['crab', 'dolphin', 'seaturtle', 'starfish'];

// Pre-load audio objects to eliminate click latency
const sounds = {};
creatureIds.forEach(id => {
    sounds[id] = new Audio(`sounds/${id}.wav`);
    sounds[id].preload = 'auto';
});

function startGame() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    gameSequence = [];
    level = 0;
    document.getElementById('start-btn').style.display = 'none';
    nextRound();
}

function nextRound() {
    userSequence = [];
    level++;
    document.getElementById('level-val').innerText = level;
    document.getElementById('status').innerText = "Watch...";
    
    const randomCreature = creatureIds[Math.floor(Math.random() * creatureIds.length)];
    gameSequence.push(randomCreature);

    setTimeout(playFullSequence, 800);
}

async function playFullSequence() {
    isPlayingSequence = true;
    for (const id of gameSequence) {
        await animateAndPlay(id);
        await new Promise(res => setTimeout(res, 200)); 
    }
    isPlayingSequence = false;
    document.getElementById('status').innerText = "Your Turn!";
}

function animateAndPlay(id) {
    return new Promise(res => {
        const card = document.getElementById(id);
        const audio = sounds[id];
        
        card.classList.add('playing');
        audio.currentTime = 0;
        audio.play().catch(() => {}); 
        
        setTimeout(() => {
            card.classList.remove('playing');
            res();
        }, 500);
    });
}

function handleUserClick(id) {
    if (isPlayingSequence) return;

    const card = document.getElementById(id);
    card.classList.remove('playing'); 
    void card.offsetWidth; 
    card.classList.add('playing');

    setTimeout(() => {
        card.classList.remove('playing');
    }, 500);

    sounds[id].currentTime = 0;
    sounds[id].play().catch(() => {});
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    userSequence.push(id);
    const checkIdx = userSequence.length - 1;

    if (userSequence[checkIdx] !== gameSequence[checkIdx]) {
        gameOver();
        return;
    }

    if (userSequence.length === gameSequence.length) {
        document.getElementById('status').innerText = "Nice! ✨";
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        setTimeout(nextRound, 1000);
    }
}

function gameOver() {
    document.getElementById('status').innerText = "Game Over! 🐙";
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    
    const btn = document.getElementById('start-btn');
    btn.style.display = 'inline-block';
    btn.innerText = 'TRY AGAIN';
}
