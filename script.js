// script.js

// Audio setup using Tone.js
// A simple synth for the chime sound
const chime = new Tone.Synth().toDestination();
// A membrane synth for a percussive buzzer sound
const buzzer = new Tone.MembraneSynth().toDestination();

// Theme Management
// Removed currentTheme variable as there's only one theme (light)
let customColors = {
    light: {}
};

// Default color definitions (as hex, for storage and pickers)
const defaultLightColors = {
    '--primary-color': '#6C63FF',
    '--secondary-color': '#D9FF87',
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9ff',
    '--text-primary': '#2c3e50',
    '--text-secondary': '#7f8c8d',
    '--glass-bg': '#ffffff', // Stored as hex, alpha applied when setting CSS var
    '--glass-border': '#6C63FF', // Stored as hex, alpha applied when setting CSS var
    '--card-bg': '#ffffff', // Stored as hex, alpha applied when setting CSS var
    '--popup-bg-start': '#f0f0f0',
    '--popup-bg-end': '#e0e0e0',
    '--popup-border': '#cccccc',
    '--popup-shadow-color': '#000000', // Stored as hex, alpha applied when setting CSS var
    '--popup-accent-glow': '#6C63FF' // Stored as hex, alpha applied when setting CSS var
};

// Removed defaultDarkColors

// Define default alpha values for specific variables based on theme
const defaultAlphas = {
    light: {
        '--glass-bg': 0.25,
        '--glass-border': 0.1,
        '--card-bg': 0.7,
        '--popup-shadow-color': 0.2,
        '--popup-accent-glow': 0.2
    }
    // Removed dark alpha values
};

// Helper to convert hex to RGB object {r, g, b}
function hexToRgb(hex) {
    // Remove '#' if present
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

// Helper to convert hex to RGBA string with a given alpha
function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function applyCustomColors() {
    console.log('applyCustomColors executing');
    const root = document.documentElement;
    // Always apply light theme colors
    const themeColors = customColors.light; 

    for (const [prop, value] of Object.entries(themeColors)) {
        if (defaultAlphas.light && defaultAlphas.light[prop] !== undefined) {
            // If it's an RGBA variable, convert hex to RGBA with its default alpha
            const rgbaValue = hexToRgba(value, defaultAlphas.light[prop]);
            root.style.setProperty(prop, rgbaValue);
            console.log(`Setting CSS var ${prop} to RGBA: ${rgbaValue}`);
        } else {
            // Otherwise, set the property directly (it's likely a solid color)
            root.style.setProperty(prop, value);
            console.log(`Setting CSS var ${prop} to HEX: ${value}`);
        }
    }
}

function resetToDefaultColors() {
    console.log('resetToDefaultColors called');
    const root = document.documentElement;
    const targetColors = defaultLightColors; // Always target light colors

    // Reset customColors.light to defaultLightColors
    for (const [prop, value] of Object.entries(targetColors)) {
        customColors.light[prop] = value; // Store hex value in customColors for light theme
        console.log(`Resetting customColors.light['${prop}'] to ${value}`);
    }
    
    // Apply the colors to the CSS variables
    applyCustomColors();
    console.log('applyCustomColors called after reset');

    // Update the color pickers in the UI
    updateThemeColorPickers();
    console.log('updateThemeColorPickers called after reset');

    // Save the reset settings to localStorage
    saveSettings();
    showTemporaryMessage('Colors restored to default!');
}


// Removed toggleTheme function

// Sidebar Management
let sidebarCollapsed = false;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarDisplay = document.getElementById('sidebarDisplay');

    if (sidebar) sidebar.classList.toggle('collapsed', sidebarCollapsed);

    if (sidebarDisplay) {
        sidebarDisplay.textContent = sidebarCollapsed ? 'Collapsed' : 'Expanded';
    }
    sidebarCollapsed = !sidebarCollapsed;
}

// Navigation Management
function switchPage(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => link.classList.remove('active'));
    pages.forEach(page => page.classList.remove('active'));

    const targetLink = document.querySelector(`[data-page="${pageId}"]`);
    if (targetLink) targetLink.classList.add('active');

    const targetPageElement = document.getElementById(pageId);
    if (targetPageElement) targetPageElement.classList.add('active');
}

// Tab Management
function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    const targetTabContent = document.getElementById(tabId);
    if (targetTabContent) targetTabContent.classList.add('active');

    // If switching to the general tab, redraw the pie chart
    if (tabId === 'general') {
        renderPieChart();
        renderSliders();
    } else if (tabId === 'theme') {
        updateThemeColorPickers(); // Update color pickers when switching to theme tab
    }
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Loading State
function showLoadingState(button) {
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    button.style.opacity = '0.7';
}

// Chart Animation (for the old chart, can be removed if not needed elsewhere)
function animateChart() {
    const chartPoints = document.querySelectorAll('.chart-point');
    chartPoints.forEach((point, index) => {
        setTimeout(() => {
            if (point) point.style.animation = 'pulse 0.5s ease';
        }, index * 100);
    });
}

// Function to display a temporary message
function showTemporaryMessage(message, duration = 3000) {
    const messageElement = document.getElementById('saveConfirmationMessage');
    if (!messageElement) return;

    const messageText = messageElement.querySelector('span');
    if (messageText) messageText.textContent = message;

    messageElement.classList.add('show');

    setTimeout(() => {
        messageElement.classList.remove('show');
    }, duration);
}

// Operation Proportions - Pie Chart Logic (using Chart.js)
let pieChart; // Chart.js instance

function getChartContext() {
    const canvas = document.getElementById('operationPieChart');
    if (canvas) {
        return canvas.getContext('2d');
    }
    console.error("Canvas element 'operationPieChart' not found.");
    return null;
}

const operations = [
    { name: 'Addition', key: 'addition', enabled: true },
    { name: 'Subtraction', key: 'subtract', enabled: true },
    { name: 'Multiplication', key: 'multiply', enabled: true },
    { name: 'Division', key: 'divide', enabled: true }
];

let proportions = {};

function calculateEqualProportions() {
    const active = operations.filter(op => op.enabled);
    const portion = active.length > 0 ? Math.floor(100 / active.length) : 0;
    let total = portion * active.length;
    let remaining = 100 - total;
    proportions = {};
    active.forEach((op, index) => {
        proportions[op.key] = portion + (index === 0 ? remaining : 0);
    });
    // Set disabled operations to 0 proportion
    operations.filter(op => !op.enabled).forEach(op => {
        proportions[op.key] = 0;
    });
    console.log('Proportions after equal calculation:', proportions);
}

function getChartData() {
    const enabledOps = operations.filter(op => op.enabled);
    const data = enabledOps.map(op => proportions[op.key]);
    const labels = enabledOps.map(op => op.name);
    const backgroundColors = enabledOps.map(op => {
        // Map to your desired colors
        switch (op.key) {
            case 'addition': return '#6C63FF';
            case 'subtract': return '#FF6B6B';
            case 'multiply': return '#FFD166';
            case 'divide': return '#06D6A0';
            default: return '#CCCCCC';
        }
    });

    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1
        }]
    };
}

