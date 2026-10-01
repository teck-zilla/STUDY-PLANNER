/**
 * AetherMind AI Study Planner & Exam Mastery Engine
 * Vanilla JavaScript SPA with Adaptive AI Scheduling, Interactive Quiz Arena,
 * Spaced Repetition Flashcards (SM-2), Weekly Calendar Grid & Cloud Auth Engine
 */

const STORAGE_KEY = 'aethermind_ai_study_planner_v1';

// Default State Model
const defaultState = {
    user: {
        name: "Guest Student",
        email: "guest@local",
        isLoggedIn: false,
        authStatus: "Offline Local Mode"
    },
    examDetails: {
        title: "Computer Science & Engineering Finals",
        examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
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
    topicNotes: {
        "top-1": "Binary Tree Height h <= log2(N+1). AVL Trees maintain balance factor <= 1.",
        "top-3": "Eigenvalues: det(A - λI) = 0. Eigenvectors: (A - λI)v = 0."
    },
    flashcards: [
        { id: "fc-1", topicId: "top-1", front: "What is the worst-case search time in an unbalanced BST?", back: "O(N). Elements can form a degenerate linear chain.", notes: "Use AVL or Red-Black trees to enforce O(log N).", interval: 1, repetition: 0, easeFactor: 2.5, dueDate: new Date().toISOString().slice(0, 10) },
        { id: "fc-2", topicId: "top-2", front: "What is the tight lower bound for comparison-based sorting?", back: "Ω(N log N)", notes: "Proved using decision tree depth analysis.", interval: 2, repetition: 1, easeFactor: 2.5, dueDate: new Date().toISOString().slice(0, 10) },
        { id: "fc-3", topicId: "top-3", front: "What equation defines an eigenvalue λ and eigenvector v?", back: "Av = λv", notes: "Characteristic polynomial: det(A - λI) = 0.", interval: 4, repetition: 2, easeFactor: 2.6, dueDate: new Date().toISOString().slice(0, 10) }
    ],
    scheduleSessions: [],
    scheduleViewMode: "list",
    quizBank: {},
    studyLogs: [
        { id: "log-1", date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0,10), minutes: 120, topicId: "top-1" },
        { id: "log-2", date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0,10), minutes: 180, topicId: "top-3" },
        { id: "log-3", date: new Date().toISOString().slice(0,10), minutes: 90, topicId: "top-2" }
    ],
    aiConfig: {
        apiKey: "",
        model: "gemini-1.5-flash",
        persona: "supportive"
    },
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

        const customSessions = (this.state.scheduleSessions || []).filter(s => s.isCustom || (s.id && s.id.startsWith('cs-')));

        const scoredTopics = topics.map(t => {
            const diffWeight = t.difficulty === 1 ? 1.0 : (t.difficulty === 2 ? 1.5 : 2.0);
            const deficit = (100 - (t.masteryLevel || 0)) / 100;
            const urgency = diffWeight * (deficit * 0.7 + 0.3) * (t.estimatedHours || 4);
            return { ...t, urgency };
        });

        scoredTopics.sort((a, b) => b.urgency - a.urgency);

        const newSessions = [...customSessions];
        const timeSlots = ["Morning (09:00)", "Afternoon (14:00)", "Evening (18:30)", "Night (21:00)"];

        if (scoredTopics.length > 0) {
            for (let d = 0; d < Math.min(7, daysLeft); d++) {
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() + d);
                const dateStr = currentDate.toISOString().slice(0, 10);

                let remainingMinsToday = dailyCapMins;
                let slotIndex = 0;

                for (let i = 0; i < scoredTopics.length && remainingMinsToday >= 30; i++) {
                    const topic = scoredTopics[(i + d) % scoredTopics.length];
                    const duration = Math.min(60, remainingMinsToday);
                    const subject = subjects.find(s => s.id === topic.subjectId) || { name: "General", color: "#6366f1" };

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
                        explanation: "In an unbalanced BST, elements can form a degenerate linear chain, resulting in O(N) traversal time."
                    },
                    {
                        id: "q-1-2",
                        question: "Which data structure operates on LIFO (Last In, First Out) principle?",
                        options: ["Queue", "Stack", "Heap", "Hash Table"],
                        correctIndex: 1,
                        explanation: "A Stack operates on LIFO ordering where elements are added and removed from the top."
                    }
                ],
                "top-2": [
                    {
                        id: "q-2-1",
                        question: "Which algorithm design strategy does QuickSort utilize?",
                        options: ["Greedy Approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
                        correctIndex: 2,
                        explanation: "QuickSort partitions an array around a pivot and recursively sorts subarrays (Divide and Conquer)."
                    }
                ]
            };
            this.saveState();
        }
    }

    async fetchAIQuestions(topicName) {
        const { apiKey, model } = this.state.aiConfig || {};
        if (!apiKey) return null;

        try {
            const prompt = `Generate 3 multiple choice quiz questions for topic "${topicName}". Return ONLY a raw JSON array of objects with keys: "question", "options" (array of 4 strings), "correctIndex" (integer 0-3), and "explanation". Do not wrap in markdown tags.`;
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) return null;

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const questions = JSON.parse(cleaned);
            
            return questions.map((q, i) => ({
                id: `ai-gen-${Date.now()}-${i}`,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation
            }));
        } catch (e) {
            console.error("Gemini API generation error:", e);
            return null;
        }
    }

    getOrCreateQuestionsForTopic(topicId) {
        const existing = this.state.quizBank[topicId] || [];
        if (existing.length >= 3) {
            return existing;
        }

        const topic = this.state.topics.find(t => t.id === topicId);
        const name = topic ? topic.name : "Selected Concept";

        const needed = 3 - existing.length;
        const generated = [];
        for (let i = 1; i <= needed; i++) {
            const idx = existing.length + i;
            generated.push({
                id: `gen-${topicId}-${idx}`,
                question: `In fundamental study of ${name} (Part ${idx}), what is the primary objective during analysis?`,
                options: [
                    `Minimizing system errors and optimizing core efficiency`,
                    `Ignoring structural edge cases`,
                    `Replacing foundational rules with random heuristics`,
                    `Static linear estimation without validation`
                ],
                correctIndex: 0,
                explanation: `Understanding ${name} requires optimizing core principles while preventing systemic errors.`
            });
        }

        const combined = [...existing, ...generated];
        this.state.quizBank[topicId] = combined;
        this.saveState();
        return combined;
    }

    rateFlashcard(cardId, rating) {
        const fc = (this.state.flashcards || []).find(c => c.id === cardId);
        if (!fc) return;

        let { interval = 1, repetition = 0, easeFactor = 2.5 } = fc;

        if (rating < 2) {
            repetition = 0;
            interval = 1;
        } else {
            if (repetition === 0) interval = 1;
            else if (repetition === 1) interval = 6;
            else interval = Math.round(interval * easeFactor);
            repetition += 1;
        }

        easeFactor = easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        const due = new Date();
        due.setDate(due.getDate() + interval);
        
        fc.interval = interval;
        fc.repetition = repetition;
        fc.easeFactor = Math.round(easeFactor * 100) / 100;
        fc.dueDate = due.toISOString().slice(0, 10);

        if (rating >= 3 && fc.topicId) {
            const topic = this.state.topics.find(t => t.id === fc.topicId);
            if (topic) {
                topic.masteryLevel = Math.min(100, (topic.masteryLevel || 0) + 3);
            }
        }

        this.checkAndUpdateStreak();
        this.saveState();
    }

    checkAndUpdateStreak() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const streak = this.state.streak || { count: 0, lastDate: null };

        if (streak.lastDate === todayStr) {
            return;
        }

        if (streak.lastDate) {
            const last = new Date(streak.lastDate + 'T00:00:00');
            const today = new Date(todayStr + 'T00:00:00');
            const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak.count += 1;
            } else if (diffDays > 1) {
                streak.count = 1;
            }
        } else {
            streak.count = 1;
        }

        streak.lastDate = todayStr;
        this.state.streak = streak;
        this.saveState();
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

        this.checkAndUpdateStreak();
        this.saveState();
        this.generateAdaptiveSchedule();

        return { oldMastery, newMastery, delta };
    }
}

