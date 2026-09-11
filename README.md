# STUDY-PLANNER
 What the project is 
 The Study Planner is an AI-powered study assistant that helps students and users prepare for their exams using adaptive plans that adjust when the student/user falls behind in their progress.
 
 
• Who it is designed for 

Students and professionals


• The problem it solves 

More than just a reminder or calendar, it monitors the user's progress and adapts to their study habits by generating new plans that help push them along.

• The technologies and tools used 
The AI Study Planner single-page application (SPA) is built with Vanilla HTML5, CSS3, and JavaScript, featuring adaptive AI study scheduling, interactive quiz testing, exam countdown metrics, and web storage persistence


Single-Page Application (SPA) Views
Dashboard Overview:

Live real-time countdown timer to exam date.
Exam Readiness Index ($0-100%$), calculated as a weighted average of topic difficulties and mastery levels.
Today's Adaptive AI Schedule checklist with completion toggles and topic quick-quiz shortcuts.
Focus Areas & Weak Topics card highlighting topics with mastery $< 60%$.
AI Tutor Strategy recommendation card.
Mini Pomodoro Timer widget with live countdown and synthesizer sound chimes.
Adaptive Master Schedule:

Auto-generated daily study blocks distributed across Morning, Afternoon, Evening, and Night time slots.
Dynamically recalculates schedule when quiz scores or topic completion statuses update.
Filterable by subject or session status.
Subjects & Topics Repository:

CRUD management for subjects (custom icons, colors) and topics (difficulty 1x-2x, estimated study hours, mastery level).
Progress bars per subject and quick topic drill launcher.
AI Quiz Arena:

Interactive multi-mode quizzes (Standard Practice, Weakness Drill).
Multiple-choice questions with instant correct/incorrect visual feedback and Web Audio sound effects.
Rationale and detailed conceptual explanations shown upon submission.
Performance summary screen with score percentage, mastery score change calculation ($\text{Old %} \rightarrow \text{New %}$), and instant schedule re-balancing.
Progress & Analytics:

Canvas-rendered Subject Mastery bar chart.
Canvas-rendered Exam Readiness trajectory graph.
Comprehensive topic mastery table with difficulty badges and direct quiz actions.
Exam Details & Web Storage Settings:

Form to configure Exam Goal Title, Target Date/Time, Target Score $%$, Daily Available Hours, and Peak Productivity Slot.
One-click Load Demo Data to populate sample exam data.
Full Export JSON and Import JSON data backup/restore.



• Important decisions made 
Single-Page Application (SPA) to keep things simple
Subjects & Topics Repository for easy data collation
Adaptive Master Schedule to fit users' habits



• Challenges you encountered and how you solved them 
Proper exam scheduling and dashboard arrangement that shows exam details











The AI Study Planner single-page application (SPA) is built with Vanilla HTML5, CSS3, and JavaScript, featuring adaptive AI study scheduling, interactive quiz testing, exam countdown metrics, and web storage persistence
