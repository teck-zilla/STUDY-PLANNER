/**
 * AetherMind AI Study Planner & Exam Mastery Engine
 * Vanilla JavaScript SPA with Adaptive AI Scheduling & Interactive Quiz Engine
 */

// Global State Key
const STORAGE_KEY = 'aethermind_ai_study_planner_v1';

// Default State Model
const defaultState = {
    examDetails: {
        title: "Computer Science & Engineering Finals",
        examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 14 days from today
        targetScore: 90,
        dailyAvailableHours: 4.0,
        peakTime: "evening"
    },
    subjects: [
        { id: "sub-1", name: "Computer Science", color: "#6366f1", icon: "💻" },
        { id: "sub-2", name: "Applied Mathematics", color: "#06b6d4", icon: "📐" },
        { id: "sub-3", name: "Physics", color: "#8b5cf6", icon: "⚡" }
    ],
    topics: [
        { id: "top-1", subjectId: "sub-1", name: "Data Structures & Trees", difficulty: 2, estimatedHours: 6.0, masteryLevel: 45, quizzesTaken: 3, correctAnswers: 8, lastStudied: null },
        { id: "top-2", subjectId: "sub-1", name: "Algorithms & Time Complexity", difficulty: 3, estimatedHours: 8.0, masteryLevel: 30, quizzesTaken: 2, correctAnswers: 4, lastStudied: null },
        { id: "top-3", subjectId: "sub-2", name: "Linear Algebra & Eigenvalues", difficulty: 2, estimatedHours: 5.0, masteryLevel: 65, quizzesTaken: 4, correctAnswers: 14, lastStudied: null },
        { id: "top-4", subjectId: "sub-2", name: "Multivariable Calculus", difficulty: 3, estimatedHours: 7.0, masteryLevel: 40, quizzesTaken: 1, correctAnswers: 3, lastStudied: null },
        { id: "top-5", subjectId: "sub-3", name: "Quantum Mechanics", difficulty: 3, estimatedHours: 8.0, masteryLevel: 25, quizzesTaken: 2, correctAnswers: 3, lastStudied: null },
        { id: "top-6", subjectId: "sub-3", name: "Thermodynamics & Kinetics", difficulty: 1, estimatedHours: 4.0, masteryLevel: 80, quizzesTaken: 5, correctAnswers: 18, lastStudied: null }
    ],
    scheduleSessions: [],
    quizBank: {},
    studyLogs: [
        { id: "log-1", date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0,10), minutes: 120, topicId: "top-1" },
        { id: "log-2", date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0,10), minutes: 180, topicId: "top-3" }
    ],
    streak: { count: 3, lastDate: new Date().toISOString().slice(0,10) },
    activeTab: "dashboard"
};

class AppStore {
    constructor() {
        this.state = this.loadState();
        if (!this.state.scheduleSessions || this.state.scheduleSessions.length === 0) {
            this.generateAdaptiveSchedule();
        }
        this.initQuizBankIfEmpty();
    }