function renderPieChart() {
    const ctx = getChartContext();
    if (!ctx || typeof Chart === 'undefined') {
        console.error("Cannot render pie chart: Chart.js not loaded or canvas context unavailable.");
        return;
    }

    try {
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: getChartData(),
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${Math.round(value)}%`;
                            }
                        }
                    }
                }
            }
        });
        console.log('Pie chart rendered successfully.');
    } catch (error) {
        console.error("Error rendering pie chart:", error);
    }
}

function renderSliders() {
    const sliderContainer = document.getElementById('slidersContainer');
    if (!sliderContainer) {
        console.error("Slider container not found.");
        return;
    }
    sliderContainer.innerHTML = '';
    const activeOps = operations.filter(op => op.enabled);
    activeOps.forEach(op => {
        const wrapper = document.createElement('div');
        wrapper.style.margin = '0.5rem 0';
        const label = document.createElement('label');
        label.innerText = `${op.name}: ${Math.round(proportions[op.key])}%`;
        label.style.display = 'block';
        label.style.marginBottom = '0.25rem';
        label.style.color = 'var(--text-primary)';
        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.value = Math.round(proportions[op.key]);
        input.dataset.key = op.key;
        input.addEventListener('input', onSliderInput);
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        sliderContainer.appendChild(wrapper);
    });
    updateSliderUI(); // Call to initialize slider UI after rendering
}

function updateSliderUI() {
    document.querySelectorAll('#slidersContainer input[type="range"]').forEach(input => {
        const key = input.dataset.key;
        const labelElement = input.previousElementSibling; // Assuming label is right before input

        if (labelElement) {
            labelElement.innerText = `${operations.find(op => op.key === key).name}: ${Math.round(proportions[key])}%`;
        }
        input.value = Math.round(proportions[key]);
    });
}

function onSliderInput(e) {
    const changedKey = e.target.dataset.key;
    const newValue = parseInt(e.target.value);
    
    // Immediately update the label of the current slider being dragged
    const labelElement = e.target.previousElementSibling;
    if (labelElement) {
        labelElement.innerText = `${operations.find(op => op.key === changedKey).name}: ${newValue}%`;
    }

    // Call adjustProportions, which will now update all sliders more efficiently
    adjustProportions(changedKey, newValue);
}

function adjustProportions(changedKey, newValue) {
    let enabledKeys = operations.filter(op => op.enabled).map(op => op.key);
    let otherEnabledKeys = enabledKeys.filter(k => k !== changedKey);

    let totalOther = otherEnabledKeys.reduce((sum, k) => sum + proportions[k], 0);
    let remaining = 100 - newValue;

    if (remaining < 0) {
        newValue = 100;
        remaining = 0;
    }

    if (otherEnabledKeys.length === 0) {
        proportions[changedKey] = 100;
    } else if (totalOther === 0) {
        const evenShare = remaining / otherEnabledKeys.length;
        otherEnabledKeys.forEach(k => {
            proportions[k] = evenShare;
        });
    } else {
        const scale = remaining / totalOther;
        otherEnabledKeys.forEach(k => {
            proportions[k] = proportions[k] * scale;
        });
    }

    proportions[changedKey] = newValue;

    let sum = 0;
    enabledKeys.forEach(k => {
        proportions[k] = Math.round(proportions[k]);
        sum += proportions[k];
    });

    let diff = 100 - sum;
    if (diff !== 0 && enabledKeys.length > 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
            const index = i % enabledKeys.length;
            if (diff > 0) {
                proportions[enabledKeys[index]]++;
            } else {
                proportions[enabledKeys[index]]--;
            }
        }
    }

    renderPieChart();
    updateSliderUI(); // Call the new function to update slider UI
    saveSettings();
}

// Function to save settings to localStorage
function saveSettings() {
    const settings = {};

    // Practice Mode
    const practiceModeRadio = document.querySelector('input[name="practiceMode"]:checked');
    settings.practiceMode = practiceModeRadio ? practiceModeRadio.value : 'timed';

    const timedMinutesInput = document.getElementById('timedMinutes');
    settings.timedMinutes = timedMinutesInput ? parseInt(timedMinutesInput.value) : 5;

    const fixedProblemsInput = document.getElementById('fixedProblems');
    settings.fixedProblems = fixedProblemsInput ? parseInt(fixedProblemsInput.value) : 25;

    // Operation Types
    settings.operations = {};
    document.querySelectorAll('.operation-item').forEach(item => {
        const operationKey = item.getAttribute('data-operation');
        const toggleControl = item.querySelector('.toggle-control');
        const isEnabled = toggleControl ? toggleControl.getAttribute('data-state') === 'enabled' : false;

        const rangeStartInput = item.querySelector('.range-start');
        const rangeStart = rangeStartInput ? parseInt(rangeStartInput.value) : 1;

        const rangeEndInput = item.querySelector('.range-end');
        const rangeEnd = rangeEndInput ? parseInt(rangeEndInput.value) : (operationKey === 'multiply' ? 12 : 100);

        let specificSettings = {};
        if (operationKey === 'subtract') {
            const largerFirstCheckbox = item.querySelector('.larger-first');
            specificSettings.largerFirst = largerFirstCheckbox ? largerFirstCheckbox.checked : false;
        }

        settings.operations[operationKey] = {
            enabled: isEnabled,
            range: { start: rangeStart, end: rangeEnd },
            proportion: proportions[operationKey] || 0,
            ...specificSettings
        };
    });

    // Performance Settings (Audio & Feedback, Timing Behavior, Failure Conditions)
    document.querySelectorAll('#performance .toggle-control').forEach(control => {
        const settingId = control.getAttribute('data-setting-id');
        settings[settingId] = control.getAttribute('data-state') === 'enabled';
    });

    const maxResponseTimeInput = document.querySelector('[data-setting-id="maxResponseTime"]');
    settings.maxResponseTime = maxResponseTimeInput ? parseInt(maxResponseTimeInput.value) : 3;

    const failureActionSelect = document.querySelector('[data-setting-id="failureAction"]');
    settings.failureAction = failureActionSelect ? failureActionSelect.value : 'end';

    const maxMistakesInput = document.querySelector('[data-setting-id="maxMistakes"]');
    settings.maxMistakes = maxMistakesInput ? parseInt(maxMistakesInput.value) : 3;

    // Problem Presentation Mode
    settings.problemPresentationMode = document.querySelector('input[name="problemPresentationMode"]:checked')?.value || 'displayVisual';
    // Save brief display duration
    settings.briefDisplayDuration = parseInt(document.getElementById('briefDisplayDuration').value);

    // Save custom colors (only for light mode now)
    settings.customColors = { light: {} };
    document.querySelectorAll('#theme input[type="color"]').forEach(input => {
        const colorVar = input.dataset.colorVar;
        settings.customColors.light[colorVar] = input.value;
    });

    localStorage.setItem('mathMindProSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
    showTemporaryMessage('Settings saved successfully!');
}

// Function to load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('mathMindProSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            console.log('Settings loaded:', settings);

            // Apply Practice Mode
            const practiceModeRadio = document.querySelector(`input[name="practiceMode"][value="${settings.practiceMode}"]`);
            if (practiceModeRadio) practiceModeRadio.checked = true;

            const timedMinutesInput = document.getElementById('timedMinutes');
            if (timedMinutesInput && settings.timedMinutes !== undefined) timedMinutesInput.value = settings.timedMinutes;

            const fixedProblemsInput = document.getElementById('fixedProblems');
            if (fixedProblemsInput && settings.fixedProblems !== undefined) fixedProblemsInput.value = settings.fixedProblems;

            // Apply Operation Types and Proportions
            let loadedProportions = {};
            operations.forEach(op => {
                loadedProportions[op.key] = 0;
            });

            for (const opKey in settings.operations) {
                const item = document.querySelector(`.operation-item[data-operation="${opKey}"]`);
                if (item) {
                    const opSettings = settings.operations[opKey];

                    const globalOp = operations.find(o => o.key === opKey);
                    if (globalOp) {
                        globalOp.enabled = opSettings.enabled;
                    }

                    const toggleControl = item.querySelector('.toggle-control');
                    if (toggleControl && opSettings.enabled !== undefined) {
                        toggleControl.setAttribute('data-state', opSettings.enabled ? 'enabled' : 'disabled');
                        toggleControl.textContent = opSettings.enabled ? 'Enabled' : 'Disabled';
                    }

                    const rangeStartInput = item.querySelector('.range-start');
                    if (rangeStartInput && opSettings.range && opSettings.range.start !== undefined) rangeStartInput.value = opSettings.range.start;

                    const rangeEndInput = item.querySelector('.range-end');
                    if (rangeEndInput && opSettings.range && opSettings.range.end !== undefined) rangeEndInput.value = opSettings.range.end;

                    if (opKey === 'subtract' && opSettings.largerFirst !== undefined) {
                        const largerFirstCheckbox = item.querySelector('.larger-first');
                        if (largerFirstCheckbox) largerFirstCheckbox.checked = opSettings.largerFirst;
                    }

                    if (opSettings.proportion !== undefined) {
                        loadedProportions[opKey] = opSettings.proportion;
                    }
                }
            }
            proportions = loadedProportions;
            console.log('Proportions after loading from settings:', proportions);


            let currentSum = operations.filter(op => op.enabled).reduce((sum, op) => sum + proportions[op.key], 0);
            let enabledCount = operations.filter(op => op.enabled).length;

            if (currentSum !== 100 || (enabledCount > 0 && currentSum === 0)) {
                console.warn('Proportions sum not 100% or all zero for enabled ops. Recalculating equal proportions.');
                calculateEqualProportions();
            } else {
                operations.filter(op => !op.enabled).forEach(op => {
                    proportions[op.key] = 0;
                });
            }

            renderPieChart();
            renderSliders();

            // Apply Performance Settings
            document.querySelectorAll('#performance .toggle-control').forEach(control => {
                const settingId = control.getAttribute('data-setting-id');
                if (settings[settingId] !== undefined) {
                    control.setAttribute('data-state', settings[settingId] ? 'enabled' : 'disabled');
                    control.textContent = settings[settingId] ? 'Enabled' : 'Disabled';
                }
            });

            const maxResponseTimeInput = document.querySelector('[data-setting-id="maxResponseTime"]');
            if (maxResponseTimeInput && settings.maxResponseTime !== undefined) {
                maxResponseTimeInput.value = settings.maxResponseTime;
            }
            const failureActionSelect = document.querySelector('[data-setting-id="failureAction"]');
            if (failureActionSelect && settings.failureAction !== undefined) {
                failureActionSelect.value = settings.failureAction;
            }
            const maxMistakesInput = document.querySelector('[data-setting-id="maxMistakes"]');
            if (maxMistakesInput && settings.maxMistakes !== undefined) {
                maxMistakesInput.value = settings.maxMistakes;
            }

            // Apply Problem Presentation Mode
            const problemPresentationModeRadio = document.querySelector(`input[name="problemPresentationMode"][value="${settings.problemPresentationMode}"]`);
            if (problemPresentationModeRadio) problemPresentationModeRadio.checked = true;
            // Load brief display duration
            const briefDisplayDurationInput = document.getElementById('briefDisplayDuration');
            if (briefDisplayDurationInput && settings.briefDisplayDuration !== undefined) {
                briefDisplayDurationInput.value = settings.briefDisplayDuration;
            }

            // Load custom colors (only for light mode now)
            if (settings.customColors && settings.customColors.light) {
                customColors.light = settings.customColors.light;
            } else {
                // If no custom colors saved, initialize with defaults
                resetToDefaultColors(); // Only reset light mode
            }
            applyCustomColors(); // Apply loaded custom colors
            updateThemeColorPickers(); // Populate color pickers with loaded values

        } catch (e) {
            console.error("Error parsing or applying settings from localStorage:", e);
            // Fallback to default if parsing fails
            calculateEqualProportions();
            renderPieChart();
            renderSliders();
            resetToDefaultColors();
            applyCustomColors();
        }
    } else {
        console.log('No settings found in localStorage. Initializing with defaults.');
        calculateEqualProportions();
        renderPieChart();
        renderSliders();
        // Initialize with default colors if no settings are saved
        resetToDefaultColors(); // Only reset light mode
        applyCustomColors();
    }
}

// Function to update the color pickers in the Theme tab
function updateThemeColorPickers() {
    console.log('updateThemeColorPickers executing');
    document.querySelectorAll('#theme input[type="color"]').forEach(input => {
        const colorVar = input.dataset.colorVar;
        // Always get colors from the light mode object
        if (customColors.light && customColors.light[colorVar]) {
            input.value = customColors.light[colorVar];
            console.log(`Updating picker for ${colorVar} to ${input.value}`);
        } else {
            // Fallback to default hex if not in customColors (shouldn't happen if resetToDefaultColors is called)
            if (defaultLightColors[colorVar]) {
                input.value = defaultLightColors[colorVar];
                console.log(`Updating picker for ${colorVar} to default ${input.value} (fallback)`);
            }
        }
        // Update the visual swatch display
        updateColorSwatch(input);
    });
}

// Helper to convert RGB to Hex (for initial picker population if needed)
// This function is generally for reading computed styles which are RGB(A) and converting them to hex for the picker.
function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb; // Return as is if not rgb or null/undefined
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return rgb;
    const hex = parts.slice(0, 3).map(function(n) { // Only take RGB parts, ignore A
        return ("0" + parseInt(n).toString(16)).slice(-2);
    }).join("");
    return "#" + hex;
}

// Function to update the visual color swatch and display hex value
function updateColorSwatch(colorInput) {
    const swatch = colorInput.nextElementSibling; // The span.color-display-swatch
    if (swatch) {
        const hexValue = colorInput.value;
        swatch.style.backgroundColor = hexValue;
        swatch.textContent = hexValue.toUpperCase(); // Display hex value in uppercase
        // Adjust text color for readability based on background
        const rgb = hexToRgb(hexValue);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        swatch.style.color = brightness > 180 ? '#333' : '#FFF'; // Dark text for light colors, light text for dark colors
    }
}


// Training Session Variables
let trainingSettings = {};
let currentProblem = {};
let problemSolvedCount = 0;
let correctScore = 0;
let incorrectScore = 0;
let timerInterval;
let stopwatchInterval;
let stopwatchMilliseconds = 0;
let timeLeft;
let totalProblemsToSolve;
let sessionStartTime;
let isProblemSubmitted = false;
let sessionEndedPrematurely = false;

const problemDisplay = document.getElementById('problemDisplay');
const answerInput = document.getElementById('answerInput');
const feedbackMessage = document.getElementById('feedbackMessage');
const problemCountDisplay = document.getElementById('problemCountDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const stopwatchDisplay = document.getElementById('stopwatchDisplay');
const trainingProgressBar = document.getElementById('trainingProgressBar');
const currentProblemNumberSpan = document.getElementById('currentProblemNumber');
const totalProblemsSpan = document.getElementById('totalProblems');
const correctScoreSpan = document.getElementById('correctScore');
const incorrectScoreSpan = document.getElementById('incorrectScore');
const endSessionBtn = document.getElementById('endSessionBtn');
const endSessionConfirmation = document.getElementById('endSessionConfirmation');
const confirmEndBtn = document.getElementById('confirmEndBtn');
const cancelEndBtn = document.getElementById('cancelEndBtn');
const countdownDisplay = document.getElementById('countdownDisplay');
const repeatProblemBtn = document.getElementById('repeatProblemBtn'); // Get the new repeat button

const summaryCorrect = document.getElementById('summaryCorrect');
const summaryIncorrect = document.getElementById('summaryIncorrect');
const summaryAccuracy = document.getElementById('summaryAccuracy');
const summaryTimeElapsed = document.getElementById('summaryTimeElapsed');
const summaryAvgTime = document.getElementById('summaryAvgTime');
const summaryModalTitle = document.getElementById('summaryModalTitle');
const problemsSolvedCountElement = document.getElementById('problemsSolvedCount');

// Function for Text-to-Speech
let speechVoices = [];
function populateVoices() {
    speechVoices = window.speechSynthesis.getVoices();
}
// Populate voices as soon as they are loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
}


function textToSpeech(text) {
    if ('speechSynthesis' in window) {
        // Ensure voices are loaded before attempting to speak
        if (speechVoices.length === 0) {
            populateVoices(); // Try to populate them now
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Optional: Select a specific voice, e.g., an English US female voice
        const englishVoice = speechVoices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google') && voice.name.includes('Female'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        } else {
            // Fallback to any English voice
            utterance.voice = speechVoices.find(voice => voice.lang.startsWith('en'));
        }

        utterance.pitch = 1; // Default pitch
        utterance.rate = 1;  // Default rate

        // Ensure audio context is running (Tone.js already handles this on click, but good to double check)
        if (Tone.context.state !== 'running') {
            Tone.start().then(() => {
                window.speechSynthesis.speak(utterance);
            }).catch(e => console.error("Failed to start Tone.js audio context for speech:", e));
        } else {
            window.speechSynthesis.speak(utterance);
        }

    } else {
        console.warn("Speech Synthesis API not supported in this browser.");
        // Fallback: play a chime if speech is not supported
        chime.triggerAttackRelease("C5", "8n");
    }
}


// Function to start a training session
async function startTrainingSession() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("Tone.js audio context started.");
    }

    try {
        trainingSettings = JSON.parse(localStorage.getItem('mathMindProSettings')) || {};
    } catch (e) {
        console.error("Error parsing settings from localStorage:", e);
        trainingSettings = {};
    }

    // Ensure operations settings are initialized if not found
    if (!trainingSettings.operations) {
        trainingSettings.operations = {};
        operations.forEach(op => {
            trainingSettings.operations[op.key] = {
                enabled: true,
                range: { start: 1, end: (op.key === 'multiply' ? 12 : 100) },
                proportion: 0
            };
            if (op.key === 'subtract') {
                trainingSettings.operations[op.key].largerFirst = true;
            }
        });
        calculateEqualProportions();
    }

    // Ensure problemPresentationMode is initialized
    if (!trainingSettings.problemPresentationMode) {
        trainingSettings.problemPresentationMode = 'displayVisual';
    }
    // Ensure briefDisplayDuration is initialized
    if (trainingSettings.briefDisplayDuration === undefined) {
        trainingSettings.briefDisplayDuration = 2; // Default to 2 seconds
    }

    // Log the current presentation mode for debugging
    console.log("Current problemPresentationMode:", trainingSettings.problemPresentationMode);


    const enabledOperations = operations.filter(op => trainingSettings.operations[op.key]?.enabled);
    if (enabledOperations.length === 0) {
        showTemporaryMessage('Please enable at least one operation type in settings to start training.');
        return;
    }

    showModal('trainingModal');
    problemSolvedCount = 0;
    correctScore = 0;
    incorrectScore = 0;
    feedbackMessage.textContent = '';
    answerInput.value = '';
    sessionStartTime = Date.now();
    sessionEndedPrematurely = false;

    endSessionBtn.style.display = 'block';
    endSessionConfirmation.classList.remove('active');

    // Initially hide problem display and answer input, will be shown after countdown
    problemDisplay.style.display = 'none';
    answerInput.parentElement.style.display = 'none'; // Hide the container for input and button
    problemCountDisplay.style.display = 'none';
    timerDisplay.style.display = 'none';
    stopwatchDisplay.style.display = 'none';
    endSessionBtn.style.display = 'none';
    repeatProblemBtn.style.display = 'none'; // Hide repeat button by default

    if (trainingSettings.practiceMode === 'timed') {
        totalProblemsToSolve = Infinity;
        timeLeft = trainingSettings.timedMinutes * 60;
        document.getElementById('trainingModalTitle').textContent = `Timed Practice (${trainingSettings.timedMinutes} min)`;
    } else {
        totalProblemsToSolve = trainingSettings.fixedProblems;
        document.getElementById('trainingModalTitle').textContent = `Fixed Quantity Practice (${trainingSettings.fixedProblems} problems)`;
    }

    startCountdown();
}

// Function to handle the countdown
function startCountdown() {
    let count = 3;
    countdownDisplay.textContent = count;
    countdownDisplay.style.display = 'block';

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDisplay.textContent = count;
        } else if (count === 0) {
            countdownDisplay.textContent = 'Go!';
        } else {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';

            // Show elements based on initial presentation mode
            if (trainingSettings.problemPresentationMode !== 'speakAloud') {
                problemDisplay.style.display = 'block';
            } else {
                problemDisplay.style.display = 'none'; // Keep hidden for audio-only
            }
            answerInput.parentElement.style.display = 'flex'; // Show the container for input and button
            problemCountDisplay.style.display = 'flex';
            endSessionBtn.style.display = 'block';

            // Show repeat button only if speech is enabled
            if (trainingSettings.problemPresentationMode === 'speakAloud' || trainingSettings.problemPresentationMode === 'displaySpeak') {
                repeatProblemBtn.style.display = 'flex';
            } else {
                repeatProblemBtn.style.display = 'none';
            }

            if (trainingSettings.practiceMode === 'timed') {
                timerDisplay.style.display = 'block';
                updateTimerDisplay();
                timerInterval = setInterval(updateTimer, 1000);
            }
            stopwatchDisplay.style.display = 'block';

            answerInput.focus();

            generateProblem();
        }
    }, 1000);
}

// Function to start the individual problem stopwatch
function startStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchMilliseconds = 0;
    updateStopwatchDisplay();

    const problemStartTime = Date.now();

    stopwatchInterval = setInterval(() => {
        stopwatchMilliseconds = Date.now() - problemStartTime;
        updateStopwatchDisplay();

        if (trainingSettings.enableMaxResponseTime && !isProblemSubmitted) {
            const maxResponseTimeSeconds = trainingSettings.maxResponseTime ?? 3;
            if ((stopwatchMilliseconds / 1000) > maxResponseTimeSeconds) {
                checkAnswer(true);
            }
        }
    }, 10);
}

// Function to stop the individual problem stopwatch
function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

// Function to update the individual problem stopwatch display
function updateStopwatchDisplay() {
    if (trainingSettings.hideTimer) {
        stopwatchDisplay.style.display = 'none';
        return;
    }
    const totalSeconds = (stopwatchMilliseconds / 1000).toFixed(1);
    stopwatchDisplay.textContent = `${totalSeconds}s`;
    stopwatchDisplay.style.display = 'block';
}

// Function to request ending the training session (shows confirmation)
function requestEndSession() {
    clearInterval(timerInterval);
    stopStopwatch();
    problemDisplay.style.display = 'none';
    answerInput.parentElement.style.display = 'none'; // Hide the container for input and button
    problemCountDisplay.style.display = 'none';
    timerDisplay.style.display = 'none';
    stopwatchDisplay.style.display = 'none';
    countdownDisplay.style.display = 'none';
    repeatProblemBtn.style.display = 'none'; // Hide repeat button

    endSessionBtn.style.display = 'none';
    endSessionConfirmation.classList.add('active');
    sessionEndedPrematurely = true;
}

// Function to confirm and end the training session (finalizes)
function confirmEndSession() {
    hideModal('trainingModal');
    clearInterval(timerInterval);
    stopStopwatch();

    const totalProblemsAttempted = correctScore + incorrectScore;
    const finalAccuracy = totalProblemsAttempted > 0 ? ((correctScore / totalProblemsAttempted) * 100).toFixed(1) : 0;
    const timeElapsedMilliseconds = Date.now() - sessionStartTime;

    const totalSeconds = Math.floor(timeElapsedMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTimeElapsed = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const avgTimePerProblem = totalProblemsAttempted > 0 ? (timeElapsedMilliseconds / totalProblemsAttempted / 1000).toFixed(1) : 0;

    summaryCorrect.textContent = correctScore;
    summaryIncorrect.textContent = incorrectScore;
    summaryAccuracy.textContent = `${finalAccuracy}%`;
    summaryTimeElapsed.textContent = formattedTimeElapsed;
    summaryAvgTime.textContent = `${avgTimePerProblem}s`;

    if (sessionEndedPrematurely) {
        summaryModalTitle.textContent = 'Practice Incomplete — 🤷‍♂️';
    } else {
        summaryModalTitle.textContent = 'Practice Complete! 🎉';
    }

    const sessionStartDateTime = new Date(sessionStartTime);
    const sessionData = {
        sessionId: crypto.randomUUID(),
        date: sessionStartDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        startTimeISO: sessionStartDateTime.toISOString(),
        practiceMode: trainingSettings.practiceMode === 'timed' ? `Timed Practice (${trainingSettings.timedMinutes} min)` : `Fixed Quantity (${trainingSettings.fixedProblems} problems)`,
        operationTypes: operations.filter(op => trainingSettings.operations[op.key]?.enabled).map(op => op.name).join(', '),
        operationProportions: Object.entries(proportions).filter(([key, value]) => value > 0).map(([key, value]) => {
            const opName = operations.find(op => op.key === key)?.name;
            return `${opName}: ${Math.round(value)}%`;
        }).join(' / '),
        operationRanges: Object.entries(trainingSettings.operations)
            .filter(([key, op]) => op.enabled)
            .map(([key, op]) => {
                const opName = operations.find(o => o.key === key)?.name;
                return `${opName}: ${op.range.start}-${op.range.end}`;
            })
            .join('; '),
        correctAnswers: correctScore,
        incorrectAnswers: incorrectScore,
        finalAccuracy: finalAccuracy,
        timeElapsed: formattedTimeElapsed,
        avgTimePerProblem: `${avgTimePerProblem}s`,
        sessionEndedPrematurely: sessionEndedPrematurely
    };

    let sessions = JSON.parse(localStorage.getItem('mathMindProSessions') || '[]');
    sessions.unshift(sessionData);
    if (sessions.length > 50) {
        sessions = sessions.slice(0, 50);
    }
    localStorage.setItem('mathMindProSessions', JSON.stringify(sessions));

    showModal('summaryModal');
    renderRecentSessions(currentRecentSessionsPage);
    updateDashboardStats();
}

// Function to cancel ending the session and resume training
function cancelEndSession() {
    // Restore visibility based on current problem presentation mode
    if (trainingSettings.problemPresentationMode !== 'speakAloud') {
        problemDisplay.style.display = 'block';
    } else {
        problemDisplay.style.display = 'none';
    }
    answerInput.parentElement.style.display = 'flex'; // Show the container for input and button
    problemCountDisplay.style.display = 'flex';
    stopwatchDisplay.style.display = 'block';
    countdownDisplay.style.display = 'none';

    // Show repeat button only if speech is enabled
    if (trainingSettings.problemPresentationMode === 'speakAloud' || trainingSettings.problemPresentationMode === 'displaySpeak') {
        repeatProblemBtn.style.display = 'flex';
    } else {
        repeatProblemBtn.style.display = 'none';
    }

    if (trainingSettings.practiceMode === 'timed') {
        timerDisplay.style.display = 'block';
        timerInterval = setInterval(updateTimer, 1000);
    }

    endSessionBtn.style.display = 'block';
    endSessionConfirmation.classList.remove('active');
    sessionEndedPrematurely = false;

    answerInput.focus();
    startStopwatch();
}

// Function to generate a new problem
function generateProblem() {
    if (!trainingSettings.operations) {
        trainingSettings.operations = {};
    }
    const enabledOps = operations.filter(op => trainingSettings.operations[op.key]?.enabled);
    if (enabledOps.length === 0) {
        problemDisplay.textContent = "No operations enabled. Please check settings.";
        return;
    }

    let randomValue = Math.random() * 100;
    let selectedOperationKey = '';
    let cumulativeProportion = 0;

    for (const op of enabledOps) {
        const opProportion = trainingSettings.operations[op.key]?.proportion || 0;
        cumulativeProportion += opProportion;
        if (randomValue <= cumulativeProportion) {
            selectedOperationKey = op.key;
            break;
        }
    }

    if (!selectedOperationKey && enabledOps.length > 0) {
        selectedOperationKey = enabledOps[0].key;
    } else if (!selectedOperationKey) {
        problemDisplay.textContent = "Error: Unknown operation";
        answer = 0;
    }

    const opSettings = trainingSettings.operations[selectedOperationKey];
    const startRange = opSettings?.range?.start !== undefined ? opSettings.range.start : 1;
    const endRange = opSettings?.range?.end !== undefined ? opSettings.range.end : (selectedOperationKey === 'multiply' ? 12 : 100);

    let num1, num2, answer;
    let problemString;

    switch (selectedOperationKey) {
        case 'addition':
            num1 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            num2 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            answer = num1 + num2;
            problemString = `${num1} + ${num2} = ?`;
            break;
        case 'subtract':
            num1 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            num2 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            if ((opSettings?.largerFirst ?? false) && num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            answer = num1 - num2;
            problemString = `${num1} - ${num2} = ?`;
            break;
        case 'multiply':
            num1 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            num2 = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
            answer = num1 * num2;
            problemString = `${num1} × ${num2} = ?`;
            break;
        case 'divide':
            let divisor, result;
            do {
                // Ensure divisor is within the specified range
                divisor = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
                // Ensure the result of the division is also within the specified range
                result = Math.floor(Math.random() * (endRange - startRange + 1)) + startRange;
                num1 = divisor * result; // Calculate dividend based on divisor and result
            } while (divisor === 0 || num1 < startRange || num1 > endRange || result === 0); // Ensure num1 and result are within range, and no division by zero
            num2 = divisor;
            answer = num1 / num2;
            problemString = `${num1} ÷ ${num2} = ?`;
            break;
        default:
            problemString = "Error: Unknown operation";
            answer = 0;
    }

    currentProblem = {
        string: problemString,
        answer: answer
    };

    problemDisplay.textContent = currentProblem.string;
    answerInput.value = '';
    feedbackMessage.textContent = '';
    feedbackMessage.style.opacity = 0;
    feedbackMessage.style.visibility = 'hidden';
    answerInput.focus();
    updateProblemCountDisplay();
    isProblemSubmitted = false;
    startStopwatch();

    // Adjust problem display and speech based on presentation mode
    switch (trainingSettings.problemPresentationMode) {
        case 'displayVisual':
            problemDisplay.style.display = 'block';
            answerInput.parentElement.style.display = 'flex';
            repeatProblemBtn.style.display = 'none'; // Hide repeat button
            break;
        case 'displayBriefly':
            problemDisplay.style.display = 'block';
            answerInput.parentElement.style.display = 'flex';
            repeatProblemBtn.style.display = 'none'; // Hide repeat button
            setTimeout(() => {
                problemDisplay.style.display = 'none';
            }, (trainingSettings.briefDisplayDuration || 2) * 1000); // Use briefDisplayDuration from settings
            break;
        case 'speakAloud':
            problemDisplay.style.display = 'none'; // Hide visual problem
            answerInput.parentElement.style.display = 'flex'; // Keep input visible
            repeatProblemBtn.style.display = 'flex'; // Show repeat button
            textToSpeech(currentProblem.string);
            break;
        case 'displaySpeak':
            problemDisplay.style.display = 'block';
            answerInput.parentElement.style.display = 'flex';
            repeatProblemBtn.style.display = 'flex'; // Show repeat button
            textToSpeech(currentProblem.string);
            break;
        default:
            problemDisplay.style.display = 'block';
            answerInput.parentElement.style.display = 'flex';
            repeatProblemBtn.style.display = 'none'; // Hide repeat button
            break;
    }
}

// Function to animate score numbers
function animateScore(element, start, end, duration = 300) {
    let startTime = null;
    const easeOutQuad = t => t * (2 - t);

    const animateStep = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentValue = Math.floor(start + (end - start) * easedProgress);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(animateStep);
        }
    };
    requestAnimationFrame(animateStep);
}

// Function to check the answer
function checkAnswer(isTimedOut = false) {
    console.log('checkAnswer called. isTimedOut:', isTimedOut, 'isProblemSubmitted:', isProblemSubmitted);
    if (isProblemSubmitted && !isTimedOut) {
        console.log('Problem already submitted and not a timeout. Exiting checkAnswer.');
        return;
    }

    isProblemSubmitted = true;
    stopStopwatch();

    const userAnswer = parseFloat(answerInput.value);
    let isCorrect = false;

    if (isTimedOut) {
        isCorrect = false;
        if (trainingSettings.errorBuzzer) {
            buzzer.triggerAttackRelease("C2", "16n");
        }
        console.log("Time exceeded. Marking incorrect.");
    } else {
        if (isNaN(userAnswer)) {
            showTemporaryMessage('Please enter a number.', 1500);
            isProblemSubmitted = false; // Allow re-submission if input is invalid
            startStopwatch(); // Restart stopwatch
            console.log('Invalid input. Not submitting. isProblemSubmitted reset to false.');
            return;
        }
        isCorrect = (userAnswer === currentProblem.answer);
    }

    if (isCorrect) {
        correctScore++;
        animateScore(correctScoreSpan, correctScore - 1, correctScore);
        if (trainingSettings.successChime) {
            chime.triggerAttackRelease("C5", "8n");
        }
        console.log('Answer Correct! Current correct score:', correctScore);
    } else {
        incorrectScore++;
        animateScore(incorrectScoreSpan, incorrectScore - 1, incorrectScore);
        if (trainingSettings.errorBuzzer) {
            buzzer.triggerAttackRelease("C2", "16n");
        }
        console.log('Answer Incorrect! Current incorrect score:', incorrectScore);
    }

    if (!isCorrect && (trainingSettings.retryUntilCorrect ?? false)) {
        isProblemSubmitted = false;
        answerInput.value = '';
        answerInput.focus();
        startStopwatch();
        console.log('Answer incorrect and retryUntilCorrect is enabled. Resetting for retry.');
        return;
    }

    problemSolvedCount++;
    console.log('Problem solved count:', problemSolvedCount);

    if (trainingSettings.enableFailureCondition && incorrectScore >= (trainingSettings.maxMistakes ?? 3)) {
        console.log('Failure condition met. Incorrect score:', incorrectScore, 'Max mistakes:', trainingSettings.maxMistakes);
        if (trainingSettings.failureAction === 'end') {
            sessionEndedPrematurely = true;
            confirmEndSession();
        } else if (trainingSettings.failureAction === 'restart') {
            showTemporaryMessage(`Restarting session: Too many mistakes (${incorrectScore}).`);
            startTrainingSession();
        }
        return;
    }

    if (trainingSettings.practiceMode === 'fixed' && problemSolvedCount >= totalProblemsToSolve) {
        console.log('Fixed problems reached. Ending session.');
        sessionEndedPrematurely = false;
        confirmEndSession();
    } else {
        console.log('Generating next problem.');
        generateProblem();
    }
    updateProblemCountDisplay();
}

// Update problem count display
function updateProblemCountDisplay() {
    currentProblemNumberSpan.textContent = problemSolvedCount;
    if (trainingSettings.practiceMode === 'fixed') {
        totalProblemsSpan.textContent = totalProblemsToSolve;
        const progress = (problemSolvedCount / totalProblemsToSolve) * 100;
        trainingProgressBar.style.width = `${progress}%`;
    } else {
        totalProblemsSpan.textContent = '∞';
        trainingProgressBar.style.width = `0%`;
    }
    correctScoreSpan.textContent = correctScore;
    incorrectScoreSpan.textContent = incorrectScore;
}

// Update timer display for timed mode
function updateTimerDisplay() {
    if (trainingSettings.hideTimer) {
        timerDisplay.style.display = 'none';
        return;
    }
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Timer countdown logic
function updateTimer() {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
        sessionEndedPrematurely = false;
        confirmEndSession();
    }
}

// Recent Sessions Pagination and Grouping
let currentRecentSessionsPage = 1;
const sessionsPerPage = 3;

// Variables for two-click delete
let pendingDeleteSessionId = null;
let pendingDeleteButton = null;
let pendingDeleteTimeout = null;

function handleDeleteClick(event) {
    const clickedButton = event.currentTarget;
    const sessionId = clickedButton.dataset.sessionId;

    if (pendingDeleteSessionId === sessionId && pendingDeleteButton === clickedButton) {
        clearTimeout(pendingDeleteTimeout);
        deleteSession(sessionId);
        pendingDeleteSessionId = null;
        pendingDeleteButton = null;
    } else {
        if (pendingDeleteButton) {
            pendingDeleteButton.classList.remove('delete-confirm');
            clearTimeout(pendingDeleteTimeout);
        }

        clickedButton.classList.add('delete-confirm');
        pendingDeleteSessionId = sessionId;
        pendingDeleteButton = clickedButton;

        pendingDeleteTimeout = setTimeout(() => {
            if (pendingDeleteSessionId === sessionId) {
                clickedButton.classList.remove('delete-confirm');
                pendingDeleteSessionId = null;
                pendingDeleteButton = null;
            }
        }, 3000);
    }
}

function deleteSession(idToDelete) {
    let sessions = JSON.parse(localStorage.getItem('mathMindProSessions') || '[]');
    sessions = sessions.filter(session => session.sessionId !== idToDelete);
    localStorage.setItem('mathMindProSessions', JSON.stringify(sessions));
    showTemporaryMessage('Session deleted successfully!');
    renderRecentSessions(currentRecentSessionsPage);
    updateDashboardStats();
}

function renderRecentSessions(page = 1) {
    const recentSessionsContainer = document.getElementById('recentSessionsContainer');
    const paginationControls = document.getElementById('paginationControls');
    if (!recentSessionsContainer || !paginationControls) return;

    recentSessionsContainer.innerHTML = '';
    paginationControls.innerHTML = '';

    let allSessions = JSON.parse(localStorage.getItem('mathMindProSessions') || '[]');

    const completedSessions = allSessions.filter(session => !session.sessionEndedPrematurely);

    const sessionsByDate = completedSessions.reduce((acc, session) => {
        const dateKey = session.date;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(session);
        return acc;
    }, {});

    const sortedDateKeys = Object.keys(sessionsByDate).sort((a, b) => {
        const dateA = new Date(sessionsByDate[a][0].startTimeISO);
        const dateB = new Date(sessionsByDate[b][0].startTimeISO);
        return dateB - dateA;
    });

    const totalDateGroups = sortedDateKeys.length;
    const totalPages = Math.ceil(totalDateGroups / sessionsPerPage);

    currentRecentSessionsPage = Math.max(1, Math.min(page, totalPages));

    if (totalDateGroups === 0) {
        recentSessionsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recent sessions yet. Start a practice session!</p>';
        return;
    }

    const startIndex = (currentRecentSessionsPage - 1) * sessionsPerPage;
    const endIndex = startIndex + sessionsPerPage;
    const paginatedDateKeys = sortedDateKeys.slice(startIndex, endIndex);

    paginatedDateKeys.forEach(dateKey => {
        const dateGroupElement = document.createElement('details');
        dateGroupElement.classList.add('session-date-group');
        // Removed the line that sets the 'open' attribute by default
        // if (dateKey === sortedDateKeys[0]) {
        //     dateGroupElement.setAttribute('open', '');
        // }

        const summaryElement = document.createElement('summary');
        summaryElement.textContent = dateKey;
        dateGroupElement.appendChild(summaryElement);

        sessionsByDate[dateKey].sort((a, b) => new Date(b.startTimeISO) - new Date(a.startTimeISO)).forEach(session => {
            const microCard = document.createElement('div');
            microCard.classList.add('session-micro-card');

            microCard.style.paddingRight = '3rem';

            const sessionTime = new Date(session.startTimeISO).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            microCard.innerHTML = `
                <div class="session-header">
                    <span class="session-mode-label">${session.practiceMode}</span>
                    <span class="session-date-time">${session.date} ${sessionTime}</span>
                </div>
                <div class="session-details">
                    <p><strong>Operations:</strong> ${session.operationTypes}</p>
                    <p><strong>Proportions:</strong> ${session.operationProportions}</p>
                    <p><strong>Number Range:</strong> ${session.operationRanges || 'N/A'}</p>
                    <p><strong>Correct:</strong> ${session.correctAnswers} | <strong>Incorrect:</strong> ${session.incorrectAnswers}</p>
                    <p><strong>Accuracy:</strong> ${session.finalAccuracy}% | <strong>Time:</strong> ${session.timeElapsed} | <strong>Avg:</strong> ${session.avgTimePerProblem}</p>
                </div>
                <button class="delete-session-btn" data-session-id="${session.sessionId}" title="Delete Session">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            `;
            dateGroupElement.appendChild(microCard);
        });
        recentSessionsContainer.appendChild(dateGroupElement);
    });

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('pagination-button');
            pageButton.textContent = i;
            if (i === currentRecentSessionsPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => renderRecentSessions(i));
            paginationControls.appendChild(pageButton);
        }
    }

    document.querySelectorAll('.delete-session-btn').forEach(button => {
        button.addEventListener('click', handleDeleteClick);
    });

    document.addEventListener('click', (event) => {
        if (pendingDeleteButton && !pendingDeleteButton.contains(event.target) && !event.target.closest('.delete-session-btn')) {
            pendingDeleteButton.classList.remove('delete-confirm');
            pendingDeleteSessionId = null;
            pendingDeleteButton = null;
            clearTimeout(pendingDeleteTimeout);
        }
    });
}

// Function to update the dashboard statistics
function updateDashboardStats() {
    const allSessions = JSON.parse(localStorage.getItem('mathMindProSessions') || '[]');
    const completedSessions = allSessions.filter(session => !session.sessionEndedPrematurely);

    let totalProblemsSolved = 0;
    let totalCorrectAnswers = 0;
    let totalIncorrectAnswers = 0;
    let totalTimeElapsedMilliseconds = 0;
    let totalSessions = 0;

    completedSessions.forEach(session => {
        totalProblemsSolved += (session.correctAnswers || 0) + (session.incorrectAnswers || 0);
        totalCorrectAnswers += (session.correctAnswers || 0);
        totalIncorrectAnswers += (session.incorrectAnswers || 0);

        if (session.timeElapsed) {
            const parts = session.timeElapsed.split(':');
            const minutes = parseInt(parts[0] || '0');
            const seconds = parseInt(parts[1] || '0');
            totalTimeElapsedMilliseconds += (minutes * 60 * 1000) + (seconds * 1000);
        }
        totalSessions++;
    });

    if (problemsSolvedCountElement) {
        problemsSolvedCountElement.textContent = totalProblemsSolved;
    }

    const accuracyRateElement = document.querySelector('.stat-card:nth-child(2) .progress-text');
    if (accuracyRateElement) {
        const totalAttempted = totalCorrectAnswers + totalIncorrectAnswers;
        const accuracy = totalAttempted > 0 ? ((totalCorrectAnswers / totalAttempted) * 100).toFixed(1) : 0;
        accuracyRateElement.textContent = `${accuracy}%`;
        const accuracyProgressFill = document.querySelector('.stat-card:nth-child(2) .progress-fill');
        if (accuracyProgressFill) {
            const circumference = 2 * Math.PI * 32;
            const offset = circumference - (accuracy / 100) * circumference;
            accuracyProgressFill.style.strokeDashoffset = offset;
        }
    }

    const avgResponseTimeElement = document.querySelector('.stat-card:nth-child(3) .progress-text');
    if (avgResponseTimeElement) {
        const avgTimeMs = totalProblemsSolved > 0 ? (totalTimeElapsedMilliseconds / totalProblemsSolved) : 0;
        const avgTimeSeconds = (avgTimeMs / 1000).toFixed(1);
        avgResponseTimeElement.textContent = `${avgTimeSeconds}s`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded fired');
    loadSettings();
    renderRecentSessions();
    updateDashboardStats();

    // Populate voices on DOMContentLoaded
    populateVoices();

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
        });
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    // Removed event listener for themeToggle

    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    setTimeout(() => {
        const rings = document.querySelectorAll('.progress-fill');
        rings.forEach(ring => {
            const currentOffset = ring.style.strokeDashoffset || ring.getAttribute('stroke-dashoffset');
            if (ring) {
                ring.style.strokeDashoffset = '201.06';
                setTimeout(() => {
                    ring.style.strokeDashoffset = currentOffset;
                }, 100);
            }
        });
    }, 500);

    document.querySelectorAll('.toggle-control').forEach(control => {
        control.addEventListener('click', function () {
            let currentState = this.getAttribute('data-state');
            const operationItem = this.closest('.operation-item');
            const settingId = this.getAttribute('data-setting-id');

            if (operationItem) {
                const operationKey = operationItem.getAttribute('data-operation');
                if (currentState === 'enabled') {
                    this.setAttribute('data-state', 'disabled');
                    this.textContent = 'Disabled';
                    operations.find(op => op.key === operationKey).enabled = false;
                } else {
                    this.setAttribute('data-state', 'enabled');
                    this.textContent = 'Enabled';
                    operations.find(op => op.key === operationKey).enabled = true;
                }
                calculateEqualProportions();
                renderPieChart();
                renderSliders();
            } else if (settingId) {
                if (currentState === 'enabled') {
                    this.setAttribute('data-state', 'disabled');
                    this.textContent = 'Disabled';
                } else {
                    this.setAttribute('data-state', 'enabled');
                    this.textContent = 'Enabled';
                }
            }
            saveSettings();
        });
    });

    document.querySelectorAll('.dropdown-trigger').forEach(control => {
        control.addEventListener('click', function (e) {
            e.stopPropagation();
            const parentItem = this.closest('.operation-item');
            if (parentItem) parentItem.classList.toggle('active');
        });
    });

    document.addEventListener('click', function (e) {
        document.querySelectorAll('.operation-item.active').forEach(item => {
            if (item && !item.contains(e.target) && !e.target.closest('.dropdown-trigger')) {
                item.classList.remove('active');
            }
        });
    });

    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('startPracticeBtn').addEventListener('click', startTrainingSession);
    // Removed fabStartPractice listener as it's not in the HTML
    // document.getElementById('fabStartPractice').addEventListener('click', startTrainingSession);

    // Event listener for the new restore default colors button
    const restoreDefaultColorsBtn = document.getElementById('restoreDefaultColorsBtn');
    if (restoreDefaultColorsBtn) {
        console.log('Restore Default Colors button found and event listener attached.');
        restoreDefaultColorsBtn.addEventListener('click', resetToDefaultColors);
    } else {
        console.error('Restore Default Colors button NOT found!');
    }

    // Add logs to answerInput event listeners
    if (answerInput) {
        answerInput.addEventListener('keydown', function (e) {
            console.log('keydown event on answerInput. Key:', e.key);
            if (e.key === 'Enter') {
                console.log('Enter key pressed. Calling checkAnswer().');
                checkAnswer();
            }
        });

        answerInput.addEventListener('input', function () {
            console.log('input event on answerInput. Current value:', answerInput.value);
            if (trainingSettings.autoSubmit && !isProblemSubmitted) {
                const userAnswerString = answerInput.value;
                const correctAnswerString = String(currentProblem.answer);

                console.log('Auto-submit check: userAnswerString length:', userAnswerString.length, 'correctAnswerString length:', correctAnswerString.length);

                if (!isNaN(parseFloat(userAnswerString)) && userAnswerString.length === correctAnswerString.length) {
                    console.log('Auto-submit condition met. Calling checkAnswer().');
                    checkAnswer();
                }
            }
        });
    } else {
        console.error('Answer input element not found!');
    }


    endSessionBtn.addEventListener('click', requestEndSession);
    confirmEndBtn.addEventListener('click', confirmEndSession);
    cancelEndBtn.addEventListener('click', cancelEndSession);

    document.getElementById('testChimeBtn').addEventListener('click', async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        chime.triggerAttackRelease("C5", "8n");
    });
    document.getElementById('testBuzzerBtn').addEventListener('click', async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        buzzer.triggerAttackRelease("C2", "16n");
    });

    // Event listener for the new briefDisplayDuration input
    const briefDisplayDurationInput = document.getElementById('briefDisplayDuration');
    if (briefDisplayDurationInput) {
        briefDisplayDurationInput.addEventListener('change', saveSettings);
    }

    // Add event listeners for problem presentation mode radio buttons
    document.querySelectorAll('input[name="problemPresentationMode"]').forEach(radio => {
        radio.addEventListener('change', saveSettings);
    });

    // Event listener for the repeat problem button
    if (repeatProblemBtn) {
        repeatProblemBtn.addEventListener('click', () => {
            if (currentProblem && currentProblem.string) {
                textToSpeech(currentProblem.string);
                answerInput.focus(); // Add this line to refocus the input
            }
        });
    }

    // Event listeners for color pickers (only for light mode now)
    document.querySelectorAll('#theme input[type="color"]').forEach(input => {
        input.addEventListener('input', function() {
            const colorVar = this.dataset.colorVar;
            // Always store and apply to light mode
            customColors.light[colorVar] = this.value; 
            // Apply the color, converting to RGBA if necessary
            if (defaultAlphas.light && defaultAlphas.light[colorVar] !== undefined) {
                document.documentElement.style.setProperty(colorVar, hexToRgba(this.value, defaultAlphas.light[colorVar]));
            } else {
                document.documentElement.style.setProperty(colorVar, this.value);
            }
            updateColorSwatch(this); // Update the visual swatch
        });
        input.addEventListener('change', saveSettings); // Save settings when color is finalized
    });
});

// Keyboard Shortcuts
document.addEventListener('keydown', function (e) {
    // Removed Alt + T for theme toggle

    if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleSidebar();
    }

    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            if (modal) {
                if (modal.id === 'trainingModal') {
                    if (endSessionConfirmation.classList.contains('active')) {
                        cancelEndSession();
                    } else {
                        requestEndSession();
                    }
                } else if (modal.id === 'summaryModal') {
                    hideModal('summaryModal');
                } else {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
});
