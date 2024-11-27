"use strict";
const Pomodoro = (() => {
    let TimerState;
    (function (TimerState) {
        TimerState["WORK"] = "WORK";
        TimerState["SHORTBREAK"] = "SHORTBREAK";
        TimerState["LONGBREAK"] = "LONGBREAK";
        TimerState["PAUSED"] = "PAUSED";
        TimerState["STOPPED"] = "STOPPED";
    })(TimerState || (TimerState = {}));
    let TimerSession;
    (function (TimerSession) {
        TimerSession["WORK"] = "WORK";
        TimerSession["SHORTBREAK"] = "SHORTBREAK";
        TimerSession["LONGBREAK"] = "LONGBREAK";
    })(TimerSession || (TimerSession = {}));
    const HandleLocalStorage = (() => {
        function saveToLocalStorage(Timer, AlarmSound) {
            localStorage.setItem("Timer", JSON.stringify(Timer));
            localStorage.setItem("AlarmSound", JSON.stringify(AlarmSound));
        }
        function loadFromLocalStorage() {
            return {
                Timer: JSON.parse(localStorage.getItem("Timer") || "null"),
                AlarmSound: JSON.parse(localStorage.getItem("AlarmSound") || '"BeepTone"'),
            };
        }
        return { saveToLocalStorage, loadFromLocalStorage };
    })();
    const StateManager = (() => {
        const defaultSettings = {
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
        };
        const AlarmSound = HandleLocalStorage.loadFromLocalStorage().AlarmSound;
        const settings = HandleLocalStorage.loadFromLocalStorage().Timer.workDuration ? HandleLocalStorage.loadFromLocalStorage().Timer : defaultSettings;
        let status = {
            state: TimerState.STOPPED,
            currentSession: TimerSession.WORK,
            remainingTime: settings.workDuration,
            intervalID: null,
        };
        return { settings, status, AlarmSound };
    })();
    const PomodoroController = (() => {
        const startnPauseButton = document.querySelector(".pomodoro-minutes-btn");
        const shortBreakButton = document.querySelector(".pomodoro-short-break");
        const longBreakButton = document.querySelector(".pomodoro-long-break");
        const pomodoroButton = document.querySelector(".pomodoro-time");
        const closeSettingModalBtn = document.querySelector(".close-setting-btn");
        const settingModal = document.querySelector(".setting-modal");
        const openSettingModalBtn = document.querySelector(".open-setting-modal-btn");
        const settingsPomodoro = document.querySelector(".setting-pomodoro-minutes");
        const settingsShortBreak = document.querySelector(".setting-short-break-minutes");
        const settingsLongBreak = document.querySelector(".setting-long-break-minutes");
        const alarmSound = document.getElementById("alarm-sound");
        const clickSound = new Audio("assets/audio/click-audio.mp3");
        const alarmBeepTone = new Audio("assets/audio/alarm-beep-tone.mp3");
        const alarmBeepChime = new Audio("assets/audio/alarm-beep-chime.mp3");
        const alarmBreach = new Audio("assets/audio/alarm-breach.wav");
        settingsPomodoro.value = (StateManager.settings.workDuration / 60).toString();
        settingsLongBreak.value = (StateManager.settings.longBreakDuration / 60).toString();
        settingsShortBreak.value = (StateManager.settings.shortBreakDuration / 60).toString();
        alarmSound.value = StateManager.AlarmSound;
        const setupEventListeners = () => {
            startnPauseButton.addEventListener("click", () => {
                startnPauseButton.textContent === "Start" ? startTimer() : pauseTimer();
                clickSound.play();
            });
            shortBreakButton.addEventListener("change", () => {
                if (shortBreakButton.checked === true) {
                    resetTimer(TimerSession.SHORTBREAK);
                }
            });
            longBreakButton.addEventListener("change", () => {
                if (longBreakButton.checked === true) {
                    resetTimer(TimerSession.LONGBREAK);
                }
            });
            pomodoroButton.addEventListener("change", () => {
                if (pomodoroButton.checked === true) {
                    resetTimer(TimerSession.WORK);
                }
            });
            settingsPomodoro.addEventListener("change", () => {
                var _a;
                updateTimer((_a = settingsPomodoro.getAttribute("data-sessions")) === null || _a === void 0 ? void 0 : _a.toString());
            });
            settingsLongBreak.addEventListener("change", () => {
                var _a;
                updateTimer((_a = settingsLongBreak.getAttribute("data-sessions")) === null || _a === void 0 ? void 0 : _a.toString());
            });
            settingsShortBreak.addEventListener("change", () => {
                var _a;
                updateTimer((_a = settingsShortBreak.getAttribute("data-sessions")) === null || _a === void 0 ? void 0 : _a.toString());
            });
            closeSettingModalBtn.addEventListener("click", () => settingModal.classList.add("hidden"));
            openSettingModalBtn.addEventListener("click", () => settingModal.classList.remove("hidden"));
            alarmSound.addEventListener("change", () => { handleAlarmSetting(); });
        };
        const updateTimer = (targetSession) => {
            StateManager.settings.workDuration = Number(settingsPomodoro.value) * 60;
            StateManager.settings.shortBreakDuration = Number(settingsShortBreak.value) * 60;
            StateManager.settings.longBreakDuration = Number(settingsLongBreak.value) * 60;
            HandleLocalStorage.saveToLocalStorage(StateManager.settings, StateManager.AlarmSound);
            if (StateManager.status.currentSession === targetSession) {
                resetTimer(targetSession);
            }
        };
        const startTimer = () => {
            if (startnPauseButton.textContent === "Start") {
                startnPauseButton.textContent = "Paused";
                StateManager.status.state = TimerState.WORK;
                if (!StateManager.status.intervalID) {
                    StateManager.status.intervalID = window.setInterval(loadTimer, 1000);
                }
            }
        };
        const pauseTimer = () => {
            if (StateManager.status.intervalID) {
                startnPauseButton.textContent = "Start";
                clearInterval(StateManager.status.intervalID);
                StateManager.status.intervalID = null;
                StateManager.status.state = TimerState.PAUSED;
            }
        };
        const resetTimer = (session) => {
            const durations = {
                WORK: StateManager.settings.workDuration,
                SHORTBREAK: StateManager.settings.shortBreakDuration,
                LONGBREAK: StateManager.settings.longBreakDuration,
            };
            if (StateManager.status.intervalID) {
                clearInterval(StateManager.status.intervalID);
                startnPauseButton.textContent = "Start";
            }
            StateManager.status = {
                state: TimerState.STOPPED,
                currentSession: session || TimerSession.WORK,
                remainingTime: durations[session || TimerSession.WORK],
                intervalID: null,
            };
            UIModule.updateDisplay();
        };
        const handleAlarmSetting = () => {
            switch (alarmSound.value) {
                case "BeepTone":
                    playAlarm(alarmBeepTone);
                    StateManager.AlarmSound = "BeepTone";
                    HandleLocalStorage.saveToLocalStorage(StateManager.settings, StateManager.AlarmSound);
                    break;
                case "BeepChime":
                    playAlarm(alarmBeepChime);
                    StateManager.AlarmSound = "BeepChime";
                    HandleLocalStorage.saveToLocalStorage(StateManager.settings, StateManager.AlarmSound);
                    break;
                case "Breach":
                    playAlarm(alarmBreach);
                    StateManager.AlarmSound = "Breach";
                    HandleLocalStorage.saveToLocalStorage(StateManager.settings, StateManager.AlarmSound);
                    break;
            }
        };
        const playAlarm = (alarm) => {
            alarm.play();
            setTimeout(() => {
                alarm.pause();
            }, 3000);
        };
        const loadTimer = () => {
            if (StateManager.status.remainingTime > 0) {
                StateManager.status.remainingTime--;
                UIModule.updateDisplay();
            }
            else {
                clearInterval(StateManager.status.intervalID);
                StateManager.status.state = StateManager.status.state === TimerState.WORK ? TimerState.SHORTBREAK : TimerState.WORK;
                StateManager.status.remainingTime = StateManager.status.state === "WORK" ? StateManager.settings.workDuration : StateManager.settings.shortBreakDuration;
                startTimer();
                handleAlarmSetting();
                resetTimer(StateManager.status.currentSession);
            }
        };
        return { setupEventListeners, resetTimer };
    })();
    const UIModule = (() => {
        const timerDisplay = document.querySelector(".pomodoro-minutes");
        const pomodoroPage = document.querySelector(".pomodoro");
        const startnPauseButton = document.querySelector(".pomodoro-minutes-btn");
        const updateDisplay = () => {
            const minutes = Math.floor(StateManager.status.remainingTime / 60).toString().padStart(2, "0");
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
    const init = () => {
        PomodoroController.setupEventListeners(); // Setup event listeners
        UIModule.updateDisplay(); // Update UI display
    };
    return { init };
})();
document.addEventListener("DOMContentLoaded", Pomodoro.init);