// Global Store Instance
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
            osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.15);
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
            osc.frequency.setValueAtTime(220, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(146.83, this.ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.35);
        } catch (e) {}
    }
}

// Desktop Web Notifications Manager
class NotificationManager {
    static requestPermission(callback) {
        if (!('Notification' in window)) {
            alert('Desktop notifications are not supported in this browser.');
            return;
        }
        Notification.requestPermission().then(permission => {
            if (callback) callback(permission);
        });
    }

    static send(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, { body });
            } catch (e) {}
        }
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
        NotificationManager.send('🎯 Focus Session Complete!', 'Great work maintaining focus. Take a 5-minute break!');
        alert('🎉 Pomodoro Focus Session Complete! Great job maintaining focus.');
    }

    updateDisplay() {
        const m = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
        const s = (this.timeRemaining % 60).toString().padStart(2, '0');
        this.display.textContent = `${m}:${s}`;
    }
}

// Live Session Stopwatch Manager
class StopwatchManager {
    constructor() {
        this.seconds = 0;
        this.timerId = null;
        this.isRunning = false;

        this.display = document.getElementById('stopwatch-display');
        this.toggleBtn = document.getElementById('stopwatch-toggle-btn');
        this.logBtn = document.getElementById('stopwatch-log-btn');
        this.statusLabel = document.getElementById('stopwatch-status-label');

        this.init();
    }

    init() {
        if (!this.toggleBtn) return;
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.logBtn.addEventListener('click', () => this.logSession());
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
        this.isRunning = true;
        this.toggleBtn.textContent = 'Pause';
        this.toggleBtn.classList.remove('primary');
        if (this.statusLabel) {
            this.statusLabel.textContent = 'Logging...';
            this.statusLabel.style.color = '#38bdf8';
        }

        this.timerId = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.toggleBtn.textContent = 'Resume';
        this.toggleBtn.classList.add('primary');
        if (this.statusLabel) {
            this.statusLabel.textContent = 'Paused';
            this.statusLabel.style.color = '#fbbf24';
        }
    }