    loadState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...defaultState, ...parsed };
            }
        } catch (e) {
            console.error("Failed to load local storage:", e);
        }
        return JSON.parse(JSON.stringify(defaultState));
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("Failed to save local storage:", e);
        }
    }

    // Adaptive AI Algorithm
    generateAdaptiveSchedule() {
        const { examDetails, topics, subjects } = this.state;
        const targetDate = new Date(examDetails.examDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffMs = targetDate - today;
        const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const dailyCapMins = Math.round((examDetails.dailyAvailableHours || 3.5) * 60);

        // Compute urgency per topic
        const scoredTopics = topics.map(t => {
            const diffWeight = t.difficulty === 1 ? 1.0 : (t.difficulty === 2 ? 1.5 : 2.0);
            const deficit = (100 - t.masteryLevel) / 100; // 0..1
            const urgency = diffWeight * (deficit * 0.7 + 0.3) * (t.estimatedHours || 4);
            return { ...t, urgency };
        });

        // Sort descending by urgency
        scoredTopics.sort((a, b) => b.urgency - a.urgency);

        const newSessions = [];
        const timeSlots = ["Morning (09:00)", "Afternoon (14:00)", "Evening (18:30)", "Night (21:00)"];

        // Distribute for the next 7 days
        for (let d = 0; d < Math.min(7, daysLeft); d++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + d);
            const dateStr = currentDate.toISOString().slice(0, 10);

            let remainingMinsToday = dailyCapMins;
            let slotIndex = 0;

            // Cycle through scored topics
            for (let i = 0; i < scoredTopics.length && remainingMinsToday >= 30; i++) {
                const topic = scoredTopics[(i + d) % scoredTopics.length];
                const duration = Math.min(60, remainingMinsToday);
                const subject = subjects.find(s => s.id === topic.subjectId) || { name: "General", color: "#6366f1" };

                // Determine recommended activity
                let activity = "Deep Focus Study";
                if (topic.masteryLevel < 40) {
                    activity = "Concept Review & Fundamentals";
                } else if (topic.masteryLevel < 70) {
                    activity = "Active Recall & Problem Solving";
                } else {
                    activity = "Speed Quiz & Advanced Drills";
                }

                newSessions.push({
                    id: `sess-${dateStr}-${d}-${i}`,
                    topicId: topic.id,
                    topicName: topic.name,
                    subjectName: subject.name,
                    subjectColor: subject.color,
                    date: dateStr,
                    dayOffset: d,
                    timeSlot: timeSlots[slotIndex % timeSlots.length],
                    duration: duration,
                    activity: activity,
                    completed: false,
                    urgencyScore: Math.round(topic.urgency * 10) / 10
                });

                remainingMinsToday -= duration;
                slotIndex++;
            }
        }

        this.state.scheduleSessions = newSessions;
        this.saveState();
    }

    initQuizBankIfEmpty() {
        if (!this.state.quizBank || Object.keys(this.state.quizBank).length === 0) {
            this.state.quizBank = {
                "top-1": [
                    {
                        id: "q-1-1",
                        question: "What is the worst-case time complexity for searching an element in an unbalanced Binary Search Tree (BST)?",
                        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                        correctIndex: 2,
                        explanation: "In an unbalanced BST, elements can form a degenerate linear chain (linked list), resulting in O(N) traversal time."
                    },
                    {
                        id: "q-1-2",
                        question: "Which data structure uses LIFO (Last In, First Out) ordering?",
                        options: ["Queue", "Stack", "Heap", "Hash Table"],
                        correctIndex: 1,
                        explanation: "A Stack operates on Last In First Out (LIFO) principle where push and pop occur at the top."
                    },
                    {
                        id: "q-1-3",
                        question: "What is the amortized time complexity of insertion into a dynamic array (like JavaScript Array or Python list)?",
                        options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
                        correctIndex: 0,
                        explanation: "Although resizing takes O(N) occasionally, doubling array capacity spreads cost over N operations, giving O(1) amortized time."
                    }
                ],
                "top-2": [
                    {
                        id: "q-2-1",
                        question: "Which algorithm design strategy does QuickSort utilize?",
                        options: ["Greedy Approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
                        correctIndex: 2,
                        explanation: "QuickSort partitions an array around a pivot and recursively sorts subarrays, which is a classic Divide and Conquer strategy."
                    },
                    {
                        id: "q-2-2",
                        question: "What is the tight lower bound for comparison-based sorting algorithms?",
                        options: ["Ω(N)", "Ω(N log N)", "Ω(N^2)", "Ω(2^N)"],
                        correctIndex: 1,
                        explanation: "Decision tree analysis proves that any comparison-based sort requires at least Ω(N log N) comparison steps."
                    }
                ],
                "top-3": [
                    {
                        id: "q-3-1",
                        question: "If λ is an eigenvalue of matrix A with eigenvector v, which equation holds true?",
                        options: ["Av = λv", "Aλ = v", "Av = λ^2 v", "A + v = λI"],
                        correctIndex: 0,
                        explanation: "By definition, an eigenvector v under linear transformation A is scaled by scalar factor λ, so Av = λv."
                    }
                ],
                "top-5": [
                    {
                        id: "q-5-1",
                        question: "What does the square of the magnitude of Schrödinger's wave function |Ψ(x,t)|^2 represent?",
                        options: ["Total Energy Density", "Probability Density of finding the particle at position x", "Particle Velocity", "Momentum Uncertainty"],
                        correctIndex: 1,
                        explanation: "Born's statistical interpretation states that |Ψ(x,t)|^2 represents probability density of particle location."
                    }
                ]
            };
            this.saveState();
        }
    }

    getOrCreateQuestionsForTopic(topicId) {
        if (this.state.quizBank[topicId] && this.state.quizBank[topicId].length >= 3) {
            return this.state.quizBank[topicId];
        }

        const topic = this.state.topics.find(t => t.id === topicId);
        const name = topic ? topic.name : "Selected Concept";

        // Dynamically generated conceptual questions
        const generated = [
            {
                id: `gen-${topicId}-1`,
                question: `In fundamental study of ${name}, what is the key primary objective during analysis?`,
                options: [
                    `Minimizing system errors and optimizing core efficiency`,
                    `Ignoring structural edge cases`,
                    `Replacing foundational rules with random heuristics`,
                    `Static linear estimation without validation`
                ],
                correctIndex: 0,
                explanation: `Understanding ${name} requires optimizing core principles while preventing systemic errors.`
            },
            {
                id: `gen-${topicId}-2`,
                question: `When evaluating edge case scenarios in ${name}, which method yields maximum reliability?`,
                options: [
                    `Strict boundary validation and formal verification`,
                    `Random trial without measurements`,
                    `Relying purely on intuitive guesswork`,
                    `De-prioritizing weak feedback loops`
                ],
                correctIndex: 0,
                explanation: `Boundary validation ensures theoretical principles of ${name} hold under extreme conditions.`
            },
            {
                id: `gen-${topicId}-3`,
                question: `How does mastering ${name} directly impact overall exam readiness?`,
                options: [
                    `It establishes core problem-solving frameworks that connect related topics`,
                    `It only affects memorization without conceptual benefit`,
                    `It decreases study efficiency`,
                    `It is completely independent of exam topics`
                ],
                correctIndex: 0,
                explanation: `Deep understanding of ${name} unlocks higher-order synthesis questions on the exam.`
            }
        ];

        this.state.quizBank[topicId] = generated;
        this.saveState();
        return generated;
    }

    updateTopicMastery(topicId, quizScorePercent) {
        const topic = this.state.topics.find(t => t.id === topicId);
        if (!topic) return { oldMastery: 0, newMastery: 0, delta: 0 };

        const oldMastery = topic.masteryLevel || 0;
        let delta = 0;

        if (quizScorePercent >= 80) {
            delta = Math.round(15 + (quizScorePercent - 80) * 0.25);
        } else if (quizScorePercent >= 60) {
            delta = 5;
        } else {
            delta = -10;
        }

        const newMastery = Math.min(100, Math.max(0, oldMastery + delta));
        topic.masteryLevel = newMastery;
        topic.quizzesTaken = (topic.quizzesTaken || 0) + 1;
        if (quizScorePercent >= 60) {
            topic.correctAnswers = (topic.correctAnswers || 0) + 1;
        }
        topic.lastStudied = new Date().toISOString();

        // Save and trigger schedule re-balance
        this.saveState();
        this.generateAdaptiveSchedule();

        return { oldMastery, newMastery, delta };
    }
}

