"use strict";
const Pomodoro = (() => {
    const StateManager = (() => {
        const settings = {
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
        };
        let status = {
            state: "STOPPED",
            currentSession: "WORK",
            remainingTime: settings.workDuration,
            intervalID: null,
        };
        return { settings, status };
    })();
    const PomodoroController = (() => {
        const startnPauseButton = document.querySelector(".pomodoro-minutes-btn");
        const shortBreakButton = document.querySelector(".pomodoro-short-break");
        const longBreakButton = document.querySelector(".pomodoro-long-break");
        const pomodoroButton = document.querySelector(".pomodoro-time");
        const closeSettingModalBtn = document.querySelector(".close-setting-btn");
        const settingModal = document.querySelector(".setting-modal");
        const openSettingModalBtn = document.querySelector(".open-setting-modal-btn");
        const setupEventListeners = () => {
            startnPauseButton.addEventListener("click", () => {
                startnPauseButton.textContent === "Start" ? startTimer() : pauseTimer();
            });
            shortBreakButton.addEventListener("change", () => {
                if (shortBreakButton.checked === true) {
                    resetTimer("SHORTBREAK");
                }
            });
            longBreakButton.addEventListener("change", () => {
                if (longBreakButton.checked === true) {
                    resetTimer("LONGBREAK");
                }
            });
            pomodoroButton.addEventListener("change", () => {
                if (pomodoroButton.checked === true) {
                    resetTimer("WORK");
                }
            });
            closeSettingModalBtn.addEventListener('click', () => settingModal.classList.add("hidden"));
            openSettingModalBtn.addEventListener('click', () => settingModal.classList.remove("hidden"));
        };
        const startTimer = () => {
            if (startnPauseButton.textContent === "Start") {
                startnPauseButton.textContent = "Paused";
                StateManager.status.state = "WORK";
                if (!StateManager.status.intervalID) {
                    StateManager.status.intervalID = window.setInterval(updateTimer, 1000);
                }
            }
        };
        const pauseTimer = () => {
            if (StateManager.status.intervalID) {
                startnPauseButton.textContent = "Start";
                clearInterval(StateManager.status.intervalID);
                StateManager.status.intervalID = null;
                StateManager.status.state = "PAUSED";
            }
        };
        const resetTimer = (session) => {
            if (StateManager.status.intervalID) {
                clearInterval(StateManager.status.intervalID);
                startnPauseButton.textContent = "Start";
            }
            if (session === "SHORTBREAK") {
                StateManager.status = {
                    state: "STOPPED",
                    currentSession: "SHORTBREAK",
                    remainingTime: StateManager.settings.shortBreakDuration,
                    intervalID: null,
                };
            }
            else if (session === "WORK") {
                StateManager.status = {
                    state: "STOPPED",
                    currentSession: "WORK",
                    remainingTime: StateManager.settings.workDuration,
                    intervalID: null,
                };
            }
            else {
                StateManager.status = {
                    state: "STOPPED",
                    currentSession: "LONGBREAK",
                    remainingTime: StateManager.settings.longBreakDuration,
                    intervalID: null,
                };
            }
            UIModule.updateDisplay();
        };
        const updateTimer = () => {
            if (StateManager.status.remainingTime > 0) {
                StateManager.status.remainingTime--;
                UIModule.updateDisplay();
            }
            else {
                clearInterval(StateManager.status.intervalID);
                StateManager.status.state = StateManager.status.state === "WORK" ? "SHORTBREAK" : "WORK";
                StateManager.status.remainingTime = StateManager.status.state === "WORK" ? StateManager.settings.workDuration : StateManager.settings.shortBreakDuration;
                startTimer();
            }
        };
        return { setupEventListeners };
    })();
    const UIModule = (() => {
        const timerDisplay = document.querySelector(".pomodoro-minutes");
        const pomodoroPage = document.querySelector(".pomodoro");
        const startnPauseButton = document.querySelector(".pomodoro-minutes-btn");
        const updateDisplay = () => {
            const minutes = Math.floor(StateManager.status.remainingTime / 60)
                .toString()
                .padStart(2, "0");
            const seconds = (StateManager.status.remainingTime % 60).toString().padStart(2, "0");
            timerDisplay.textContent = `${minutes}:${seconds}`;
            if (StateManager.status.currentSession === "SHORTBREAK") {
                shortBreakSession();
            }
            else if (StateManager.status.currentSession === "WORK") {
                pomodoroSession();
            }
            else if (StateManager.status.currentSession === "LONGBREAK") {
                longBreakSession();
            }
        };
        const shortBreakSession = () => {
            if (pomodoroPage.classList.contains("bg-[#86B173]") || pomodoroPage.classList.contains("bg-[#AAA160]")) {
                pomodoroPage.classList.remove("bg-[#86B173]", "bg-[#AAA160]");
                startnPauseButton.classList.remove("text-[#86B173]", "text-[#BCB36B]");
            }
            pomodoroPage.classList.add("bg-[#4E78AE]");
            startnPauseButton.classList.add("text-[#4E78AE]");
        };
        const longBreakSession = () => {
            if (pomodoroPage.classList.contains("bg-[#86B173]") || pomodoroPage.classList.contains("bg-[#4E78AE]")) {
                pomodoroPage.classList.remove("bg-[#86B173]", "bg-[#4E78AE]");
                startnPauseButton.classList.remove("text-[#86B173]", "text-[#4E78AE]");
            }
            pomodoroPage.classList.add("bg-[#AAA160]");
            startnPauseButton.classList.add("text-[#BCB36B]");
        };
        const pomodoroSession = () => {
            if (pomodoroPage.classList.contains("bg-[#4E78AE]") || pomodoroPage.classList.contains("bg-[#AAA160]")) {
                pomodoroPage.classList.remove("bg-[#4E78AE]", "bg-[#AAA160]");
                startnPauseButton.classList.remove("text-[#4E78AE]", "text-[#BCB36B]");
            }
            pomodoroPage.classList.add("bg-[#86B173]");
            startnPauseButton.classList.add("text-[#86B173]");
        };
        return { updateDisplay };
    })();
    const init = async () => {
        UIModule.updateDisplay();
        PomodoroController.setupEventListeners();
    };
    return { init };
})();
document.addEventListener("DOMContentLoaded", Pomodoro.init);
