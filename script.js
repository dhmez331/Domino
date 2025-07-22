// المتغيرات الأساسية لحالة اللعبة
let teamAScore = 0;
let teamBScore = 0;
let teamAName = "الفريق الأول";
let teamBName = "الفريق الثاني";
let currentLosingTeam = null; // A أو B
let selectedDominoTiles = [];

// تعريف قيم النقاط لكل حجر ضومنة (مجموع النقاط السوداء)
const dominoTileValues = {
    '0-0': 0, '0-1': 1, '0-2': 2, '0-3': 3, '0-4': 4, '0-5': 5, '0-6': 6,
    '1-1': 2, '1-2': 3, '1-3': 4, '1-4': 5, '1-5': 6, '1-6': 7,
    '2-2': 4, '2-3': 5, '2-4': 6, '2-5': 7, '2-6': 8,
    '3-3': 6, '3-4': 7, '3-5': 8, '3-6': 9,
    '4-4': 8, '4-5': 9, '4-6': 10,
    '5-5': 10, '5-6': 11,
    '6-6': 12
};

// مصفوفة كاملة لجميع أحجار الدومينو الـ 28
const sortedDominoTiles = [
    '0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6',
    '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
    '2-2', '2-3', '2-4', '2-5', '2-6',
    '3-3', '3-4', '3-5', '3-6',
    '4-4', '4-5', '4-6',
    '5-5', '5-6',
    '6-6'
];


// عناصر الـ HTML (يتم الحصول عليها مرة واحدة عند تحميل DOM)
const elements = {
    // الشاشات
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    tileSelectionScreen: document.getElementById('tile-selection-screen'),

    // شاشة البدء
    teamANameInput: document.getElementById('teamA-name-input'),
    teamBNameInput: document.getElementById('teamB-name-input'),
    startGameBtn: document.getElementById('start-game-btn'),

    // شاشة اللعب
    teamADisplayName: document.getElementById('teamA-display-name'),
    teamBDisplayName: document.getElementById('teamB-display-name'),
    teamAScoreValue: document.getElementById('teamA-score-value'),
    teamBScoreValue: document.getElementById('teamB-score-value'),
    addPointsTeamA: document.getElementById('add-points-teamA'),
    addPointsTeamB: document.getElementById('add-points-teamB'),
    gameMessages: document.getElementById('game-messages'),
    resetGameBtn: document.getElementById('reset-game-btn'),
    resetScoresBtn: document.getElementById('reset-scores-btn'), // الزر الجديد

    // شاشة اختيار الأحجار
    losingTeamNameDisplay: document.getElementById('losing-team-name-display'),
    dominoTilesContainer: document.getElementById('domino-tiles-container'),
    calculatePointsBtn: document.getElementById('calculate-points-btn'),
    cancelSelectionBtn: document.getElementById('cancel-selection-btn')
};

/**
 * دالة لتوليد النقاط داخل عنصر النقطة (dot)
 * @param {number} count - عدد النقاط المراد توليدها
 * @returns {HTMLElement} - عنصر div يحتوي على النقاط
 */
function createDotsDiv(count) {
    const dotsDiv = document.createElement('div');
    dotsDiv.classList.add('dot-row', `dots-${count}`); // إضافة كلاس خاص بالعدد لتحديد النمط في CSS

    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.classList.add('domino-dot');
        dotsDiv.appendChild(dot);
    }
    return dotsDiv;
}


/**
 * دالة لتوليد أحجار الضومنة ديناميكياً وعرضها في الحاوية
 */
function createDominoTiles() {
    if (!elements.dominoTilesContainer) {
        console.error("Error: Domino tiles container not found!");
        return;
    }
    elements.dominoTilesContainer.innerHTML = ''; // تفريغ الحاوية

    sortedDominoTiles.forEach(tileName => {
        const [dot1, dot2] = tileName.split('-').map(Number);

        const tileDiv = document.createElement('div');
        tileDiv.classList.add('domino-tile');
        tileDiv.dataset.value = tileName; // لتخزين قيمة الحجر (مثال: "6-6")

        // الجزء العلوي من الحجر
        tileDiv.appendChild(createDotsDiv(dot1));

        // الفاصل
        tileDiv.appendChild(document.createElement('div')).classList.add('domino-divider');

        // الجزء السفلي من الحجر
        tileDiv.appendChild(createDotsDiv(dot2));

        // إضافة مستمع حدث للنقر على الحجر
        tileDiv.addEventListener('click', () => toggleTileSelection(tileDiv));
        elements.dominoTilesContainer.appendChild(tileDiv);
    });
}