// Instantiate Global Store
const store = new AppStore();

// Synthesizer Web Audio Feedback
class SoundFX {
    static init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    static playSuccess() {
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) {}
    }

    static playError() {
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
            osc.frequency.exponentialRampToValueAtTime(146.83, this.ctx.currentTime + 0.2); // D3
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.35);
        } catch (e) {}
    }
}

// Pomodoro Timer Controller
class PomodoroManager {
    constructor() {
        this.durationMins = 25;
        this.timeRemaining = this.durationMins * 60;
        this.timerId = null;
        this.isRunning = false;

        this.display = document.getElementById('pomo-display');
        this.toggleBtn = document.getElementById('pomo-toggle-btn');
        this.resetBtn = document.getElementById('pomo-reset-btn');
        this.statusLabel = document.getElementById('pomo-status-label');

        this.init();
    }

    init() {
        if (!this.toggleBtn) return;
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.updateDisplay();
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        SoundFX.init();
        this.isRunning = true;
        this.toggleBtn.textContent = 'Pause';
        this.toggleBtn.classList.remove('primary');
        this.statusLabel.textContent = 'Focusing...';
        this.statusLabel.style.color = '#38bdf8';

        this.timerId = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.toggleBtn.textContent = 'Resume';
        this.toggleBtn.classList.add('primary');
        this.statusLabel.textContent = 'Paused';
        this.statusLabel.style.color = '#fbbf24';
    }

    reset() {
        this.pause();
        this.timeRemaining = this.durationMins * 60;
        this.toggleBtn.textContent = 'Start';
        this.statusLabel.textContent = 'Ready';
        this.statusLabel.style.color = '#10b981';
        this.updateDisplay();
    }

    complete() {
        this.reset();
        SoundFX.playSuccess();
        alert('🎉 Pomodoro Focus Session Complete! Great job maintaining focus.');
    }

    updateDisplay() {
        const m = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
        const s = (this.timeRemaining % 60).toString().padStart(2, '0');
        this.display.textContent = `${m}:${s}`;
    }
}

// UI Controller & Views Manager
class UIController {
    constructor() {
        this.pomo = new PomodoroManager();
        this.currentQuizSession = null;
        this.initEventListeners();
        this.renderAll();
        this.startCountdownClock();
    }

    initEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Top Buttons
        document.getElementById('quick-quiz-btn').addEventListener('click', () => {
            this.switchTab('quiz');
        });

        document.getElementById('demo-data-btn').addEventListener('click', () => {
            this.loadDemoData();
        });

        document.getElementById('recalc-ai-btn').addEventListener('click', () => {
            store.generateAdaptiveSchedule();
            this.renderAll();
            this.showNotification('AI Schedule re-balanced based on latest progress!');
        });

        // Modals Open/Close
        document.getElementById('open-subject-modal-btn').addEventListener('click', () => {
            this.openModal('modal-subject');
        });

        document.getElementById('open-topic-modal-btn').addEventListener('click', () => {
            this.populateSubjectDropdowns();
            this.openModal('modal-topic');
        });