    logSession() {
        if (this.seconds < 60) {
            alert('Study session must be at least 1 minute to log.');
            return;
        }

        const loggedMins = Math.round(this.seconds / 60);
        this.pause();
        this.seconds = 0;
        this.updateDisplay();
        this.toggleBtn.textContent = 'Start';
        if (this.statusLabel) {
            this.statusLabel.textContent = 'Idle';
            this.statusLabel.style.color = '#10b981';
        }

        const todayStr = new Date().toISOString().slice(0, 10);
        store.state.studyLogs.push({
            id: `log-${Date.now()}`,
            date: todayStr,
            minutes: loggedMins,
            topicId: store.state.topics[0]?.id || null
        });

        store.checkAndUpdateStreak();
        store.saveState();

        if (window.appUI) {
            window.appUI.renderAll();
            window.appUI.showNotification(`Logged ${loggedMins} minutes of study session!`);
        }
    }

    updateDisplay() {
        const hrs = Math.floor(this.seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((this.seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        if (this.display) this.display.textContent = `${hrs}:${mins}:${secs}`;
    }
}

// UI Controller & Views Manager
class UIController {
    constructor() {
        this.pomo = new PomodoroManager();
        this.stopwatch = new StopwatchManager();
        this.currentQuizSession = null;
        this.currentFlashcardIndex = 0;
        this.initEventListeners();
        this.renderAll();
        this.startCountdownClock();
    }

    initEventListeners() {
        // Mobile Sidebar Toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebarBackdrop = document.getElementById('sidebar-backdrop');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
                this.closeMobileSidebar();
            });
        });

        // Top Header Actions
        document.getElementById('quick-quiz-btn').addEventListener('click', () => {
            this.switchTab('quiz');
        });

        document.getElementById('demo-data-btn').addEventListener('click', () => {
            this.loadDemoData();
        });

        document.getElementById('open-auth-modal-btn').addEventListener('click', () => {
            this.openAuthModal();
        });

        document.getElementById('recalc-ai-btn').addEventListener('click', () => {
            store.generateAdaptiveSchedule();
            this.renderAll();
            this.showNotification('AI Schedule re-balanced based on latest progress!');
        });

        // View Mode Switcher in Schedule
        const listBtn = document.getElementById('sched-view-list-btn');
        const gridBtn = document.getElementById('sched-view-grid-btn');
        if (listBtn && gridBtn) {
            listBtn.addEventListener('click', () => {
                store.state.scheduleViewMode = 'list';
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
                this.renderScheduleView();
            });

            gridBtn.addEventListener('click', () => {
                store.state.scheduleViewMode = 'grid';
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
                this.renderScheduleView();
            });
        }

        // Schedule Filter Dropdown
        const scheduleFilterSelect = document.getElementById('schedule-filter-subject');
        if (scheduleFilterSelect) {
            scheduleFilterSelect.addEventListener('change', () => {
                this.renderScheduleView();
            });
        }

        // Flashcards Filter & Flip interaction
        const fcFilter = document.getElementById('flashcard-subject-filter');
        if (fcFilter) {
            fcFilter.addEventListener('change', () => {
                this.currentFlashcardIndex = 0;
                this.renderFlashcardsView();
            });
        }

        const fcCard = document.getElementById('flashcard-flip-card');
        if (fcCard) {
            fcCard.addEventListener('click', () => {
                fcCard.classList.toggle('flipped');
            });
        }