/**
 * دالة لاختيار أو إلغاء اختيار حجر دومينو
 * @param {HTMLElement} tileDiv - عنصر div الخاص بالحجر
 */
function toggleTileSelection(tileDiv) {
    tileDiv.classList.toggle('selected');
    const tileValue = tileDiv.dataset.value;

    if (tileDiv.classList.contains('selected')) {
        selectedDominoTiles.push(tileValue);
    } else {
        selectedDominoTiles = selectedDominoTiles.filter(tile => tile !== tileValue);
    }
}

/**
 * دالة لتحديث عرض النقاط على الشاشة
 */
function updateScoresDisplay() {
    elements.teamAScoreValue.textContent = teamAScore;
    elements.teamBScoreValue.textContent = teamBScore;
}

/**
 * دالة لإظهار شاشة معينة وإخفاء البقية
 * @param {HTMLElement} screenToShow - الشاشة المراد إظهارها
 */
function showScreen(screenToShow) {
    const allScreens = [elements.startScreen, elements.gameScreen, elements.tileSelectionScreen];
    allScreens.forEach(screen => {
        if (screen && screen !== screenToShow) {
            screen.classList.remove('active');
        }
    });
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

/**
 * بدء اللعبة: تعيين أسماء الفرق والانتقال لشاشة اللعب
 */
function startGame() {
    const enteredTeamAName = elements.teamANameInput.value.trim();
    const enteredTeamBName = elements.teamBNameInput.value.trim();

    if (!enteredTeamAName && !enteredTeamBName) {
        alert("الرجاء إدخال أسماء الفريقين أو سيتم استخدام الأسماء الافتراضية.");
    }

    teamAName = enteredTeamAName || "الفريق الأول";
    teamBName = enteredTeamBName || "الفريق الثاني";

    elements.teamADisplayName.textContent = teamAName;
    elements.teamBDisplayName.textContent = teamBName;

    teamAScore = 0;
    teamBScore = 0;
    updateScoresDisplay();
    clearGameMessages();
    
    showScreen(elements.gameScreen);
}

/**
 * إظهار شاشة اختيار الأحجار للفريق الخاسر
 * @param {string} winningTeam - الفريق الفائز في هذه الجولة ('A' أو 'B')
 */
function showTileSelectionScreen(winningTeam) {
    currentLosingTeam = (winningTeam === 'A') ? 'B' : 'A';
    const losingTeamDisplayName = (currentLosingTeam === 'A') ? teamAName : teamBName;
    elements.losingTeamNameDisplay.textContent = losingTeamDisplayName;

    // تصفير الأحجار المختارة وإزالة التحديد البصري من أي جولة سابقة
    selectedDominoTiles = [];
    document.querySelectorAll('.domino-tile').forEach(tile => {
        tile.classList.remove('selected');
    });

    clearGameMessages();
    showScreen(elements.tileSelectionScreen);
}

/**
 * حساب النقاط من الأحجار المختارة وإضافتها للفريق الفائز
 */
function calculateAndAddPoints() {
    let totalDots = 0;
    selectedDominoTiles.forEach(tileName => {
        totalDots += dominoTileValues[tileName];
    });

    const pointsToAdd = Math.floor(totalDots / 10);

    const prevTeamAScore = teamAScore;
    const prevTeamBScore = teamBScore;

    if (currentLosingTeam === 'A') {
        teamBScore += pointsToAdd;
    } else if (currentLosingTeam === 'B') {
        teamAScore += pointsToAdd;
    }

    updateScoresDisplay();
    checkGameStatus(prevTeamAScore, prevTeamBScore);
    
    showScreen(elements.gameScreen); // العودة لشاشة اللعب الرئيسية
}

/**
 * إلغاء عملية اختيار الأحجار والعودة لشاشة اللعب
 */
function cancelTileSelection() {
    selectedDominoTiles = [];
    document.querySelectorAll('.domino-tile').forEach(tile => {
        tile.classList.remove('selected');
    });
    clearGameMessages();
    showScreen(elements.gameScreen); // العودة إلى شاشة اللعب الرئيسية
}

/**
 * إعادة تعيين المباراة بالكامل (النقاط والأسماء والعودة لشاشة البدء)
 */
function resetGame() {
    teamAScore = 0;
    teamBScore = 0;
    teamAName = "الفريق الأول"; // إعادة تعيين الأسماء الافتراضية
    teamBName = "الفريق الثاني";
    
    elements.teamANameInput.value = ""; // مسح حقول الإدخال
    elements.teamBNameInput.value = "";

    elements.teamADisplayName.textContent = teamAName; // إعادة عرض الأسماء الافتراضية
    elements.teamBDisplayName.textContent = teamBName;

    updateScoresDisplay();
    clearGameMessages();
    selectedDominoTiles = [];
    document.querySelectorAll('.domino-tile').forEach(tile => {
        tile.classList.remove('selected');
    });

    showScreen(elements.startScreen); // العودة لشاشة البدء
}

/**
 * تصفير النقاط فقط (دون إعادة تعيين الأسماء أو العودة لشاشة البدء)
 */
function resetScoresOnly() {
    teamAScore = 0;
    teamBScore = 0;
    updateScoresDisplay();
    clearGameMessages();
    selectedDominoTiles = [];
    document.querySelectorAll('.domino-tile').forEach(tile => {
        tile.classList.remove('selected');
    });
}


/**
 * التحقق من حالة اللعبة (فوز، صيمة، حرقة) وعرض الرسالة المناسبة
 * @param {number} prevTeamAScore - نقاط الفريق الأول قبل إضافة النقاط الجديدة
 * @param {number} prevTeamBScore - نقاط الفريق الثاني قبل إضافة النقاط الجديدة
 */
function checkGameStatus(prevTeamAScore, prevTeamBScore) {
    let message = '';
    let messageClass = 'messages';

    const isTeamAWinning = teamAScore >= 11 && teamAScore > teamBScore;
    const isTeamBWinning = teamBScore >= 11 && teamBScore > teamAScore;

    if (isTeamAWinning) {
        if (teamBScore === 0) {
            message = `صيمة!`;
            messageClass += ' sima';
        } else {
            message = `ألف مبروك ${teamAName}!  !`;
            messageClass += ' celebration';
        }
    } else if (isTeamBWinning) {
        if (teamAScore === 0) {
            message = `صيمة! `;
            messageClass += ' sima';
        } else {
            message = `ألف مبروك ${teamBName}!  !`;
            messageClass += ' celebration';
        }
    } else {
        // تحقق من حالة "الحرقة" فقط إذا لم يكن هناك فائز بعد
        const harqaConditionA = (prevTeamAScore === 10 && prevTeamBScore === 0 && teamBScore > 0);
        const harqaConditionB = (prevTeamBScore === 10 && prevTeamAScore === 0 && teamAScore > 0);

        if (harqaConditionA) {
            message = `حرقة! `;
            messageClass += ' harqa';
        } else if (harqaConditionB) {
            message = `حرقة!`;
            messageClass += ' harqa';
        }
    }

    elements.gameMessages.textContent = message;
    elements.gameMessages.className = messageClass; // تحديث الكلاسات
}

/**
 * مسح رسائل اللعبة
 */
function clearGameMessages() {
    elements.gameMessages.textContent = '';
    elements.gameMessages.className = 'messages'; // إعادة الكلاس الأساسي
}

// ** تهيئة اللعبة عند تحميل الصفحة بالكامل **
document.addEventListener('DOMContentLoaded', () => {
    // إعداد مستمعي الأحداث للأزرار
    elements.startGameBtn.addEventListener('click', startGame);
    elements.addPointsTeamA.addEventListener('click', () => showTileSelectionScreen('A'));
    elements.addPointsTeamB.addEventListener('click', () => showTileSelectionScreen('B'));
    elements.calculatePointsBtn.addEventListener('click', calculateAndAddPoints);
    elements.cancelSelectionBtn.addEventListener('click', cancelTileSelection);
    elements.resetGameBtn.addEventListener('click', resetGame);
    elements.resetScoresBtn.addEventListener('click', resetScoresOnly); // ربط الزر الجديد

    // توليد أحجار الدومينو مرة واحدة عند تحميل الصفحة
    createDominoTiles();

    // إظهار شاشة البدء كشاشة أولية
    showScreen(elements.startScreen);
});