        document.getElementById('add-custom-block-btn').addEventListener('click', () => {
            this.populateTopicDropdown('cs-topic');
            document.getElementById('cs-date').value = new Date().toISOString().slice(0, 10);
            this.openModal('modal-custom-session');
        });

        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const overlay = e.target.closest('.modal-overlay');
                if (overlay) overlay.classList.add('hidden');
            });
        });

        // Form Submissions
        document.getElementById('form-subject').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveSubject();
        });

        document.getElementById('form-topic').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveTopic();
        });

        document.getElementById('form-custom-session').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveCustomSession();
        });

        document.getElementById('settings-exam-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveExamSettings();
        });

        // Quiz Arena Controls
        document.getElementById('quiz-select-subject').addEventListener('change', (e) => {
            this.populateTopicDropdown('quiz-select-topic', e.target.value);
        });

        document.querySelectorAll('.quiz-mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.quiz-mode-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
        });

        document.getElementById('start-quiz-session-btn').addEventListener('click', () => {
            this.startQuizSession();
        });

        document.getElementById('quiz-submit-btn').addEventListener('click', () => {
            this.submitQuizAnswer();
        });

        document.getElementById('quiz-next-btn').addEventListener('click', () => {
            this.nextQuizQuestion();
        });

        document.getElementById('quiz-cancel-btn').addEventListener('click', () => {
            if (confirm('Quit quiz early? Progress won\'t be saved.')) {
                this.resetQuizScreen();
            }
        });

        document.getElementById('result-retry-btn').addEventListener('click', () => {
            this.resetQuizScreen();
        });

        document.getElementById('result-back-dash-btn').addEventListener('click', () => {
            this.resetQuizScreen();
            this.switchTab('dashboard');
        });

        // Settings Buttons
        document.getElementById('btn-load-demo-data').addEventListener('click', () => this.loadDemoData());
        document.getElementById('btn-export-data').addEventListener('click', () => this.exportDataJSON());
        document.getElementById('btn-import-data').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });
        document.getElementById('import-file-input').addEventListener('change', (e) => this.importDataJSON(e));
        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if (confirm('Wipe all local planner data and reset?')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        });

        // Topic Mastery Range Label Listener
        document.getElementById('top-mastery').addEventListener('input', (e) => {
            document.getElementById('top-mastery-val').textContent = e.target.value;
        });
    }

    switchTab(tabId) {
        store.state.activeTab = tabId;
        store.saveState();

        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `view-${tabId}`);
        });

        const titles = {
            dashboard: "Dashboard Overview",
            schedule: "Adaptive Master Schedule",
            subjects: "Subjects & Topics Repository",
            quiz: "AI Quiz Arena",
            analytics: "Progress & Exam Analytics",
            settings: "Exam Details & Data Settings"
        };
        document.getElementById('page-title').textContent = titles[tabId] || "AI Study Planner";

        this.renderAll();
    }

    renderAll() {
        this.renderHeaderAndCountdown();
        this.renderDashboard();
        this.renderScheduleView();
        this.renderSubjectsView();
        this.renderQuizSetup();
        this.renderAnalyticsView();
        this.renderSettingsView();
    }

    startCountdownClock() {
        const updateClock = () => {
            const examDate = new Date(store.state.examDetails.examDate);
            const now = new Date();
            const diff = examDate - now;

            if (diff <= 0) {
                document.getElementById('cnt-days').textContent = '00';
                document.getElementById('cnt-hours').textContent = '00';
                document.getElementById('cnt-mins').textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            document.getElementById('cnt-days').textContent = days.toString().padStart(2, '0');
            document.getElementById('cnt-hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('cnt-mins').textContent = mins.toString().padStart(2, '0');
        };

        updateClock();
        setInterval(updateClock, 30000);
    }

    renderHeaderAndCountdown() {
        const { examDetails, topics, streak } = store.state;
        document.getElementById('exam-subtitle').textContent = `Targeting: ${examDetails.title || 'Exam Goal'}`;
        document.getElementById('streak-val').textContent = streak.count || 0;

        // Metric Days
        const examDate = new Date(examDetails.examDate);
        const diffMs = examDate - new Date();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        document.getElementById('metric-days-left').textContent = daysLeft;
        document.getElementById('metric-exam-date').textContent = examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Calculate Overall Readiness
        let totalWeight = 0;
        let weightedMasterySum = 0;
        let masteredCount = 0;

        topics.forEach(t => {
            const w = t.difficulty === 1 ? 1 : (t.difficulty === 2 ? 1.5 : 2);
            totalWeight += w;
            weightedMasterySum += (t.masteryLevel || 0) * w;
            if (t.masteryLevel >= 75) masteredCount++;
        });

        const readinessPercent = totalWeight > 0 ? Math.round(weightedMasterySum / totalWeight) : 0;

        document.getElementById('metric-readiness').textContent = `${readinessPercent}%`;
        document.getElementById('metric-readiness-bar').style.width = `${readinessPercent}%`;

        document.getElementById('metric-topics-mastered').textContent = masteredCount;
        document.getElementById('metric-topics-total').textContent = topics.length;
        const totalMasteryAvg = topics.length > 0 ? Math.round(topics.reduce((acc, t) => acc + (t.masteryLevel || 0), 0) / topics.length) : 0;
        document.getElementById('metric-topics-percent').textContent = `${totalMasteryAvg}% avg topic mastery`;

        // Hours Today
        document.getElementById('metric-target-hours').textContent = `${examDetails.dailyAvailableHours || 3.5}h`;
        const todayStr = new Date().toISOString().slice(0, 10);
        const completedSessions = store.state.scheduleSessions.filter(s => s.date === todayStr && s.completed);
        const loggedMins = completedSessions.reduce((acc, s) => acc + s.duration, 0);
        document.getElementById('metric-completed-today').textContent = `${(loggedMins / 60).toFixed(1)}h completed today`;
    }

    renderDashboard() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todaySessions = store.state.scheduleSessions.filter(s => s.date === todayStr);

        const container = document.getElementById('dashboard-schedule-list');
        container.innerHTML = '';

        if (todaySessions.length === 0) {
            container.innerHTML = `<div class="text-center" style="padding: 20px; color: #94a3b8;">No study blocks scheduled for today. Click "Recalculate AI Schedule" to generate.</div>`;
        } else {
            todaySessions.forEach(sess => {
                const div = document.createElement('div');
                div.className = `schedule-item ${sess.completed ? 'completed' : ''}`;
                div.innerHTML = `
                    <div class="item-check" data-id="${sess.id}">
                        ${sess.completed ? '✓' : ''}
                    </div>
                    <div class="item-time-slot">${sess.timeSlot}</div>
                    <div class="item-content">
                        <div class="item-title">${sess.topicName}</div>
                        <div class="item-meta">
                            <span class="item-subject-tag" style="background: ${sess.subjectColor};">${sess.subjectName}</span>
                            <span>⏱️ ${sess.duration} mins</span>
                            <span>🎯 ${sess.activity}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-sm secondary quiz-topic-btn" data-topic="${sess.topicId}">Quiz</button>
                    </div>
                `;

                div.querySelector('.item-check').addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const session = store.state.scheduleSessions.find(s => s.id === id);
                    if (session) {
                        session.completed = !session.completed;
                        store.saveState();
                        this.renderAll();
                    }
                });

                div.querySelector('.quiz-topic-btn').addEventListener('click', (e) => {
                    const topicId = e.currentTarget.dataset.topic;
                    this.launchTopicQuiz(topicId);
                });

                container.appendChild(div);
            });
        }

        // Weak Topics List
        const weakList = document.getElementById('weak-topics-list');
        weakList.innerHTML = '';

        const weakTopics = [...store.state.topics]
            .sort((a, b) => a.masteryLevel - b.masteryLevel)
            .filter(t => t.masteryLevel < 60)
            .slice(0, 3);

        if (weakTopics.length === 0) {
            weakList.innerHTML = `<div style="font-size: 13px; color: #34d399;">🎉 All topics are above 60% mastery! Solid foundation.</div>`;
        } else {
            weakTopics.forEach(t => {
                const sub = store.state.subjects.find(s => s.id === t.subjectId) || { name: 'General' };
                const div = document.createElement('div');
                div.className = 'weak-topic-card';
                div.innerHTML = `
                    <div class="weak-topic-info">
                        <span class="weak-topic-name">${t.name}</span>
                        <span class="weak-topic-sub">${sub.name} • ${t.difficulty === 3 ? 'Hard' : 'Medium'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="weak-topic-mastery">${t.masteryLevel}%</span>
                        <button class="btn-sm primary quiz-weak-btn" data-topic="${t.id}">Drill</button>
                    </div>
                `;

                div.querySelector('.quiz-weak-btn').addEventListener('click', (e) => {
                    this.launchTopicQuiz(e.currentTarget.dataset.topic);
                });

                weakList.appendChild(div);
            });
        }

        // AI Insight Text
        const lowestTopic = weakTopics[0];
        const aiInsight = document.getElementById('ai-insight-text');
        if (lowestTopic) {
            aiInsight.innerHTML = `Based on your recent mastery index, <strong>${lowestTopic.name}</strong> (${lowestTopic.masteryLevel}% mastery) requires priority allocation. AI has automatically assigned additional review blocks before your target exam date.`;
        } else {
            aiInsight.innerHTML = `Your preparation is well balanced across all subjects. Continue completing daily active recall quizzes to lock in long-term retention.`;
        }
    }

    renderScheduleView() {
        const container = document.getElementById('master-schedule-container');
        container.innerHTML = '';

        const filterSubject = document.getElementById('schedule-filter-subject').value;
        const sessions = store.state.scheduleSessions.filter(s => {
            if (filterSubject === 'all') return true;
            const topic = store.state.topics.find(t => t.id === s.topicId);
            return topic && topic.subjectId === filterSubject;
        });

        // Group by Date
        const grouped = {};
        sessions.forEach(s => {
            if (!grouped[s.date]) grouped[s.date] = [];
            grouped[s.date].push(s);
        });

        const sortedDates = Object.keys(grouped).sort();

        if (sortedDates.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 40px;">No schedule blocks found. Click "Recalculate AI Schedule" to populate.</div>`;
            return;
        }

        sortedDates.forEach(dateStr => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            const dayBox = document.createElement('div');
            dayBox.style.marginBottom = '20px';
            dayBox.innerHTML = `
                <h3 style="font-size: 15px; color: #38bdf8; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
                    📅 ${formattedDate}
                </h3>
                <div class="schedule-timeline" id="sched-group-${dateStr}"></div>
            `;

            container.appendChild(dayBox);
            const groupList = dayBox.querySelector(`#sched-group-${dateStr}`);

            grouped[dateStr].forEach(sess => {
                const item = document.createElement('div');
                item.className = `schedule-item ${sess.completed ? 'completed' : ''}`;
                item.innerHTML = `
                    <div class="item-check" data-id="${sess.id}">
                        ${sess.completed ? '✓' : ''}
                    </div>
                    <div class="item-time-slot">${sess.timeSlot}</div>
                    <div class="item-content">
                        <div class="item-title">${sess.topicName}</div>
                        <div class="item-meta">
                            <span class="item-subject-tag" style="background: ${sess.subjectColor};">${sess.subjectName}</span>
                            <span>⏱️ ${sess.duration} mins</span>
                            <span>🎯 ${sess.activity}</span>
                        </div>
                    </div>
                    <button class="btn-sm secondary quiz-topic-btn" data-topic="${sess.topicId}">Quiz</button>
                `;

                item.querySelector('.item-check').addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const session = store.state.scheduleSessions.find(s => s.id === id);
                    if (session) {
                        session.completed = !session.completed;
                        store.saveState();
                        this.renderAll();
                    }
                });

                item.querySelector('.quiz-topic-btn').addEventListener('click', (e) => {
                    this.launchTopicQuiz(e.currentTarget.dataset.topic);
                });

                groupList.appendChild(item);
            });
        });
    }

    renderSubjectsView() {
        const grid = document.getElementById('subjects-grid');
        grid.innerHTML = '';

        store.state.subjects.forEach(sub => {
            const subTopics = store.state.topics.filter(t => t.subjectId === sub.id);
            const avgMastery = subTopics.length > 0 ? Math.round(subTopics.reduce((a, b) => a + (b.masteryLevel || 0), 0) / subTopics.length) : 0;

            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <div class="subject-card-header">
                    <div class="subject-title-flex">
                        <div class="subject-icon-box" style="background: ${sub.color}22; color: ${sub.color};">
                            ${sub.icon || '📚'}
                        </div>
                        <div>
                            <div class="subject-name">${sub.name}</div>
                            <div style="font-size: 12px; color: #94a3b8;">${subTopics.length} Topics</div>
                        </div>
                    </div>
                </div>

                <div class="subject-progress-container">
                    <div class="subject-progress-label">
                        <span>Subject Mastery</span>
                        <span style="font-weight: 700; color: #ffffff;">${avgMastery}%</span>
                    </div>
                    <div class="progress-bar-sm">
                        <div class="progress-fill-cyan" style="width: ${avgMastery}%; background: ${sub.color};"></div>
                    </div>
                </div>

                <div class="topics-inner-list">
                    ${subTopics.map(t => `
                        <div class="topic-row-item">
                            <span class="topic-row-name">${t.name}</span>
                            <div class="topic-row-meta">
                                <span class="badge ${t.difficulty === 1 ? 'diff-easy' : (t.difficulty === 2 ? 'diff-med' : 'diff-hard')}">
                                    ${t.difficulty === 1 ? 'Easy' : (t.difficulty === 2 ? 'Med' : 'Hard')}
                                </span>
                                <span style="font-weight: 700; font-size: 13px; color: ${t.masteryLevel >= 70 ? '#34d399' : '#f87171'};">${t.masteryLevel}%</span>
                                <button class="btn-sm secondary quiz-topic-btn" data-topic="${t.id}">Quiz</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            card.querySelectorAll('.quiz-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.launchTopicQuiz(e.currentTarget.dataset.topic);
                });
            });

            grid.appendChild(card);
        });
    }

    renderQuizSetup() {
        const subSelect = document.getElementById('quiz-select-subject');
        subSelect.innerHTML = store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        if (store.state.subjects.length > 0) {
            this.populateTopicDropdown('quiz-select-topic', store.state.subjects[0].id);
        }

        // Filter subject dropdown in Schedule view too
        const schedFilter = document.getElementById('schedule-filter-subject');
        schedFilter.innerHTML = '<option value="all">All Subjects</option>' + store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    launchTopicQuiz(topicId) {
        const topic = store.state.topics.find(t => t.id === topicId);
        if (!topic) return;

        this.switchTab('quiz');
        document.getElementById('quiz-select-subject').value = topic.subjectId;
        this.populateTopicDropdown('quiz-select-topic', topic.subjectId);
        document.getElementById('quiz-select-topic').value = topicId;
        
        this.startQuizSession();
    }

    startQuizSession() {
        const topicId = document.getElementById('quiz-select-topic').value;
        const topic = store.state.topics.find(t => t.id === topicId);
        if (!topic) return;

        const questions = store.getOrCreateQuestionsForTopic(topicId);

        this.currentQuizSession = {
            topicId: topicId,
            topicName: topic.name,
            questions: questions,
            currentIndex: 0,
            userAnswers: [],
            score: 0
        };

        document.getElementById('quiz-setup-screen').classList.add('hidden');
        document.getElementById('quiz-result-screen').classList.add('hidden');
        document.getElementById('quiz-active-screen').classList.remove('hidden');

        this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        const session = this.currentQuizSession;
        const q = session.questions[session.currentIndex];

        document.getElementById('quiz-topic-badge').textContent = `${session.topicName}`;
        document.getElementById('quiz-q-curr').textContent = session.currentIndex + 1;
        document.getElementById('quiz-q-total').textContent = session.questions.length;

        const percent = Math.round(((session.currentIndex + 1) / session.questions.length) * 100);
        document.getElementById('quiz-progress-fill').style.width = `${percent}%`;

        document.getElementById('quiz-question-text').textContent = q.question;
        document.getElementById('quiz-explanation-box').classList.add('hidden');

        const submitBtn = document.getElementById('quiz-submit-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = true;
        nextBtn.classList.add('hidden');

        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = '';

        const prefixes = ['A', 'B', 'C', 'D'];
        q.options.forEach((optText, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.dataset.index = index;
            btn.innerHTML = `
                <span class="opt-prefix">${prefixes[index]}</span>
                <span>${optText}</span>
            `;

            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                submitBtn.disabled = false;
            });

            optionsContainer.appendChild(btn);
        });
    }

    submitQuizAnswer() {
        const selectedBtn = document.querySelector('.quiz-option-btn.selected');
        if (!selectedBtn) return;

        const selectedIndex = parseInt(selectedBtn.dataset.index);
        const session = this.currentQuizSession;
        const q = session.questions[session.currentIndex];

        const isCorrect = selectedIndex === q.correctIndex;
        if (isCorrect) {
            session.score++;
            SoundFX.playSuccess();
        } else {
            SoundFX.playError();
        }

        session.userAnswers.push({ selectedIndex, isCorrect });

        // Highlight options
        document.querySelectorAll('.quiz-option-btn').forEach((btn, index) => {
            btn.disabled = true;
            if (index === q.correctIndex) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        // Show Explanation
        const expBox = document.getElementById('quiz-explanation-box');
        document.getElementById('quiz-exp-title').textContent = isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect';
        document.getElementById('quiz-exp-title').style.color = isCorrect ? '#34d399' : '#f87171';
        document.getElementById('quiz-exp-text').textContent = q.explanation;
        expBox.classList.remove('hidden');

        // Toggle buttons
        document.getElementById('quiz-submit-btn').classList.add('hidden');
        document.getElementById('quiz-next-btn').classList.remove('hidden');
    }

    nextQuizQuestion() {
        const session = this.currentQuizSession;
        session.currentIndex++;

        if (session.currentIndex >= session.questions.length) {
            this.finishQuizSession();
        } else {
            this.renderQuizQuestion();
        }
    }

    finishQuizSession() {
        const session = this.currentQuizSession;
        const scorePercent = Math.round((session.score / session.questions.length) * 100);

        // Update Topic Mastery in Store
        const { oldMastery, newMastery, delta } = store.updateTopicMastery(session.topicId, scorePercent);

        document.getElementById('quiz-active-screen').classList.add('hidden');
        document.getElementById('quiz-result-screen').classList.remove('hidden');

        document.getElementById('result-score-percent').textContent = `${scorePercent}%`;
        document.getElementById('result-old-mastery').textContent = `${oldMastery}%`;
        document.getElementById('result-new-mastery').textContent = `${newMastery}%`;

        const deltaBadge = document.getElementById('result-delta-badge');
        deltaBadge.textContent = `${delta >= 0 ? '+' : ''}${delta}%`;
        deltaBadge.className = `change-badge ${delta >= 0 ? 'positive' : 'warning-badge'}`;

        document.getElementById('result-emoji').textContent = scorePercent >= 80 ? '🌟' : (scorePercent >= 60 ? '👍' : '💡');
        document.getElementById('result-title').textContent = scorePercent >= 80 ? 'Excellent Mastery!' : 'Keep Practicing!';

        this.renderAll();
    }

    resetQuizScreen() {
        this.currentQuizSession = null;
        document.getElementById('quiz-active-screen').classList.add('hidden');
        document.getElementById('quiz-result-screen').classList.add('hidden');
        document.getElementById('quiz-setup-screen').classList.remove('hidden');
    }

    renderAnalyticsView() {
        this.renderSubjectMasteryChart();
        this.renderReadinessTrendChart();
        this.renderTopicsMasteryTable();
    }

    renderSubjectMasteryChart() {
        const canvas = document.getElementById('chart-subject-mastery');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.clientWidth;
        const height = canvas.height = 260;

        ctx.clearRect(0, 0, width, height);

        const subjects = store.state.subjects;
        if (subjects.length === 0) return;

        const barWidth = Math.min(60, (width - 80) / subjects.length);
        const maxBarHeight = 160;

        subjects.forEach((sub, i) => {
            const subTopics = store.state.topics.filter(t => t.subjectId === sub.id);
            const avgMastery = subTopics.length > 0 ? Math.round(subTopics.reduce((a, b) => a + (b.masteryLevel || 0), 0) / subTopics.length) : 0;
            
            const x = 50 + i * (barWidth + 30);
            const barH = (avgMastery / 100) * maxBarHeight;
            const y = height - 40 - barH;

            // Draw Bar Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(x, height - 40 - maxBarHeight, barWidth, maxBarHeight);

            // Draw Filled Bar Gradient
            const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
            gradient.addColorStop(0, sub.color);
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barH);

            // Value text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(`${avgMastery}%`, x + barWidth / 2, y - 8);

            // Label text
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Inter';
            const shortName = sub.name.length > 12 ? sub.name.slice(0, 10) + '..' : sub.name;
            ctx.fillText(shortName, x + barWidth / 2, height - 16);
        });
    }

    renderReadinessTrendChart() {
        const canvas = document.getElementById('chart-readiness-trend');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.clientWidth;
        const height = canvas.height = 260;

        ctx.clearRect(0, 0, width, height);

        // Simulated readiness trend over 7 days
        const points = [35, 42, 48, 55, 62, 70, 78];
        const stepX = (width - 80) / (points.length - 1);
        const maxY = 160;

        ctx.beginPath();
        points.forEach((val, i) => {
            const x = 40 + i * stepX;
            const y = height - 40 - (val / 100) * maxY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw points & area gradient
        const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
        areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.lineTo(40 + (points.length - 1) * stepX, height - 40);
        ctx.lineTo(40, height - 40);
        ctx.closePath();
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Draw point dots
        points.forEach((val, i) => {
            const x = 40 + i * stepX;
            const y = height - 40 - (val / 100) * maxY;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#6366f1';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    renderTopicsMasteryTable() {
        const tbody = document.getElementById('analytics-topics-table');
        tbody.innerHTML = '';

        store.state.topics.forEach(t => {
            const sub = store.state.subjects.find(s => s.id === t.subjectId) || { name: 'General' };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600; color: #ffffff;">${sub.name}</td>
                <td>${t.name}</td>
                <td><span class="badge ${t.difficulty === 1 ? 'diff-easy' : (t.difficulty === 2 ? 'diff-med' : 'diff-hard')}">${t.difficulty === 1 ? 'Easy' : (t.difficulty === 2 ? 'Medium' : 'Hard')}</span></td>
                <td>${t.estimatedHours} hrs</td>
                <td style="font-weight: 700; color: ${t.masteryLevel >= 70 ? '#34d399' : '#f87171'};">${t.masteryLevel}%</td>
                <td>${t.quizzesTaken || 0}</td>
                <td><span class="badge ${t.masteryLevel >= 75 ? 'success-badge' : 'warning-badge'}">${t.masteryLevel >= 75 ? 'Mastered' : 'Needs Review'}</span></td>
                <td><button class="btn-sm secondary quiz-table-btn" data-topic="${t.id}">Take Quiz</button></td>
            `;

            tr.querySelector('.quiz-table-btn').addEventListener('click', (e) => {
                this.launchTopicQuiz(e.currentTarget.dataset.topic);
            });

            tbody.appendChild(tr);
        });
    }

    renderSettingsView() {
        const { examDetails } = store.state;
        document.getElementById('set-exam-title').value = examDetails.title || '';
        document.getElementById('set-exam-date').value = examDetails.examDate || '';
        document.getElementById('set-target-score').value = examDetails.targetScore || 90;
        document.getElementById('set-daily-hours').value = examDetails.dailyAvailableHours || 3.5;
        document.getElementById('set-peak-time').value = examDetails.peakTime || 'evening';
    }

    // Modal Form Handlers
    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    populateSubjectDropdowns() {
        const select = document.getElementById('top-subject');
        select.innerHTML = store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    populateTopicDropdown(selectElementId, filterSubjectId = null) {
        const select = document.getElementById(selectElementId);
        let topics = store.state.topics;
        if (filterSubjectId) {
            topics = topics.filter(t => t.subjectId === filterSubjectId);
        }
        select.innerHTML = topics.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    handleSaveSubject() {
        const name = document.getElementById('sub-name').value.trim();
        const color = document.getElementById('sub-color').value;
        const icon = document.getElementById('sub-icon').value;

        if (!name) return;

        const newSubject = {
            id: `sub-${Date.now()}`,
            name,
            color,
            icon
        };

        store.state.subjects.push(newSubject);
        store.saveState();
        document.getElementById('modal-subject').classList.add('hidden');
        document.getElementById('form-subject').reset();
        this.renderAll();
        this.showNotification(`Added Subject: ${name}`);
    }

    handleSaveTopic() {
        const subjectId = document.getElementById('top-subject').value;
        const name = document.getElementById('top-name').value.trim();
        const difficulty = parseInt(document.getElementById('top-difficulty').value);
        const estimatedHours = parseFloat(document.getElementById('top-hours').value);
        const masteryLevel = parseInt(document.getElementById('top-mastery').value);

        if (!name || !subjectId) return;

        const newTopic = {
            id: `top-${Date.now()}`,
            subjectId,
            name,
            difficulty,
            estimatedHours,
            masteryLevel,
            quizzesTaken: 0,
            correctAnswers: 0,
            lastStudied: null
        };

        store.state.topics.push(newTopic);
        store.generateAdaptiveSchedule();
        document.getElementById('modal-topic').classList.add('hidden');
        document.getElementById('form-topic').reset();
        this.renderAll();
        this.showNotification(`Added Topic: ${name}`);
    }

    handleSaveCustomSession() {
        const topicId = document.getElementById('cs-topic').value;
        const dateStr = document.getElementById('cs-date').value;
        const duration = parseInt(document.getElementById('cs-duration').value);
        const activity = document.getElementById('cs-activity').value;

        const topic = store.state.topics.find(t => t.id === topicId);
        const subject = store.state.subjects.find(s => s.id === topic?.subjectId) || { name: 'General', color: '#6366f1' };

        if (!topic) return;

        store.state.scheduleSessions.unshift({
            id: `cs-${Date.now()}`,
            topicId,
            topicName: topic.name,
            subjectName: subject.name,
            subjectColor: subject.color,
            date: dateStr,
            dayOffset: 0,
            timeSlot: "Custom Block",
            duration,
            activity,
            completed: false,
            urgencyScore: 5
        });

        store.saveState();
        document.getElementById('modal-custom-session').classList.add('hidden');
        this.renderAll();
        this.showNotification('Custom study block added to schedule!');
    }

    handleSaveExamSettings() {
        store.state.examDetails = {
            title: document.getElementById('set-exam-title').value.trim(),
            examDate: document.getElementById('set-exam-date').value,
            targetScore: parseInt(document.getElementById('set-target-score').value),
            dailyAvailableHours: parseFloat(document.getElementById('set-daily-hours').value),
            peakTime: document.getElementById('set-peak-time').value
        };

        store.generateAdaptiveSchedule();
        this.renderAll();
        this.showNotification('Exam settings saved & schedule updated!');
    }

    loadDemoData() {
        localStorage.removeItem(STORAGE_KEY);
        store.state = JSON.parse(JSON.stringify(defaultState));
        store.generateAdaptiveSchedule();
        this.renderAll();
        this.showNotification('Loaded full sample exam dataset!');
    }

    exportDataJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `ai_study_planner_backup_${new Date().toISOString().slice(0,10)}.json`);
        dlAnchorElem.click();
    }

    importDataJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                store.state = parsed;
                store.saveState();
                this.renderAll();
                this.showNotification('Planner data imported successfully!');
            } catch (err) {
                alert('Invalid JSON file format.');
            }
        };
        reader.readAsText(file);
    }

    showNotification(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = `✨ ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.appUI = new UIController();
});