        // SM-2 Rating Buttons
        document.querySelectorAll('#sm2-rating-bar .sm2-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rating = parseInt(e.currentTarget.dataset.rating);
                this.handleFlashcardRating(rating);
            });
        });

        document.getElementById('open-flashcard-modal-btn').addEventListener('click', () => {
            this.openFlashcardModal();
        });

        // Modals Open/Close
        document.getElementById('open-subject-modal-btn').addEventListener('click', () => {
            this.openSubjectModal();
        });

        document.getElementById('open-topic-modal-btn').addEventListener('click', () => {
            this.openTopicModal();
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

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
                this.closeMobileSidebar();
            } else if (e.code === 'Space' && store.state.activeTab === 'flashcards') {
                const fcCard = document.getElementById('flashcard-flip-card');
                if (fcCard) fcCard.classList.toggle('flipped');
            }
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

        document.getElementById('form-topic-notes').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveTopicNotes();
        });

        document.getElementById('form-flashcard').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveFlashcard();
        });

        document.getElementById('form-custom-session').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveCustomSession();
        });

        document.getElementById('settings-exam-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveExamSettings();
        });

        const aiForm = document.getElementById('settings-ai-form');
        if (aiForm) {
            aiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveAISettings();
            });
        }

        // Auth Tabs & Forms
        const loginTab = document.getElementById('tab-auth-login');
        const signupTab = document.getElementById('tab-auth-signup');
        if (loginTab && signupTab) {
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                document.getElementById('form-auth-login').classList.remove('hidden');
                document.getElementById('form-auth-signup').classList.add('hidden');
            });

            signupTab.addEventListener('click', () => {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
                document.getElementById('form-auth-signup').classList.remove('hidden');
                document.getElementById('form-auth-login').classList.add('hidden');
            });
        }

        document.getElementById('form-auth-login').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthLogin();
        });

        document.getElementById('form-auth-signup').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSignup();
        });

        document.getElementById('auth-google-btn').addEventListener('click', () => {
            this.handleAuthGoogle();
        });

        document.getElementById('auth-logout-btn').addEventListener('click', () => {
            this.handleAuthLogout();
        });

        // Notifications Request Button
        const notifyBtn = document.getElementById('btn-request-notifications');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                NotificationManager.requestPermission(permission => {
                    if (permission === 'granted') {
                        this.showNotification('Desktop Notifications Enabled!');
                        NotificationManager.send('AetherMind AI Planner', 'Notifications successfully configured!');
                    } else {
                        alert('Notification permission was denied.');
                    }
                });
            });
        }

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

        // Settings Data Buttons
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

        document.getElementById('top-mastery').addEventListener('input', (e) => {
            document.getElementById('top-mastery-val').textContent = e.target.value;
        });

        window.addEventListener('resize', () => {
            if (store.state.activeTab === 'analytics') {
                this.renderAnalyticsView();
            }
        });
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('hidden');
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.add('hidden');
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
            flashcards: "Active Recall & Spaced Repetition",
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
        this.renderFlashcardsView();
        this.renderQuizSetup();
        this.renderAnalyticsView();
        this.renderSettingsView();
    }

    startCountdownClock() {
        const updateClock = () => {
            const examDate = new Date(store.state.examDetails.examDate);
            const now = new Date();
            const diff = examDate - now;

            if (isNaN(diff) || diff <= 0) {
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
        const { examDetails, topics, streak, user } = store.state;
        document.getElementById('exam-subtitle').textContent = `Targeting: ${examDetails.title || 'Exam Goal'}`;
        document.getElementById('streak-val').textContent = streak.count || 0;

        // User Auth Pill Widget State
        const userObj = user || defaultState.user;
        document.getElementById('header-user-name').textContent = userObj.name || "Guest Student";
        document.getElementById('header-auth-status').textContent = userObj.isLoggedIn ? "Cloud Synced" : "Offline Guest";
        document.getElementById('header-avatar-circle').textContent = userObj.isLoggedIn ? "🎓" : "👤";

        // Metric Days
        const examDate = new Date(examDetails.examDate);
        const diffMs = examDate - new Date();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        document.getElementById('metric-days-left').textContent = daysLeft;
        document.getElementById('metric-exam-date').textContent = isNaN(examDate.getTime()) ? 'Date not set' : examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Overall Readiness Index
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
                        if (session.completed) {
                            store.checkAndUpdateStreak();
                        }
                        store.saveState();
                        this.renderAll();
                    }
                });

                div.querySelector('.quiz-topic-btn').addEventListener('click', (e) => {
                    this.launchTopicQuiz(e.currentTarget.dataset.topic);
                });

                container.appendChild(div);
            });
        }

        // Weak Topics
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

        // AI Insight Banner
        const lowestTopic = weakTopics[0];
        const aiInsight = document.getElementById('ai-insight-text');
        if (lowestTopic) {
            aiInsight.innerHTML = `Based on your recent mastery index, <strong>${lowestTopic.name}</strong> (${lowestTopic.masteryLevel}% mastery) requires priority allocation. AI has automatically assigned additional review blocks before your target exam date.`;
        } else {
            aiInsight.innerHTML = `Your preparation is well balanced across all subjects. Continue completing daily active recall quizzes to lock in long-term retention.`;
        }
    }

    renderScheduleView() {
        const listContainer = document.getElementById('master-schedule-container');
        const gridContainer = document.getElementById('weekly-calendar-grid');
        const mode = store.state.scheduleViewMode || 'list';

        const filterSelect = document.getElementById('schedule-filter-subject');
        const filterSubject = filterSelect ? filterSelect.value : 'all';

        const sessions = store.state.scheduleSessions.filter(s => {
            if (filterSubject === 'all') return true;
            const topic = store.state.topics.find(t => t.id === s.topicId);
            return topic && topic.subjectId === filterSubject;
        });

        if (mode === 'grid') {
            listContainer.classList.add('hidden');
            gridContainer.classList.remove('hidden');
            this.renderWeeklyCalendarGrid(gridContainer, sessions);
        } else {
            gridContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
            this.renderTimelineScheduleList(listContainer, sessions);
        }
    }

    renderTimelineScheduleList(container, sessions) {
        container.innerHTML = '';
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
                        if (session.completed) {
                            store.checkAndUpdateStreak();
                        }
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

    renderWeeklyCalendarGrid(container, sessions) {
        container.innerHTML = '';
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        daysOfWeek.forEach((dayName, idx) => {
            const dayCol = document.createElement('div');
            dayCol.className = 'weekly-day-col';
            dayCol.innerHTML = `<div class="weekly-day-header">${dayName}</div>`;

            const daySessions = sessions.filter((s, i) => (i % 7) === idx);
            if (daySessions.length === 0) {
                dayCol.innerHTML += `<div style="font-size: 11px; color: #64748b; text-align: center; padding: 10px 0;">Rest / Free</div>`;
            } else {
                daySessions.forEach(sess => {
                    const card = document.createElement('div');
                    card.className = 'weekly-slot-card';
                    card.style.borderLeftColor = sess.subjectColor || '#6366f1';
                    card.innerHTML = `
                        <div class="weekly-slot-title">${sess.topicName}</div>
                        <div class="weekly-slot-sub">${sess.timeSlot.split(' ')[0]} • ${sess.duration}m</div>
                    `;
                    dayCol.appendChild(card);
                });
            }
            container.appendChild(dayCol);
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
                    <div class="subject-card-header-actions">
                        <button class="icon-btn edit-subject-btn" data-id="${sub.id}" title="Edit Subject">✏️</button>
                        <button class="icon-btn danger delete-subject-btn" data-id="${sub.id}" title="Delete Subject">🗑️</button>
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
                                <button class="icon-btn notes-topic-btn" data-id="${t.id}" title="View Notes & Cheat Sheet">📝</button>
                                <button class="btn-sm secondary quiz-topic-btn" data-topic="${t.id}">Quiz</button>
                                <button class="icon-btn edit-topic-btn" data-id="${t.id}" title="Edit Topic">✏️</button>
                                <button class="icon-btn danger delete-topic-btn" data-id="${t.id}" title="Delete Topic">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            card.querySelector('.edit-subject-btn').addEventListener('click', (e) => {
                this.openSubjectModal(e.currentTarget.dataset.id);
            });

            card.querySelector('.delete-subject-btn').addEventListener('click', (e) => {
                this.deleteSubject(e.currentTarget.dataset.id);
            });

            card.querySelectorAll('.notes-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.openTopicNotesModal(e.currentTarget.dataset.id);
                });
            });

            card.querySelectorAll('.edit-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.openTopicModal(e.currentTarget.dataset.id);
                });
            });

            card.querySelectorAll('.delete-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteTopic(e.currentTarget.dataset.id);
                });
            });

            card.querySelectorAll('.quiz-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.launchTopicQuiz(e.currentTarget.dataset.topic);
                });
            });

            grid.appendChild(card);
        });
    }

    renderFlashcardsView() {
        const fcFilter = document.getElementById('flashcard-subject-filter');
        const selectedSub = fcFilter ? fcFilter.value : 'all';
        
        let cards = store.state.flashcards || [];
        if (selectedSub !== 'all') {
            const subTopics = store.state.topics.filter(t => t.subjectId === selectedSub).map(t => t.id);
            cards = cards.filter(c => subTopics.includes(c.topicId));
        }

        document.getElementById('fc-total-count').textContent = cards.length;
        const dueCards = cards.filter(c => !c.dueDate || c.dueDate <= new Date().toISOString().slice(0, 10));
        document.getElementById('fc-due-count').textContent = dueCards.length;
        const mastered = cards.filter(c => (c.interval || 0) >= 14);
        document.getElementById('fc-mastered-count').textContent = mastered.length;

        const currentCard = cards[this.currentFlashcardIndex % (cards.length || 1)];
        const cardFlip = document.getElementById('flashcard-flip-card');
        if (cardFlip) cardFlip.classList.remove('flipped');

        if (!currentCard || cards.length === 0) {
            document.getElementById('fc-card-tag').textContent = 'Deck Empty';
            document.getElementById('fc-card-front-text').textContent = 'No flashcards found for selected filter. Click "+ Create Card" to add your first recall card!';
            document.getElementById('fc-card-back-text').textContent = 'Create flashcards to test your retention!';
            document.getElementById('fc-card-notes-box').textContent = '';
        } else {
            const topic = store.state.topics.find(t => t.id === currentCard.topicId) || { name: 'General Concept' };
            document.getElementById('fc-card-tag').textContent = `${topic.name} • Interval: ${currentCard.interval || 1}d`;
            document.getElementById('fc-card-front-text').textContent = currentCard.front;
            document.getElementById('fc-card-back-text').textContent = currentCard.back;
            document.getElementById('fc-card-notes-box').textContent = currentCard.notes || 'No extra notes attached.';
        }
    }

    handleFlashcardRating(rating) {
        const fcFilter = document.getElementById('flashcard-subject-filter');
        const selectedSub = fcFilter ? fcFilter.value : 'all';
        let cards = store.state.flashcards || [];
        if (selectedSub !== 'all') {
            const subTopics = store.state.topics.filter(t => t.subjectId === selectedSub).map(t => t.id);
            cards = cards.filter(c => subTopics.includes(c.topicId));
        }

        if (cards.length === 0) return;

        const currentCard = cards[this.currentFlashcardIndex % cards.length];
        if (currentCard) {
            store.rateFlashcard(currentCard.id, rating);
            SoundFX.playSuccess();
        }

        this.currentFlashcardIndex = (this.currentFlashcardIndex + 1) % cards.length;
        this.renderFlashcardsView();
        this.showNotification(`SM-2 Interval Updated!`);
    }

    renderQuizSetup() {
        const subSelect = document.getElementById('quiz-select-subject');
        subSelect.innerHTML = store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        if (store.state.subjects.length > 0) {
            this.populateTopicDropdown('quiz-select-topic', store.state.subjects[0].id);
        }

        const fcSubSelect = document.getElementById('flashcard-subject-filter');
        if (fcSubSelect) {
            const currVal = fcSubSelect.value || 'all';
            fcSubSelect.innerHTML = '<option value="all">All Subjects</option>' + store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            fcSubSelect.value = currVal;
        }
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

    async startQuizSession() {
        const topicId = document.getElementById('quiz-select-topic').value;
        const topic = store.state.topics.find(t => t.id === topicId);
        if (!topic) return;

        let questions = [];
        if (store.state.aiConfig && store.state.aiConfig.apiKey) {
            this.showNotification("Generating AI Questions via Gemini API...");
            const aiGen = await store.fetchAIQuestions(topic.name);
            if (aiGen && aiGen.length > 0) {
                questions = aiGen;
            }
        }

        if (!questions || questions.length === 0) {
            questions = store.getOrCreateQuestionsForTopic(topicId);
        }

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

        document.querySelectorAll('.quiz-option-btn').forEach((btn, index) => {
            btn.disabled = true;
            if (index === q.correctIndex) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        const expBox = document.getElementById('quiz-explanation-box');
        document.getElementById('quiz-exp-title').textContent = isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect';
        document.getElementById('quiz-exp-title').style.color = isCorrect ? '#34d399' : '#f87171';
        document.getElementById('quiz-exp-text').textContent = q.explanation;
        expBox.classList.remove('hidden');

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
        this.renderActivityHeatmap();
        this.renderTopicsMasteryTable();
    }

    setupCanvasDPI(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const parent = canvas.parentElement;
        const displayWidth = parent ? parent.clientWidth : 500;
        const displayHeight = 260;

        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx.resetTransform) {
            ctx.resetTransform();
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.scale(dpr, dpr);

        return { ctx, width: displayWidth, height: displayHeight };
    }

    renderSubjectMasteryChart() {
        const canvas = document.getElementById('chart-subject-mastery');
        if (!canvas) return;
        
        const { ctx, width, height } = this.setupCanvasDPI(canvas);
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

            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(x, height - 40 - maxBarHeight, barWidth, maxBarHeight);

            const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
            gradient.addColorStop(0, sub.color);
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barH);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(`${avgMastery}%`, x + barWidth / 2, y - 8);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Inter';
            const shortName = sub.name.length > 12 ? sub.name.slice(0, 10) + '..' : sub.name;
            ctx.fillText(shortName, x + barWidth / 2, height - 16);
        });
    }

    renderReadinessTrendChart() {
        const canvas = document.getElementById('chart-readiness-trend');
        if (!canvas) return;

        const { ctx, width, height } = this.setupCanvasDPI(canvas);
        ctx.clearRect(0, 0, width, height);

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

        const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
        areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.lineTo(40 + (points.length - 1) * stepX, height - 40);
        ctx.lineTo(40, height - 40);
        ctx.closePath();
        ctx.fillStyle = areaGrad;
        ctx.fill();

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

    renderActivityHeatmap() {
        const grid = document.getElementById('activity-heatmap-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const logs = store.state.studyLogs || [];
        let totalMins = 0;

        // Render past 30 days cells
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);

            const dayMins = logs.filter(l => l.date === dateStr).reduce((a, b) => a + (b.minutes || 0), 0);
            totalMins += dayMins;

            let level = 0;
            if (dayMins > 180) level = 4;
            else if (dayMins > 120) level = 3;
            else if (dayMins > 60) level = 2;
            else if (dayMins > 0) level = 1;

            const cell = document.createElement('div');
            cell.className = `heatmap-cell level-${level}`;
            cell.title = `${dateStr}: ${dayMins} mins focused study`;
            grid.appendChild(cell);
        }

        const hrsBadge = document.getElementById('total-hours-logged-badge');
        if (hrsBadge) hrsBadge.textContent = `${(totalMins / 60).toFixed(1)} hrs total logged`;
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
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <button class="icon-btn notes-table-btn" data-id="${t.id}" title="View Notes & Cheat Sheet">📝</button>
                        <button class="btn-sm secondary quiz-table-btn" data-topic="${t.id}">Take Quiz</button>
                        <button class="icon-btn edit-topic-btn" data-id="${t.id}" title="Edit Topic">✏️</button>
                        <button class="icon-btn danger delete-topic-btn" data-id="${t.id}" title="Delete Topic">🗑️</button>
                    </div>
                </td>
            `;

            tr.querySelector('.notes-table-btn').addEventListener('click', (e) => {
                this.openTopicNotesModal(e.currentTarget.dataset.id);
            });

            tr.querySelector('.quiz-table-btn').addEventListener('click', (e) => {
                this.launchTopicQuiz(e.currentTarget.dataset.topic);
            });

            tr.querySelector('.edit-topic-btn').addEventListener('click', (e) => {
                this.openTopicModal(e.currentTarget.dataset.id);
            });

            tr.querySelector('.delete-topic-btn').addEventListener('click', (e) => {
                this.deleteTopic(e.currentTarget.dataset.id);
            });

            tbody.appendChild(tr);
        });
    }

    renderSettingsView() {
        const { examDetails, aiConfig } = store.state;
        document.getElementById('set-exam-title').value = examDetails.title || '';
        document.getElementById('set-exam-date').value = examDetails.examDate || '';
        document.getElementById('set-target-score').value = examDetails.targetScore || 90;
        document.getElementById('set-daily-hours').value = examDetails.dailyAvailableHours || 3.5;
        document.getElementById('set-peak-time').value = examDetails.peakTime || 'evening';

        if (aiConfig) {
            document.getElementById('set-ai-apikey').value = aiConfig.apiKey || '';
            document.getElementById('set-ai-model').value = aiConfig.model || 'gemini-1.5-flash';
            document.getElementById('set-ai-persona').value = aiConfig.persona || 'supportive';
            const statusBadge = document.getElementById('ai-key-status-badge');
            if (statusBadge) {
                statusBadge.textContent = aiConfig.apiKey ? 'Gemini API Active' : 'Default Template Engine';
                statusBadge.className = `badge ${aiConfig.apiKey ? 'success-badge' : 'ai-badge'}`;
            }
        }
    }

    // Modal Helpers
    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    openAuthModal() {
        const user = store.state.user || defaultState.user;
        const loggedInBox = document.getElementById('auth-logged-in-box');
        const loginForm = document.getElementById('form-auth-login');
        const signupForm = document.getElementById('form-auth-signup');

        if (user.isLoggedIn) {
            loggedInBox.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            document.getElementById('profile-user-name').textContent = user.name;
            document.getElementById('profile-user-email').textContent = user.email;
        } else {
            loggedInBox.classList.add('hidden');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        }

        this.openModal('modal-auth');
    }

    handleAuthLogin() {
        const email = document.getElementById('login-email').value;
        const name = email.split('@')[0] || "Student";
        store.state.user = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: email,
            isLoggedIn: true,
            authStatus: "Cloud Synced Account"
        };
        store.saveState();
        document.getElementById('modal-auth').classList.add('hidden');
        this.renderAll();
        this.showNotification(`Signed in as ${store.state.user.name}`);
    }

    handleAuthSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        store.state.user = {
            name: name,
            email: email,
            isLoggedIn: true,
            authStatus: "Cloud Synced Account"
        };
        store.saveState();
        document.getElementById('modal-auth').classList.add('hidden');
        this.renderAll();
        this.showNotification(`Account created for ${name}`);
    }

    handleAuthGoogle() {
        store.state.user = {
            name: "Alex Rivers (Google)",
            email: "alex.rivers@gmail.com",
            isLoggedIn: true,
            authStatus: "Google OAuth Synced"
        };
        store.saveState();
        document.getElementById('modal-auth').classList.add('hidden');
        this.renderAll();
        this.showNotification("Signed in with Google OAuth!");
    }

    handleAuthLogout() {
        store.state.user = { ...defaultState.user };
        store.saveState();
        document.getElementById('modal-auth').classList.add('hidden');
        this.renderAll();
        this.showNotification("Signed out of account.");
    }

    openSubjectModal(subjectId = null) {
        const titleElem = document.getElementById('modal-subject-title');
        const idInput = document.getElementById('sub-id');
        const nameInput = document.getElementById('sub-name');
        const colorInput = document.getElementById('sub-color');
        const iconInput = document.getElementById('sub-icon');

        document.getElementById('form-subject').reset();

        if (subjectId) {
            const sub = store.state.subjects.find(s => s.id === subjectId);
            if (sub) {
                if (titleElem) titleElem.textContent = 'Edit Subject';
                idInput.value = sub.id;
                nameInput.value = sub.name;
                colorInput.value = sub.color || '#6366f1';
                iconInput.value = sub.icon || '📚';
            }
        } else {
            if (titleElem) titleElem.textContent = 'Add New Subject';
            idInput.value = '';
        }

        this.openModal('modal-subject');
    }

    openTopicModal(topicId = null) {
        this.populateSubjectDropdowns();
        const titleElem = document.getElementById('modal-topic-title');
        const idInput = document.getElementById('top-id');
        const subSelect = document.getElementById('top-subject');
        const nameInput = document.getElementById('top-name');
        const diffSelect = document.getElementById('top-difficulty');
        const hoursInput = document.getElementById('top-hours');
        const masteryInput = document.getElementById('top-mastery');
        const masteryVal = document.getElementById('top-mastery-val');

        document.getElementById('form-topic').reset();

        if (topicId) {
            const top = store.state.topics.find(t => t.id === topicId);
            if (top) {
                if (titleElem) titleElem.textContent = 'Edit Topic';
                idInput.value = top.id;
                subSelect.value = top.subjectId;
                nameInput.value = top.name;
                diffSelect.value = top.difficulty || 2;
                hoursInput.value = top.estimatedHours || 4.0;
                masteryInput.value = top.masteryLevel || 30;
                if (masteryVal) masteryVal.textContent = top.masteryLevel || 30;
            }
        } else {
            if (titleElem) titleElem.textContent = 'Add New Topic';
            idInput.value = '';
            masteryInput.value = 30;
            if (masteryVal) masteryVal.textContent = 30;
        }

        this.openModal('modal-topic');
    }

    openTopicNotesModal(topicId) {
        const topic = store.state.topics.find(t => t.id === topicId);
        if (!topic) return;

        document.getElementById('notes-modal-title').textContent = `Cheat Sheet: ${topic.name}`;
        document.getElementById('note-topic-id').value = topicId;
        document.getElementById('note-content').value = (store.state.topicNotes || {})[topicId] || '';

        this.openModal('modal-topic-notes');
    }

    openFlashcardModal() {
        this.populateTopicDropdown('fc-topic-select');
        document.getElementById('form-flashcard').reset();
        this.openModal('modal-flashcard');
    }

    handleSaveTopicNotes() {
        const topicId = document.getElementById('note-topic-id').value;
        const content = document.getElementById('note-content').value.trim();

        if (!store.state.topicNotes) store.state.topicNotes = {};
        store.state.topicNotes[topicId] = content;
        store.saveState();

        document.getElementById('modal-topic-notes').classList.add('hidden');
        this.showNotification('Cheat sheet notes saved!');
    }

    handleSaveFlashcard() {
        const topicId = document.getElementById('fc-topic-select').value;
        const front = document.getElementById('fc-front-input').value.trim();
        const back = document.getElementById('fc-back-input').value.trim();

        if (!front || !back) return;

        const newCard = {
            id: `fc-${Date.now()}`,
            topicId,
            front,
            back,
            notes: "Custom flashcard",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            dueDate: new Date().toISOString().slice(0, 10)
        };

        if (!store.state.flashcards) store.state.flashcards = [];
        store.state.flashcards.push(newCard);
        store.saveState();

        document.getElementById('modal-flashcard').classList.add('hidden');
        this.renderFlashcardsView();
        this.showNotification('Flashcard created!');
    }

    deleteSubject(subjectId) {
        const sub = store.state.subjects.find(s => s.id === subjectId);
        if (!sub) return;

        if (confirm(`Are you sure you want to delete "${sub.name}"? This will also delete all associated topics.`)) {
            store.state.subjects = store.state.subjects.filter(s => s.id !== subjectId);
            store.state.topics = store.state.topics.filter(t => t.subjectId !== subjectId);
            store.saveState();
            store.generateAdaptiveSchedule();
            this.renderAll();
            this.showNotification(`Deleted Subject: ${sub.name}`);
        }
    }

    deleteTopic(topicId) {
        const topic = store.state.topics.find(t => t.id === topicId);
        if (!topic) return;

        if (confirm(`Are you sure you want to delete topic "${topic.name}"?`)) {
            store.state.topics = store.state.topics.filter(t => t.id !== topicId);
            store.saveState();
            store.generateAdaptiveSchedule();
            this.renderAll();
            this.showNotification(`Deleted Topic: ${topic.name}`);
        }
    }

    populateSubjectDropdowns() {
        const select = document.getElementById('top-subject');
        select.innerHTML = store.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    populateTopicDropdown(selectElementId, filterSubjectId = null) {
        const select = document.getElementById(selectElementId);
        if (!select) return;
        let topics = store.state.topics;
        if (filterSubjectId) {
            topics = topics.filter(t => t.subjectId === filterSubjectId);
        }
        select.innerHTML = topics.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    handleSaveSubject() {
        const id = document.getElementById('sub-id').value;
        const name = document.getElementById('sub-name').value.trim();
        const color = document.getElementById('sub-color').value;
        const icon = document.getElementById('sub-icon').value;

        if (!name) return;

        if (id) {
            const existingSub = store.state.subjects.find(s => s.id === id);
            if (existingSub) {
                existingSub.name = name;
                existingSub.color = color;
                existingSub.icon = icon;
            }
        } else {
            const newSubject = {
                id: `sub-${Date.now()}`,
                name,
                color,
                icon
            };
            store.state.subjects.push(newSubject);
        }

        store.saveState();
        document.getElementById('modal-subject').classList.add('hidden');
        document.getElementById('form-subject').reset();
        this.renderAll();
        this.showNotification(id ? `Updated Subject: ${name}` : `Added Subject: ${name}`);
    }

    handleSaveTopic() {
        const id = document.getElementById('top-id').value;
        const subjectId = document.getElementById('top-subject').value;
        const name = document.getElementById('top-name').value.trim();
        const difficulty = parseInt(document.getElementById('top-difficulty').value);
        const estimatedHours = parseFloat(document.getElementById('top-hours').value);
        const masteryLevel = parseInt(document.getElementById('top-mastery').value);

        if (!name || !subjectId) return;

        if (id) {
            const existingTopic = store.state.topics.find(t => t.id === id);
            if (existingTopic) {
                existingTopic.subjectId = subjectId;
                existingTopic.name = name;
                existingTopic.difficulty = difficulty;
                existingTopic.estimatedHours = estimatedHours;
                existingTopic.masteryLevel = masteryLevel;
            }
        } else {
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
        }

        store.generateAdaptiveSchedule();
        document.getElementById('modal-topic').classList.add('hidden');
        document.getElementById('form-topic').reset();
        this.renderAll();
        this.showNotification(id ? `Updated Topic: ${name}` : `Added Topic: ${name}`);
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
            isCustom: true,
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

        store.saveState();
        store.generateAdaptiveSchedule();
        this.renderAll();
        this.showNotification('Exam settings saved & schedule updated!');
    }

    handleSaveAISettings() {
        store.state.aiConfig = {
            apiKey: document.getElementById('set-ai-apikey').value.trim(),
            model: document.getElementById('set-ai-model').value,
            persona: document.getElementById('set-ai-persona').value
        };

        store.saveState();
        this.renderAll();
        this.showNotification('AI Engine settings updated!');
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

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appUI = new UIController();
});
