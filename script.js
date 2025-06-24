console.log("script.js wird ausgeführt");

function checkFirebase() {
    if (typeof firebase !== 'undefined') {
        console.log("Firebase ist jetzt definiert!", firebase);
        initializeActualApp();
    } else {
        console.log("Firebase ist immer noch nicht definiert. Erneuter Versuch in 100ms.");
        setTimeout(checkFirebase, 100);
    }
}

setTimeout(checkFirebase, 50);

function initializeActualApp() {
    console.log("initializeActualApp() wird aufgerufen, da Firebase jetzt definiert ist.");

    const firebaseConfig = { apiKey: "AIzaSyDkJwykLgHJknOjhsplI_BC77DZJ1wc3Sc", authDomain: "makersplayce-shift-planner.firebaseapp.com", databaseURL: "https://makersplayce-shift-planner-default-rtdb.europe-west1.firebasedatabase.app", projectId: "makersplayce-shift-planner", storageBucket: "makersplayce-shift-planner.firebasestorage.app", messagingSenderId: "484080846181", appId: "1:484080846181:web:3120dd6711d51a6e8f4d8c", measurementId: "G-171W3Y9YQB" };
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    const DEFAULT_MASTER_PASSWORD = "superadmin";
    const ACTIVE_SESSION_USER_KEY = "activeShiftUser_v7_firebase_cached";
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const standardShiftTimes = ["9:30 - 13:00", "13:00 - 16:30"];
    const SHIFT_DURATION_HOURS = 3.5;
    const USER_APPLICATION_WEEKS_FORWARD = 4;

    let currentMasterPassword = DEFAULT_MASTER_PASSWORD;
    let coworkers = [];
    let loggedInCoworker = null;
    let isManagerModeActive = false;
    let currentViewingDateMgr;
    let allShiftsData = {};
    let currentPastShiftViewDate;
    let currentUserApplicationViewingDate;
    let editingShiftId = null;
    let currentShiftForModal = null;
    let editingCustomShiftId = null;
    let currentManagerShiftView = 'standard';
    let currentShiftToTrade = null;
    let pendingTradesCache = [];

    const initialLoginViewWrapper = document.getElementById('initialLoginViewWrapper');
    const loginUserSelect = document.getElementById('loginUserSelect');
    const loginPasswordInput = document.getElementById('loginPassword');
    const coworkerLoginBtn = document.getElementById('coworkerLoginBtn');
    const initialLoginError = document.getElementById('initialLoginError');
    const userShiftViewWrapper = document.getElementById('userShiftViewWrapper');
    const latestPublishedScheduleSection = document.getElementById('latestPublishedScheduleSection');
    const latestPublishedScheduleTitle = document.getElementById('latestPublishedScheduleTitle');
    const latestPublishedScheduleTableBody = document.getElementById('latestPublishedScheduleTable').getElementsByTagName('tbody')[0];
    const userLatestCustomShiftsSection = document.getElementById('userLatestCustomShiftsSection');
    const userLatestCustomShiftsTableBody = document.getElementById('userLatestCustomShiftsTable')?.getElementsByTagName('tbody')[0];

    const welcomeUserName = document.getElementById('welcomeUserName');
    const accessManagerPanelBtn = document.getElementById('accessManagerPanelBtn');
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    const userShiftsTableBody = document.getElementById('userShiftsTable').getElementsByTagName('tbody')[0];
    const userCustomShiftsSection = document.getElementById('userCustomShiftsSection');
    const userCustomShiftsTableBody = document.getElementById('userCustomShiftsTable')?.getElementsByTagName('tbody')[0];

    const myUpcomingShiftsSection = document.getElementById('myUpcomingShiftsSection');
    const myUpcomingShiftsTableBody = document.getElementById('myUpcomingShiftsTable').getElementsByTagName('tbody')[0];

    const shiftTradeRequestsSection = document.getElementById('shiftTradeRequestsSection');
    const tradeRequestsList = document.getElementById('tradeRequestsList');
    const tradeOptionsModal = document.getElementById('tradeOptionsModal');
    const tradeOptionsModalTitle = document.getElementById('tradeOptionsModalTitle');
    const showSwapModalBtn = document.getElementById('showSwapModalBtn');
    const offerGiveawayBtn = document.getElementById('offerGiveawayBtn');
    const cancelTradeOptionsBtn = document.getElementById('cancelTradeOptionsBtn');
    const swapShiftModal = document.getElementById('swapShiftModal');
    const swapShiftModalTitle = document.getElementById('swapShiftModalTitle');
    const swapShiftWithSelect = document.getElementById('swapShiftWithSelect');
    const swapShiftLoadingError = document.getElementById('swapShiftLoadingError');
    const sendSwapRequestBtn = document.getElementById('sendSwapRequestBtn');
    const cancelSwapShiftBtn = document.getElementById('cancelSwapShiftBtn');

    const prevUserAppWeekBtn = document.getElementById('prevUserAppWeekBtn');
    const currentUserAppWeekDisplay = document.getElementById('currentUserAppWeekDisplay');
    const nextUserAppWeekBtn = document.getElementById('nextUserAppWeekBtn');
    const myPastShiftsSection = document.getElementById('myPastShiftsSection');
    const prevPastPeriodBtn = document.getElementById('prevPastPeriodBtn');
    const pastShiftsViewTypeSelect = document.getElementById('pastShiftsViewTypeSelect');
    const nextPastPeriodBtn = document.getElementById('nextPastPeriodBtn');
    const myPastShiftsPeriodDisplay = document.getElementById('myPastShiftsPeriodDisplay');
    const myPastShiftsTableBody = document.getElementById('myPastShiftsTable').getElementsByTagName('tbody')[0];
    const managerUnlockModal = document.getElementById('managerUnlockModal');
    const masterManagerPasswordInput = document.getElementById('masterManagerPasswordInput');
    const unlockManagerPanelBtn = document.getElementById('unlockManagerPanelBtn');
    const cancelManagerUnlockBtn = document.getElementById('cancelManagerUnlockBtn');
    const managerUnlockError = document.getElementById('managerUnlockError');
    const managerDashboardView = document.getElementById('managerDashboardView');
    const managerLoggedInAs = document.getElementById('managerLoggedInAs');
    const switchToUserViewBtn = document.getElementById('switchToUserViewBtn');
    const managerDashboardLogoutBtn = document.getElementById('managerDashboardLogoutBtn');
    const prevWeekBtnMgr = document.getElementById('prevWeekBtnMgr');
    const jumpToTargetWeekBtnMgr = document.getElementById('jumpToTargetWeekBtnMgr');
    const nextWeekBtnMgr = document.getElementById('nextWeekBtnMgr');
    const publishWeekBtn = document.getElementById('publishWeekBtn');
    const publishStatusIndicator = document.getElementById('publishStatusIndicator');
    const clearWeekShiftsBtn = document.getElementById('clearWeekShiftsBtn');
    const showChangeMasterPassBtn = document.getElementById('showChangeMasterPassBtn');
    const changeMasterPasswordSection = document.getElementById('changeMasterPasswordSection');
    const currentMasterPasswordInput = document.getElementById('currentMasterPassword');
    const newMasterPasswordInput = document.getElementById('newMasterPassword');
    const confirmNewMasterPasswordInput = document.getElementById('confirmNewMasterPassword');
    const submitChangeMasterPassBtn = document.getElementById('submitChangeMasterPassBtn');
    const cancelChangeMasterPassBtn = document.getElementById('cancelChangeMasterPassBtn');
    const changeMasterPassError = document.getElementById('changeMasterPassError');
    const changeMasterPassSuccess = document.getElementById('changeMasterPassSuccess');
    const managerSidebarWeekDisplay = document.getElementById('managerSidebarWeekDisplay');
    const hoursViewTypeSelect = document.getElementById('hoursViewTypeSelect');
    const hoursOverviewDisplayDiv = document.getElementById('hoursOverviewDisplay');
    const resetAllDataBtn = document.getElementById('resetAllDataBtn');
    const managerSchedulePreviewTitle = document.getElementById('managerSchedulePreviewTitle');
    const managerSchedulePreviewTableBody = document.getElementById('managerSchedulePreviewTable').getElementsByTagName('tbody')[0];
    const managerCustomShiftsPreviewSection = document.getElementById('managerCustomShiftsPreviewSection');
    const managerCustomShiftsPreviewTableBody = document.getElementById('managerCustomShiftsPreviewTable')?.getElementsByTagName('tbody')[0];
    const managerApplicationWeekDisplay = document.getElementById('managerApplicationWeekDisplay');
    const managerShiftsTableBody = document.getElementById('managerShiftsTable').getElementsByTagName('tbody')[0];
    const managerCustomShiftsApplicationTableBody = document.getElementById('managerCustomShiftsApplicationTable')?.getElementsByTagName('tbody')[0];
    const standardShiftsManagementSection = document.getElementById('standardShiftsManagementSection');
    const customShiftsManagementSection = document.getElementById('customShiftsManagementSection');
    const viewStandardShiftsBtnMgr = document.getElementById('viewStandardShiftsBtnMgr');
    const viewCustomShiftsBtnMgr = document.getElementById('viewCustomShiftsBtnMgr');

    const showCoworkerManagerModalBtn = document.getElementById('showCoworkerManagerModalBtn');
    const coworkerManagementModal = document.getElementById('coworkerManagementModal');
    const closeCoworkerManagerModalBtn = document.getElementById('closeCoworkerManagerModalBtn');
    const newCoworkerNameInputModal = document.getElementById('newCoworkerNameModal');
    const newCoworkerPasswordInputModal = document.getElementById('newCoworkerPasswordModal');
    const newCoworkerIsManagerCheckboxModal = document.getElementById('newCoworkerIsManagerModal');
    const addCoworkerBtnModal = document.getElementById('addCoworkerBtnModal');
    const coworkerListDivModal = document.getElementById('coworkerListModal');

    const showHoursSummaryModalBtn = document.getElementById('showHoursSummaryModalBtn');
    const hoursSummaryModal = document.getElementById('hoursSummaryModal');
    const closeHoursSummaryModalBtn = document.getElementById('closeHoursSummaryModalBtn');
    const totalHoursPeriodSelectModal = document.getElementById('totalHoursPeriodSelectModal');
    const totalHoursSummaryTableBodyModal = document.getElementById('totalHoursSummaryTableModal').getElementsByTagName('tbody')[0];

    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertTitle = document.getElementById('customAlertTitle');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertOkBtn = document.getElementById('customAlertOkBtn');
    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmTitle = document.getElementById('customConfirmTitle');
    const customConfirmMessage = document.getElementById('customConfirmMessage');
    const customConfirmYesBtn = document.getElementById('customConfirmYesBtn');
    const customConfirmNoBtn = document.getElementById('customConfirmNoBtn');
    const customPromptModal = document.getElementById('customPromptModal');
    const customPromptTitle = document.getElementById('customPromptTitle');
    const customPromptMessage = document.getElementById('customPromptMessage');
    const customPromptInput = document.getElementById('customPromptInput');
    const customPromptOkBtn = document.getElementById('customPromptOkBtn');
    const customPromptCancelBtn = document.getElementById('customPromptCancelBtn');
    const assignEditModal = document.getElementById('assignEditModal');
    const assignEditModalTitle = document.getElementById('assignEditModalTitle');
    const assignEditCoworkerListDiv = document.getElementById('assignEditCoworkerList');
    const assignEditSaveBtn = document.getElementById('assignEditSaveBtn');
    const assignEditCancelBtn = document.getElementById('assignEditCancelBtn');
    const showCustomShiftModalBtn = document.getElementById('showCustomShiftModalBtn');
    const customShiftCreationModal = document.getElementById('customShiftCreationModal');
    const customShiftModalTitle = document.getElementById('customShiftModalTitle');
    const customShiftDateInput = document.getElementById('customShiftDateInput');
    const customShiftStartTimeInput = document.getElementById('customShiftStartTimeInput');
    const customShiftEndTimeInput = document.getElementById('customShiftEndTimeInput');
    const customShiftDescriptionInput = document.getElementById('customShiftDescriptionInput');
    const customShiftAssignCoworkerListDiv = document.getElementById('customShiftAssignCoworkerList');
    const saveCustomShiftBtn = document.getElementById('saveCustomShiftBtn');
    const cancelCustomShiftBtn = document.getElementById('cancelCustomShiftBtn');
    const myAccountBtn = document.getElementById('myAccountBtn');
    const myAccountSettingsSection = document.getElementById('myAccountSettingsSection');
    const closeMyAccountSettingsBtn = document.getElementById('closeMyAccountSettingsBtn');
    const changeMyPasswordSection = document.getElementById('changeMyPasswordSection');
    const currentMyPasswordInput = document.getElementById('currentMyPasswordInput');
    const newMyPasswordInput = document.getElementById('newMyPasswordInput');
    const confirmNewMyPasswordInput = document.getElementById('confirmNewMyPasswordInput');
    const submitMyPasswordChangeBtn = document.getElementById('submitMyPasswordChangeBtn');
    const myPasswordChangeError = document.getElementById('myPasswordChangeError');
    const myPasswordChangeSuccess = document.getElementById('myPasswordChangeSuccess');
    const manageMyEmailSection = document.getElementById('manageMyEmailSection');
    const myEmailDisplay = document.getElementById('myEmailDisplay');
    const myEmailInput = document.getElementById('myEmailInput');
    const saveMyEmailBtn = document.getElementById('saveMyEmailBtn');
    const deleteMyEmailBtn = document.getElementById('deleteMyEmailBtn');
    const myEmailError = document.getElementById('myEmailError');
    const myEmailSuccess = document.getElementById('myEmailSuccess');
    const emailPromptModal = document.getElementById('emailPromptModal');
    const emailPromptInput = document.getElementById('emailPromptInput');
    const emailPromptError = document.getElementById('emailPromptError');
    const emailPromptDontRemindCheckbox = document.getElementById('emailPromptDontRemindCheckbox');
    const emailPromptSaveBtn = document.getElementById('emailPromptSaveBtn');
    const emailPromptSkipBtn = document.getElementById('emailPromptSkipBtn');
    const sendTestEmailBtn = document.getElementById('sendTestEmailBtn');
    const testEmailStatus = document.getElementById('testEmailStatus');

    let currentConfirmResolve = null;
    let currentPromptResolve = null;

    function showAlert(message, title = "Alert") { customAlertTitle.textContent = title; customAlertMessage.textContent = message; customAlertModal.classList.remove('hidden'); customAlertModal.style.display = 'flex'; return new Promise((resolve) => { customAlertOkBtn.onclick = () => { customAlertModal.classList.add('hidden'); customAlertModal.style.display = 'none'; resolve(true); }; }); }
    function showConfirm(message, title = "Confirm") { customConfirmTitle.textContent = title; customConfirmMessage.textContent = message; customConfirmModal.classList.remove('hidden'); customConfirmModal.style.display = 'flex'; return new Promise((resolve) => { currentConfirmResolve = resolve; }); }
    function showPrompt(message, defaultValue = "", title = "Prompt") { customPromptTitle.textContent = title; customPromptMessage.textContent = message; customPromptInput.value = defaultValue; customPromptModal.classList.remove('hidden'); customPromptModal.style.display = 'flex'; customPromptInput.focus(); return new Promise((resolve) => { currentPromptResolve = resolve; }); }
    if (customAlertOkBtn) { customAlertOkBtn.addEventListener('click', () => { if (!customAlertModal.classList.contains('hidden')) { customAlertModal.classList.add('hidden'); customAlertModal.style.display = 'none'; } }); }
    if (customConfirmYesBtn) { customConfirmYesBtn.addEventListener('click', () => { customConfirmModal.classList.add('hidden'); customConfirmModal.style.display = 'none'; if (currentConfirmResolve) { currentConfirmResolve(true); currentConfirmResolve = null; } }); }
    if (customConfirmNoBtn) { customConfirmNoBtn.addEventListener('click', () => { customConfirmModal.classList.add('hidden'); customConfirmModal.style.display = 'none'; if (currentConfirmResolve) { currentConfirmResolve(false); currentConfirmResolve = null; } }); }
    if (customPromptOkBtn) { customPromptOkBtn.addEventListener('click', () => { customPromptModal.classList.add('hidden'); customPromptModal.style.display = 'none'; if (currentPromptResolve) { currentPromptResolve(customPromptInput.value); currentPromptResolve = null; } }); }
    if (customPromptCancelBtn) { customPromptCancelBtn.addEventListener('click', () => { customPromptModal.classList.add('hidden'); customPromptModal.style.display = 'none'; if (currentPromptResolve) { currentPromptResolve(null); currentPromptResolve = null; } }); }

    function getMondayOfDate(d) { d = new Date(d); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(d.setDate(diff)); monday.setHours(0,0,0,0); return monday; }
    function getNextWeekStartDate(fromDate) { const baseDate = fromDate ? new Date(fromDate) : new Date(); const monday = getMondayOfDate(baseDate); monday.setDate(monday.getDate() + 7); return monday; }
    function formatDate(dateObj, includeDayName = true) { if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return 'Invalid Date'; const dayStr = includeDayName ? `${dayNames[dateObj.getDay()]}, ` : ''; return `${dayStr}${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`; }
    function getWeekKey(dateObj) { return getMondayOfDate(dateObj).toISOString().split('T')[0]; }
    function getDateForDayInWeek(targetDayName, weekStartDate) { const monday = getMondayOfDate(new Date(weekStartDate)); const dayIndex = workDays.indexOf(targetDayName); if (dayIndex === -1) return null; const shiftSpecificDate = new Date(monday); shiftSpecificDate.setDate(monday.getDate() + dayIndex); return shiftSpecificDate.toISOString(); }
    function getStartTimeMinutes(timeStr) { if (!timeStr || typeof timeStr !== 'string') return Infinity; const parts = timeStr.split(' - ')[0].split(':'); if (parts.length === 2) { const hours = parseInt(parts[0], 10); const minutes = parseInt(parts[1], 10); if (!isNaN(hours) && !isNaN(minutes)) { return hours * 60 + minutes; } } return Infinity; }
    function sortShiftsArray(shifts) { if (!Array.isArray(shifts)) return; shifts.sort((a, b) => { const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime(); if (dateDiff !== 0) return dateDiff; return getStartTimeMinutes(a.time) - getStartTimeMinutes(b.time); }); }

    async function ensureFirebaseAnonymousAuth() { if (!auth.currentUser) { try { await auth.signInAnonymously(); } catch (error) { console.error("Critical Firebase Anonymous Auth Error on initial ensure:", error); if(initialLoginViewWrapper && !initialLoginViewWrapper.classList.contains('hidden')){ initialLoginError.textContent = "Critical error: Could not establish secure session.";} else { await showAlert("Critical error: Could not establish secure session.");} throw error;}}}

    async function sendEmailNotification(recipientEmail, subject, htmlBody, textBody) {
        console.log("sendEmailNotification aufgerufen mit Empfänger:", recipientEmail, "Betreff:", subject);
        if (!db) {
            console.error("FEHLER in sendEmailNotification: Firestore DB (db) ist nicht initialisiert. Kann keine E-Mail senden.");
            return;
        }
        try {
            console.log("Versuche, Dokument zur 'mail'-Collection hinzuzufügen für:", recipientEmail);
            await db.collection('mail').add({
                to: [recipientEmail],
                message: {
                    subject: subject,
                    html: htmlBody,
                    text: textBody
                }
            });
            console.log(`E-Mail-Dokument für ${recipientEmail} erfolgreich zur 'mail'-Collection hinzugefügt.`);
        } catch (error) {
            console.error("FEHLER beim Hinzufügen des E-Mail-Dokuments zur Collection in sendEmailNotification:", error);
        }
    }

    async function initializeApp() {
        try {
            await ensureFirebaseAnonymousAuth();
            await loadMasterPassword();
            currentViewingDateMgr = getNextWeekStartDate();
            currentPastShiftViewDate = getMondayOfDate(new Date());
            currentUserApplicationViewingDate = getNextWeekStartDate();
            await initializeCoworkers();
            populateLoginUserDropdown();
            await checkActiveSession();
        } catch (error) {
            console.error("Error during app initialization:", error);
            if(initialLoginError && typeof initialLoginError.textContent !== 'undefined') {
                initialLoginError.textContent = "Failed to initialize. Check console, or refresh.";
            }
        }
    }

    async function loadMasterPassword() { try { const configRef = db.collection('config').doc('adminConfig'); let doc; try { doc = await configRef.get(); } catch (readError) { console.warn("Reading adminConfig failed (expected if rules are 'allow read: if false;'). Using default master password."); } if (doc && doc.exists && doc.data().masterAdminPassword) { currentMasterPassword = doc.data().masterAdminPassword; } else { console.warn("Admin config or master password not found or not readable. Using default and attempting to save (if rules permit)."); currentMasterPassword = DEFAULT_MASTER_PASSWORD; try { await configRef.set({ masterAdminPassword: DEFAULT_MASTER_PASSWORD }, { merge: true }); console.log("Default master password written/updated in Firestore config."); } catch (setConfigError) { console.error("Could not save default master password to Firestore (check rules for config/adminConfig create/update):", setConfigError); } } } catch (error) { console.error("Error in loadMasterPassword logic:", error); currentMasterPassword = DEFAULT_MASTER_PASSWORD; } }
    async function getWeekData(weekStartDate) { const weekKey = getWeekKey(weekStartDate); if (allShiftsData[weekKey]) { if (allShiftsData[weekKey] && Array.isArray(allShiftsData[weekKey].shifts) && typeof allShiftsData[weekKey].isPublished === 'boolean') { sortShiftsArray(allShiftsData[weekKey].shifts); return JSON.parse(JSON.stringify(allShiftsData[weekKey])); } else { delete allShiftsData[weekKey]; } } const weekDocRef = db.collection('shifts').doc(weekKey); try { const doc = await weekDocRef.get(); if (doc.exists) { let data = doc.data(); if (typeof data !== 'object' || data === null) data = {}; if (!Array.isArray(data.shifts)) { data.shifts = []; } if (typeof data.isPublished !== 'boolean') { data.isPublished = false; } data.shifts.forEach(s => { if (s && !Array.isArray(s.applicants)) s.applicants = []; if (s && !Array.isArray(s.assignedCoworkers)) s.assignedCoworkers = []; if (s && !s.description && standardShiftTimes.includes(s.time) && !isCustomTimeShift(s.time) ) { s.description = "Normal Shift"; } }); sortShiftsArray(data.shifts); allShiftsData[weekKey] = JSON.parse(JSON.stringify(data)); return data; } else { const newWeekShifts = []; let idCounter = Date.now(); for (let i = 0; i < workDays.length; i++) { const dayName = workDays[i]; const currentShiftDate = new Date(weekStartDate); currentShiftDate.setDate(weekStartDate.getDate() + i); standardShiftTimes.forEach(time => { newWeekShifts.push({ id: `${weekKey}-${idCounter++}`, day: dayName, date: currentShiftDate.toISOString(), time: time, status: "available", applicants: [], applicantName: "", description: "Normal Shift", assignedCoworkers: [] }); }); } const newWeekData = { shifts: newWeekShifts, isPublished: false }; sortShiftsArray(newWeekData.shifts); await weekDocRef.set(newWeekData); allShiftsData[weekKey] = JSON.parse(JSON.stringify(newWeekData)); return newWeekData; } } catch (error) { console.error(`Error getting week data for ${weekKey}:`, error); const fallbackData = { shifts: [], isPublished: false, error: true, errorMessage: error.message }; allShiftsData[weekKey] = JSON.parse(JSON.stringify(fallbackData)); return fallbackData; } }
    async function getShiftsForWeek(weekStartDate) { const weekData = await getWeekData(weekStartDate); return weekData; }

    async function initializeCoworkers() {
        try {
            const snapshot = await db.collection('coworkers').get();
            if (snapshot.empty) {
                coworkers = [
                    { name: "Ties", password: "1234", isManager: true, email: "", emailReminderDisabled: false },
                    { name: "Joep", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Jesper", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Inti", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Martijn", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Mathijs", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Dominik", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Jippe", password: "1234", isManager: false, email: "", emailReminderDisabled: false },
                    { name: "Zeynep", password: "1234", isManager: false, email: "", emailReminderDisabled: false }
                ];
                const batch = db.batch();
                coworkers.forEach(cw => {
                    const docRef = db.collection('coworkers').doc(cw.name);
                    batch.set(docRef, cw);
                });
                await batch.commit();
            } else {
                coworkers = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        email: data.email || "",
                        emailReminderDisabled: data.emailReminderDisabled || false
                    };
                });
            }
        } catch (error) {
            console.error("Error initializing coworkers:", error);
            coworkers = [];
            throw error;
        }
    }

    function showCorrectView() {
        [initialLoginViewWrapper, userShiftViewWrapper, managerDashboardView, managerUnlockModal, changeMasterPasswordSection, myPastShiftsSection, customAlertModal, customConfirmModal, customPromptModal, assignEditModal, customShiftCreationModal, userCustomShiftsSection, userLatestCustomShiftsSection, myAccountSettingsSection, emailPromptModal, myUpcomingShiftsSection, shiftTradeRequestsSection, tradeOptionsModal, swapShiftModal, coworkerManagementModal, hoursSummaryModal].forEach(v => {
            if (v) v.classList.add('hidden');
        });

        if (isManagerModeActive && loggedInCoworker && loggedInCoworker.isManager) {
            managerDashboardView.classList.remove('hidden');
            managerLoggedInAs.textContent = `Logged in as: ${loggedInCoworker.name}`;
            refreshManagerDashboard();
        } else if (loggedInCoworker) {
            userShiftViewWrapper.classList.remove('hidden');
            prepareUserView();
            checkAndShowEmailPrompt();
        } else {
            initialLoginViewWrapper.classList.remove('hidden');
        }
    }

    async function checkActiveSession() { const activeUserJSON = localStorage.getItem(ACTIVE_SESSION_USER_KEY); if (activeUserJSON) { const activeUser = JSON.parse(activeUserJSON); const foundCoworker = coworkers.find(c => c.name === activeUser.name); if (foundCoworker && activeUser.password === foundCoworker.password) { try { await ensureFirebaseAnonymousAuth(); loggedInCoworker = foundCoworker; } catch (error) { logout(); return; } } else { logout(); return; } } showCorrectView(); }
    function populateLoginUserDropdown() { loginUserSelect.innerHTML = '<option value="">-- Select Name --</option>'; coworkers.sort((a, b) => a.name.localeCompare(b.name)).forEach(coworker => { const option = document.createElement('option'); option.value = coworker.name; option.textContent = coworker.name; loginUserSelect.appendChild(option); }); }

    async function handleCoworkerLogin() {
        const selectedName = loginUserSelect.value;
        const password = loginPasswordInput.value;
        initialLoginError.textContent = "";
        if (!selectedName || !password) {
            initialLoginError.textContent = "Name and password are required.";
            return;
        }
        const coworker = coworkers.find(c => c.name === selectedName);
        if (coworker && coworker.password === password) {
            try {
                await ensureFirebaseAnonymousAuth();
                loggedInCoworker = coworker;
                const freshCoworkerData = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                if (freshCoworkerData) {
                    loggedInCoworker.email = freshCoworkerData.email || "";
                    loggedInCoworker.emailReminderDisabled = freshCoworkerData.emailReminderDisabled || false;
                }

                localStorage.setItem(ACTIVE_SESSION_USER_KEY, JSON.stringify({name: coworker.name, password: coworker.password}));
                loginPasswordInput.value = "";
                isManagerModeActive = false;
                currentUserApplicationViewingDate = getNextWeekStartDate();
                showCorrectView();
            } catch (error) {
                console.error("Firebase Anonymous Auth Error:", error);
                initialLoginError.textContent = "Login failed. Auth session error.";
            }
        } else {
            initialLoginError.textContent = "Invalid name or password.";
            loginPasswordInput.value = "";
        }
    }

    function handleAccessManagerPanel() { if (loggedInCoworker && loggedInCoworker.isManager) { managerUnlockModal.classList.remove('hidden'); masterManagerPasswordInput.value = ""; managerUnlockError.textContent = ""; masterManagerPasswordInput.focus(); } }
    function handleUnlockManagerPanel() { if (masterManagerPasswordInput.value === currentMasterPassword) { isManagerModeActive = true; managerUnlockModal.classList.add('hidden'); showCorrectView(); } else { managerUnlockError.textContent = "Incorrect Master Password."; } }
    function logout() { if (auth.currentUser) { auth.signOut().catch((error) => { console.error("Error signing out from Firebase Auth:", error); });} loggedInCoworker = null; isManagerModeActive = false; localStorage.removeItem(ACTIVE_SESSION_USER_KEY); loginPasswordInput.value = ""; masterManagerPasswordInput.value = ""; initialLoginError.textContent = ""; managerUnlockError.textContent = ""; if (changeMasterPasswordSection) changeMasterPasswordSection.classList.add('hidden'); showCorrectView(); }

    async function prepareUserView() {
        if (!loggedInCoworker) return;
        welcomeUserName.textContent = `Welcome, ${loggedInCoworker.name}!`;
        accessManagerPanelBtn.classList.toggle('hidden', !loggedInCoworker.isManager);

        myAccountSettingsSection.classList.add('hidden');
        userShiftView.classList.remove('hidden');

        await renderTradeRequests();
        await renderMyUpcomingShifts();

        if (myPastShiftsSection) {
            myPastShiftsSection.classList.remove('hidden');
            await renderMyPastShifts();
        }

        try {
            const querySnapshot = await db.collection('shifts').where('isPublished', '==', true).orderBy(firebase.firestore.FieldPath.documentId(), 'desc').limit(1).get();
            if (!querySnapshot.empty) {
                const latestPublishedWeekKey = querySnapshot.docs[0].id;
                const weekDocRef = db.collection('shifts').doc(latestPublishedWeekKey);
                const doc = await weekDocRef.get();
                if (doc.exists) {
                    const latestPublishedWeekData = doc.data();
                    if (latestPublishedWeekData.shifts) {
                        latestPublishedScheduleTitle.textContent = `Latest Published Schedule: Week of ${formatDate(new Date(latestPublishedWeekKey), false)}`;
                        renderUserPublishedSchedule(latestPublishedWeekData.shifts, latestPublishedScheduleTableBody);
                        renderLatestCustomShiftsForUser(latestPublishedWeekData.shifts);
                        latestPublishedScheduleSection.classList.remove('hidden');
                    } else {
                        latestPublishedScheduleSection.classList.add('hidden');
                        if(userLatestCustomShiftsSection) userLatestCustomShiftsSection.classList.add('hidden');
                    }
                } else {
                     latestPublishedScheduleSection.classList.add('hidden');
                     if(userLatestCustomShiftsSection) userLatestCustomShiftsSection.classList.add('hidden');
                }
            } else {
                latestPublishedScheduleSection.classList.add('hidden');
                if(userLatestCustomShiftsSection) userLatestCustomShiftsSection.classList.add('hidden');
            }

            if (!currentUserApplicationViewingDate) {
                currentUserApplicationViewingDate = getNextWeekStartDate();
            }
            await renderCurrentUserApplicationWeek();
        } catch (error) {
            console.error("Error preparing user view (outer try-catch):", error);
            if(currentUserAppWeekDisplay) currentUserAppWeekDisplay.textContent = "Error loading shifts.";
            if(latestPublishedScheduleSection) latestPublishedScheduleSection.classList.add('hidden');
            if(userLatestCustomShiftsSection) userLatestCustomShiftsSection.classList.add('hidden');
        }
    }

    async function renderMyUpcomingShifts() {
        if (!loggedInCoworker || !myUpcomingShiftsTableBody) return;

        myUpcomingShiftsTableBody.innerHTML = '<tr><td colspan="4">Loading your shifts...</td></tr>';
        const now = new Date();

        try {
            const querySnapshot = await db.collection('shifts').get();
            let upcomingShifts = [];

            querySnapshot.forEach(weekDoc => {
                const weekKey = weekDoc.id;
                const weekData = weekDoc.data();
                if (weekData && weekData.shifts) {
                    const userShiftsThisWeek = weekData.shifts.filter(shift =>
                        shift.status === 'approved' &&
                        Array.isArray(shift.assignedCoworkers) &&
                        shift.assignedCoworkers.includes(loggedInCoworker.name)
                    );

                    userShiftsThisWeek.forEach(shift => {
                        let shiftStartTime = new Date(shift.date);
                        try {
                            const timeParts = shift.time.split(' - ')[0].split(':');
                            shiftStartTime.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
                            if (shiftStartTime > now) {
                                upcomingShifts.push({ ...shift, weekKey: weekKey });
                            }
                        } catch (e) {
                            console.warn("Could not parse start time for shift:", shift.id);
                        }
                    });
                }
            });

            sortShiftsArray(upcomingShifts);
            myUpcomingShiftsTableBody.innerHTML = '';

            if (upcomingShifts.length > 0) {
                myUpcomingShiftsSection.classList.remove('hidden');
                const shiftsInPendingTrades = pendingTradesCache.map(trade => trade.requesterShiftId);

                upcomingShifts.forEach(shift => {
                    const row = myUpcomingShiftsTableBody.insertRow();
                    row.insertCell().textContent = shift.day;
                    row.insertCell().textContent = formatDate(new Date(shift.date), false);

                    const timeCell = row.insertCell();
                    timeCell.textContent = shift.time;
                    if (shift.description && shift.description !== "Normal Shift") {
                        const descSpan = document.createElement('span');
                        descSpan.classList.add('shift-description-display');
                        descSpan.textContent = shift.description;
                        timeCell.appendChild(descSpan);
                    }

                    const actionCell = row.insertCell();
                    actionCell.classList.add("action-cell");

                    const isStandardShift = standardShiftTimes.includes(shift.time);

                    if (shiftsInPendingTrades.includes(shift.id)) {
                        const statusSpan = document.createElement('span');
                        statusSpan.textContent = 'Trade Pending...';
                        statusSpan.style.fontStyle = 'italic';
                        actionCell.appendChild(statusSpan);
                    } else if (isStandardShift) {
                        const tradeBtn = document.createElement('button');
                        tradeBtn.textContent = 'Trade Shift';
                        tradeBtn.classList.add('secondary', 'small-action');
                        tradeBtn.onclick = () => showTradeOptions(shift);
                        actionCell.appendChild(tradeBtn);
                    } else {
                        actionCell.textContent = '---';
                    }
                });
            } else {
                myUpcomingShiftsSection.classList.add('hidden');
            }

        } catch (error) {
            console.error("Error fetching upcoming shifts:", error);
            myUpcomingShiftsTableBody.innerHTML = '<tr><td colspan="4" class="error-message">Could not load your shifts.</td></tr>';
            myUpcomingShiftsSection.classList.remove('hidden');
        }
    }

    async function renderTradeRequests() {
        if (!loggedInCoworker || !tradeRequestsList) return;

        tradeRequestsList.innerHTML = `<p style="font-style:italic; color:#777;">Loading requests...</p>`;

        try {
            const myRequestsQuery = db.collection('shiftTrades')
                .where('requesterId', '==', loggedInCoworker.id)
                .where('status', '==', 'pending')
                .get();

            const incomingSwapsQuery = db.collection('shiftTrades')
                .where('responderId', '==', loggedInCoworker.id)
                .where('status', '==', 'pending')
                .get();

            const openGiveawaysQuery = db.collection('shiftTrades')
                .where('type', '==', 'giveaway')
                .where('status', '==', 'pending')
                .get();

            const [myRequestsSnapshot, incomingSwapsSnapshot, openGiveawaysSnapshot] = await Promise.all([myRequestsQuery, incomingSwapsQuery, openGiveawaysQuery]);

            const allTrades = [];
            pendingTradesCache = [];

            myRequestsSnapshot.forEach(doc => {
                const trade = { id: doc.id, ...doc.data(), origin: 'outgoing' };
                allTrades.push(trade);
                pendingTradesCache.push(trade);
            });
            incomingSwapsSnapshot.forEach(doc => allTrades.push({ id: doc.id, ...doc.data(), origin: 'incoming' }));
            openGiveawaysSnapshot.forEach(doc => {
                const trade = { id: doc.id, ...doc.data(), origin: 'giveaway' };
                if (trade.requesterId !== loggedInCoworker.id) {
                    allTrades.push(trade);
                }
            });

            if (allTrades.length === 0) {
                tradeRequestsList.innerHTML = `<p style="font-style:italic; color:#777;">You have no pending trade requests.</p>`;
                shiftTradeRequestsSection.classList.add('hidden');
                return;
            }

            tradeRequestsList.innerHTML = '';
            shiftTradeRequestsSection.classList.remove('hidden');

            allTrades.forEach(trade => {
                const tradeDiv = document.createElement('div');
                tradeDiv.style.borderBottom = '1px solid #eee';
                tradeDiv.style.padding = '10px 0';

                const textP = document.createElement('p');
                textP.style.margin = '0 0 10px 0';

                const actionDiv = document.createElement('div');
                actionDiv.style.textAlign = 'right';

                const myShiftDetails = `${trade.requesterShift.day}, ${trade.requesterShift.time}`;

                if (trade.origin === 'outgoing') {
                    if (trade.type === 'swap') {
                        textP.innerHTML = `Your swap request to <strong>${trade.responderName}</strong> for their ${trade.responderShift.day}, ${trade.responderShift.time} shift is pending.`;
                    } else {
                        textP.innerHTML = `You have offered your <strong>${myShiftDetails}</strong> shift as a giveaway.`;
                    }
                    const cancelBtn = document.createElement('button');
                    cancelBtn.textContent = 'Cancel Request';
                    cancelBtn.classList.add('deny', 'small-action');
                    cancelBtn.onclick = () => handleDenyOrCancelTrade(trade.id, 'cancelled');
                    actionDiv.appendChild(cancelBtn);

                } else if (trade.origin === 'incoming') {
                    const theirShiftDetails = `${trade.responderShift.day}, ${trade.responderShift.time}`;
                    textP.innerHTML = `<strong>${trade.requesterName}</strong> wants to swap their <strong>${myShiftDetails}</strong> shift for your <strong>${theirShiftDetails}</strong> shift.`;

                    const approveBtn = document.createElement('button');
                    approveBtn.textContent = 'Approve';
                    approveBtn.classList.add('approve', 'small-action');
                    approveBtn.onclick = () => handleApproveSwap(trade.id);
                    actionDiv.appendChild(approveBtn);

                    const denyBtn = document.createElement('button');
                    denyBtn.textContent = 'Deny';
                    denyBtn.classList.add('deny', 'small-action');
                    denyBtn.onclick = () => handleDenyOrCancelTrade(trade.id, 'denied');
                    actionDiv.appendChild(denyBtn);

                } else {
                    textP.innerHTML = `<strong>${trade.requesterName}</strong> is offering their <strong>${myShiftDetails}</strong> shift.`;
                    const claimBtn = document.createElement('button');
                    claimBtn.textContent = 'Claim Shift';
                    claimBtn.classList.add('assign', 'small-action');
                    claimBtn.onclick = () => handleClaimGiveaway(trade.id);
                    actionDiv.appendChild(claimBtn);
                }

                tradeDiv.appendChild(textP);
                tradeDiv.appendChild(actionDiv);
                tradeRequestsList.appendChild(tradeDiv);
            });
        } catch (error) {
            console.error("Error fetching trade requests:", error);
            tradeRequestsList.innerHTML = `<p class="error-message">Could not load trade requests.</p>`;
        }
    }

    function showTradeOptions(shiftObject) {
        if (!shiftObject) {
            showAlert("Error: Could not find the shift to trade.");
            return;
        }
        currentShiftToTrade = shiftObject;

        tradeOptionsModalTitle.textContent = `Trade Your Shift: ${shiftObject.day}, ${shiftObject.time}`;
        tradeOptionsModal.classList.remove('hidden');
        tradeOptionsModal.style.display = 'flex';
    }

    async function handleShowSwapModal() {
        if (!currentShiftToTrade) return;
        tradeOptionsModal.classList.add('hidden');

        swapShiftModalTitle.textContent = `Swap: ${currentShiftToTrade.day}, ${currentShiftToTrade.time}`;
        swapShiftModal.classList.remove('hidden');
        swapShiftModal.style.display = 'flex';

        await populateSwapDropdown();
    }

    async function populateSwapDropdown() {
        swapShiftWithSelect.innerHTML = '<option value="">Loading available shifts...</option>';
        swapShiftWithSelect.disabled = true;
        sendSwapRequestBtn.disabled = true;
        swapShiftLoadingError.textContent = '';
        const now = new Date();

        try {
            const querySnapshot = await db.collection('shifts').get();
            let swappableShifts = [];

            const myPendingTradeShiftIds = pendingTradesCache
                .filter(t => t.requesterId === loggedInCoworker.id)
                .map(t => t.responderShiftId);

            querySnapshot.forEach(weekDoc => {
                const weekKey = weekDoc.id;
                const weekData = weekDoc.data();
                if (weekData && weekData.shifts) {
                    weekData.shifts.forEach(shift => {
                        const isStandardShift = standardShiftTimes.includes(shift.time);

                        if (shift.status === 'approved' &&
                            isStandardShift &&
                            Array.isArray(shift.assignedCoworkers) &&
                            !shift.assignedCoworkers.includes(loggedInCoworker.name) &&
                            shift.assignedCoworkers.length > 0 &&
                            !myPendingTradeShiftIds.includes(shift.id)) {

                            let shiftStartTime = new Date(shift.date);
                            try {
                                const timeParts = shift.time.split(' - ')[0].split(':');
                                shiftStartTime.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
                                if (shiftStartTime > now) {
                                    swappableShifts.push({ ...shift, weekKey: weekKey });
                                }
                            } catch (e) {
                                console.warn("Could not parse start time for swap dropdown:", shift.time, e);
                            }
                        }
                    });
                }
            });

            sortShiftsArray(swappableShifts);
            swapShiftWithSelect.innerHTML = '';

            if (swappableShifts.length === 0) {
                swapShiftLoadingError.textContent = 'No available shifts found to swap with.';
                const noShiftOption = document.createElement('option');
                noShiftOption.textContent = "No standard shifts available";
                noShiftOption.value = "";
                swapShiftWithSelect.appendChild(noShiftOption);
                return;
            }

            swapShiftWithSelect.innerHTML = '<option value="">-- Select a shift --</option>';
            swappableShifts.forEach(shift => {
                const option = document.createElement('option');
                const shiftOwner = shift.assignedCoworkers.join(', ');
                option.value = JSON.stringify({
                    id: shift.id,
                    weekKey: shift.weekKey,
                    ownerName: shiftOwner,
                    ownerId: coworkers.find(c => c.name === shiftOwner)?.id
                });
                option.textContent = `${shiftOwner} - ${shift.day}, ${formatDate(new Date(shift.date), false)} (${shift.time})`;
                swapShiftWithSelect.appendChild(option);
            });

            swapShiftWithSelect.disabled = false;
            sendSwapRequestBtn.disabled = false;

        } catch (error) {
            console.error("Error populating swap dropdown:", error);
            swapShiftLoadingError.textContent = 'Error loading shifts.';
        }
    }

    async function handleOfferGiveaway() {
        if (!currentShiftToTrade) return;
        tradeOptionsModal.classList.add('hidden');

        const confirmGiveaway = await showConfirm(
            `Are you sure you want to offer your shift for giveaway?\n\n(${currentShiftToTrade.day}, ${currentShiftToTrade.time})\n\nYou will remain responsible for this shift until another coworker claims it.`,
            "Confirm Giveaway"
        );

        if (confirmGiveaway) {
            const tradeRequest = {
                type: 'giveaway',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                requesterId: loggedInCoworker.id,
                requesterName: loggedInCoworker.name,
                requesterShiftId: currentShiftToTrade.id,
                requesterWeekKey: currentShiftToTrade.weekKey,
                requesterShift: {
                    day: currentShiftToTrade.day,
                    date: currentShiftToTrade.date,
                    time: currentShiftToTrade.time
                }
            };
            try {
                await db.collection('shiftTrades').add(tradeRequest);
                await showAlert("Success!", "Your giveaway request has been posted.");
                await prepareUserView();
            } catch (error) {
                console.error("Error creating giveaway request:", error);
                await showAlert("Error", "Could not create the giveaway request.");
            }
        }
    }

    async function handleSendSwapRequest() {
        if (!currentShiftToTrade || !swapShiftWithSelect.value) {
            await showAlert("Please select a shift to swap with.");
            return;
        }

        const targetInfo = JSON.parse(swapShiftWithSelect.value);
        let targetShift = allShiftsData[targetInfo.weekKey] ? allShiftsData[targetInfo.weekKey].shifts.find(s => s.id === targetInfo.id) : null;

        if (!targetShift) {
            const weekDoc = await db.collection('shifts').doc(targetInfo.weekKey).get();
            if (weekDoc.exists) {
                const freshWeekData = weekDoc.data();
                allShiftsData[targetInfo.weekKey] = freshWeekData;
                targetShift = freshWeekData.shifts.find(s => s.id === targetInfo.id);
                if (!targetShift) {
                    await showAlert("Error: The selected shift could not be found even after refresh. Please try again.");
                    return;
                }
            } else {
                 await showAlert("Error: The week for the selected shift could not be found. Please try again.");
                 return;
            }
        }

        const tradeRequest = {
            type: 'swap',
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            requesterId: loggedInCoworker.id,
            requesterName: loggedInCoworker.name,
            requesterShiftId: currentShiftToTrade.id,
            requesterWeekKey: currentShiftToTrade.weekKey,
            requesterShift: {
                day: currentShiftToTrade.day,
                date: currentShiftToTrade.date,
                time: currentShiftToTrade.time
            },
            responderId: targetInfo.ownerId,
            responderName: targetInfo.ownerName,
            responderShiftId: targetInfo.id,
            responderWeekKey: targetInfo.weekKey,
            responderShift: {
                day: targetShift.day,
                date: targetShift.date,
                time: targetShift.time
            }
        };

        try {
            await db.collection('shiftTrades').add(tradeRequest);
            swapShiftModal.classList.add('hidden');
            swapShiftModal.style.display = 'none';
            currentShiftToTrade = null;
            await showAlert("Success!", "Your swap request has been sent.");
            await prepareUserView();
        } catch (error) {
            console.error("Error creating swap request:", error);
            await showAlert("Error", "Could not create the swap request.");
        }
    }

    async function handleDenyOrCancelTrade(tradeId, newStatus) {
        const confirmAction = await showConfirm(`Are you sure you want to ${newStatus === 'denied' ? 'deny' : 'cancel'} this request?`);
        if (!confirmAction) return;

        try {
            await db.collection('shiftTrades').doc(tradeId).update({
                status: newStatus,
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await showAlert("Request Updated", `The trade request has been ${newStatus}.`);
            await prepareUserView();
        } catch (error) {
            console.error(`Error updating trade to ${newStatus}:`, error);
            await showAlert("Error", "Could not update the trade request.");
        }
    }

    async function handleApproveSwap(tradeId) {
        try {
            await db.runTransaction(async (transaction) => {
                const tradeRef = db.collection('shiftTrades').doc(tradeId);
                const tradeDoc = await transaction.get(tradeRef);
                if (!tradeDoc.exists || tradeDoc.data().status !== 'pending') {
                    throw new Error("This trade request is no longer valid.");
                }
                const tradeData = tradeDoc.data();

                const requesterWeekRef = db.collection('shifts').doc(tradeData.requesterWeekKey);
                const responderWeekRef = db.collection('shifts').doc(tradeData.responderWeekKey);

                const requesterWeekDoc = await transaction.get(requesterWeekRef);
                const responderWeekDoc = tradeData.requesterWeekKey === tradeData.responderWeekKey
                    ? requesterWeekDoc
                    : await transaction.get(responderWeekRef);

                if (!requesterWeekDoc.exists || !responderWeekDoc.exists) {
                    throw new Error("One of the shift weeks could not be found.");
                }

                const requesterWeekData = requesterWeekDoc.data();
                const responderWeekData = responderWeekDoc.data();

                const reqShiftIndex = requesterWeekData.shifts.findIndex(s => s.id === tradeData.requesterShiftId);
                const resShiftIndex = responderWeekData.shifts.findIndex(s => s.id === tradeData.responderShiftId);

                if (reqShiftIndex === -1 || resShiftIndex === -1) {
                    throw new Error("One of the shifts to be swapped could not be found.");
                }

                const requesterOriginalAssignees = requesterWeekData.shifts[reqShiftIndex].assignedCoworkers;
                const responderOriginalAssignees = responderWeekData.shifts[resShiftIndex].assignedCoworkers;

                requesterWeekData.shifts[reqShiftIndex].assignedCoworkers = responderOriginalAssignees;
                responderWeekData.shifts[resShiftIndex].assignedCoworkers = requesterOriginalAssignees;

                transaction.update(requesterWeekRef, { shifts: requesterWeekData.shifts });
                if (tradeData.requesterWeekKey !== tradeData.responderWeekKey) {
                    transaction.update(responderWeekRef, { shifts: responderWeekData.shifts });
                }

                transaction.update(tradeRef, {
                    status: 'completed',
                    resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                allShiftsData[tradeData.requesterWeekKey] = requesterWeekData;
                allShiftsData[tradeData.responderWeekKey] = responderWeekData;
            });

            await showAlert("Swap Approved!", "The shifts have been successfully swapped.");
            await prepareUserView();

        } catch (error) {
            console.error("Error approving swap:", error);
            await showAlert("Swap Failed", error.message || "An unexpected error occurred during the swap.");
            await prepareUserView();
        }
    }

    async function handleClaimGiveaway(tradeId) {
         try {
            await db.runTransaction(async (transaction) => {
                const tradeRef = db.collection('shiftTrades').doc(tradeId);
                const tradeDoc = await transaction.get(tradeRef);
                if (!tradeDoc.exists || tradeDoc.data().status !== 'pending' || tradeDoc.data().type !== 'giveaway') {
                    throw new Error("This giveaway is no longer available.");
                }
                const tradeData = tradeDoc.data();

                const shiftWeekRef = db.collection('shifts').doc(tradeData.requesterWeekKey);
                const shiftWeekDoc = await transaction.get(shiftWeekRef);

                if (!shiftWeekDoc.exists) {
                    throw new Error("The shift's week could not be found.");
                }

                const weekData = shiftWeekDoc.data();
                const shiftIndex = weekData.shifts.findIndex(s => s.id === tradeData.requesterShiftId);

                if (shiftIndex === -1) {
                    throw new Error("The shift to be claimed could not be found.");
                }

                weekData.shifts[shiftIndex].assignedCoworkers = [loggedInCoworker.name];

                transaction.update(shiftWeekRef, { shifts: weekData.shifts });

                transaction.update(tradeRef, {
                    status: 'completed',
                    resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    claimedById: loggedInCoworker.id,
                    claimedByName: loggedInCoworker.name
                });

                allShiftsData[tradeData.requesterWeekKey] = weekData;
            });

            await showAlert("Shift Claimed!", "The shift has been successfully assigned to you.");
            await prepareUserView();

        } catch (error) {
            console.error("Error claiming giveaway:", error);
            await showAlert("Claim Failed", error.message || "An unexpected error occurred while claiming the shift.");
            await prepareUserView();
        }
    }

    async function renderCurrentUserApplicationWeek() {
        if (!loggedInCoworker || !currentUserApplicationViewingDate) return;
        const earliestAllowedAppDate = getMondayOfDate(new Date());
        const defaultUserViewDate = getNextWeekStartDate();
        const lastAllowedAppDate = new Date(defaultUserViewDate);
        lastAllowedAppDate.setDate(defaultUserViewDate.getDate() + (USER_APPLICATION_WEEKS_FORWARD * 7));

        if (currentUserAppWeekDisplay) {
            currentUserAppWeekDisplay.textContent = `Application Week: ${formatDate(currentUserApplicationViewingDate, false)}`;
        }

        const weekData = await getWeekData(currentUserApplicationViewingDate);
        if (weekData.error) {
            if(userShiftsTableBody) userShiftsTableBody.innerHTML = '<tr><td colspan="5">Error loading shifts.</td></tr>';
            if(userCustomShiftsTableBody) userCustomShiftsTableBody.innerHTML = '<tr><td colspan="5">Error loading custom shifts.</td></tr>';
        } else if (weekData.shifts) {
            sortShiftsArray(weekData.shifts);
            renderUserShifts(weekData.shifts, currentUserApplicationViewingDate);
        } else {
            if(userShiftsTableBody) userShiftsTableBody.innerHTML = '<tr><td colspan="5">No standard shifts available for this week.</td></tr>';
            if(userCustomShiftsTableBody) userCustomShiftsTableBody.innerHTML = '<tr><td colspan="5">No custom shifts available for this week.</td></tr>';
            if(userCustomShiftsSection) userCustomShiftsSection.classList.add('hidden');
        }

        if (prevUserAppWeekBtn) {
            prevUserAppWeekBtn.disabled = getMondayOfDate(new Date(currentUserApplicationViewingDate)).getTime() <= earliestAllowedAppDate.getTime();
        }
        if (nextUserAppWeekBtn) {
            nextUserAppWeekBtn.disabled = getMondayOfDate(new Date(currentUserApplicationViewingDate)).getTime() >= getMondayOfDate(new Date(lastAllowedAppDate)).getTime();
        }
    }


    function renderUserShifts(shiftsForWeek, forWeekDate) {
        const userStandardShiftsTableBody = document.getElementById('userShiftsTable').getElementsByTagName('tbody')[0];
        const userCustomShiftsTableBody = document.getElementById('userCustomShiftsTable')?.getElementsByTagName('tbody')[0];

        userStandardShiftsTableBody.innerHTML = "";
        if (userCustomShiftsTableBody) userCustomShiftsTableBody.innerHTML = "";

        if (!shiftsForWeek || !Array.isArray(shiftsForWeek) || !loggedInCoworker) {
            userStandardShiftsTableBody.innerHTML = `<tr><td colspan="5">Error: Could not load shifts or user not logged in.</td></tr>`;
            return;
        }

        let hasCustomShiftsForApplicationWeek = false;
        shiftsForWeek.forEach(shift => {
            const isStandard = standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time);
            const targetTableBody = isStandard ? userStandardShiftsTableBody : userCustomShiftsTableBody;

            if (!targetTableBody && !isStandard) {
                console.warn("Custom shifts table body for applications not found, skipping custom shift display for user.");
                return;
            }
            if (!isStandard) hasCustomShiftsForApplicationWeek = true;

            const row = targetTableBody.insertRow();
            row.insertCell().textContent = shift.day;
            row.insertCell().textContent = formatDate(new Date(shift.date), false);
            const timeCell = row.insertCell();
            timeCell.textContent = shift.time;

            const effectiveDescription = (!shift.description && isStandard) ? "Normal Shift" : shift.description;
            if (effectiveDescription && effectiveDescription !== "Normal Shift") {
                const descSpan = document.createElement('span');
                descSpan.classList.add('shift-description-display');
                descSpan.textContent = effectiveDescription;
                timeCell.appendChild(descSpan);
            }

            const statusCell = row.insertCell();
            const actionCell = row.insertCell();
            actionCell.classList.add("action-cell");

            const isMyAppPending = shift.status === 'pending' && Array.isArray(shift.applicants) && shift.applicants.includes(loggedInCoworker.name);
            const isApprovedForMe = shift.status === 'approved' && Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.includes(loggedInCoworker.name);
            const isApprovedForSomeoneElse = shift.status === 'approved' && Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.length > 0 && !shift.assignedCoworkers.includes(loggedInCoworker.name);

            let canIStillApply = false;
            if (shift.status === 'available') {
                canIStillApply = true;
            } else if (shift.status === 'pending' && !isMyAppPending && !isApprovedForMe && !isApprovedForSomeoneElse) {
                canIStillApply = true;
            }

            if (isApprovedForMe) {
                statusCell.textContent = "Approved"; statusCell.className = 'status-approved'; actionCell.textContent = "---";
            } else if (isMyAppPending) {
                statusCell.textContent = "Pending"; statusCell.className = 'status-pending';
                const cancelBtn = document.createElement('button'); cancelBtn.textContent = "Cancel App"; cancelBtn.classList.add("deny", "small-action");
                cancelBtn.onclick = () => cancelApplication(shift.id, getWeekKey(forWeekDate)); actionCell.appendChild(cancelBtn);
            } else if (isApprovedForSomeoneElse) {
                statusCell.textContent = "Assigned"; statusCell.className = 'status-assigned'; actionCell.textContent = "---";
            } else if (canIStillApply) {
                statusCell.textContent = "Available"; statusCell.className = 'status-available';
                const applyButton = document.createElement('button'); applyButton.textContent = "Apply"; applyButton.classList.add("apply", "small-action");
                applyButton.onclick = () => applyForShift(shift.id, getWeekKey(forWeekDate)); actionCell.appendChild(applyButton);
            } else {
                if(shift.status === 'pending' && !isApprovedForSomeoneElse && !isApprovedForMe){
                     statusCell.textContent = "Available"; statusCell.className = 'status-available';
                     const applyButton = document.createElement('button'); applyButton.textContent = "Apply"; applyButton.classList.add("apply", "small-action");
                     applyButton.onclick = () => applyForShift(shift.id, getWeekKey(forWeekDate)); actionCell.appendChild(applyButton);
                } else {
                    statusCell.textContent = shift.status.charAt(0).toUpperCase() + shift.status.slice(1);
                    if (shift.status === 'approved') statusCell.className = 'status-assigned'; else statusCell.className = `status-${shift.status}`;
                    actionCell.textContent = "---";
                }
            }
        });
        if (userStandardShiftsTableBody.rows.length === 0) { userStandardShiftsTableBody.innerHTML = '<tr><td colspan="5">No standard shifts for this application week.</td></tr>';}
        if (userCustomShiftsTableBody) {
            userCustomShiftsSection.classList.toggle('hidden', !hasCustomShiftsForApplicationWeek);
            if (userCustomShiftsTableBody.rows.length === 0 && hasCustomShiftsForApplicationWeek){ userCustomShiftsTableBody.innerHTML = '<tr><td colspan="5">No custom shifts/events for this application week.</td></tr>';
            } else if (!hasCustomShiftsForApplicationWeek) { userCustomShiftsTableBody.innerHTML = '<tr><td colspan="5">No custom shifts/events for this application week.</td></tr>';}
        }
    }

    function renderUserPublishedSchedule(shiftsForWeek, tableBodyElement) {
        tableBodyElement.innerHTML = "";
        if (!shiftsForWeek || !Array.isArray(shiftsForWeek)) return;

        sortShiftsArray(shiftsForWeek);
        const scheduleData = {};
        workDays.forEach(day => {
            scheduleData[day] = {};
            standardShiftTimes.forEach(time => scheduleData[day][time] = { names: [], description: "" });
        });

        const standardApprovedShifts = shiftsForWeek.filter(s => s.status === "approved" && standardShiftTimes.includes(s.time) && !isCustomTimeShift(s.time));

        standardApprovedShifts.forEach(shift => {
            if (scheduleData[shift.day] && scheduleData[shift.day][shift.time]) {
                scheduleData[shift.day][shift.time].names = shift.assignedCoworkers || [];
                scheduleData[shift.day][shift.time].description = (shift.description && shift.description !== "Normal Shift") ? shift.description : "";
            }
        });

        workDays.forEach(day => {
            const row = tableBodyElement.insertRow();
            const dateForDay = shiftsForWeek.find(s => s.day === day);
            const dayCell = row.insertCell();
            dayCell.innerHTML = `${day}<br><small>${dateForDay ? formatDate(new Date(dateForDay.date), false) : ''}</small>`;

            standardShiftTimes.forEach(time => {
                const cell = row.insertCell();
                const shiftInfo = scheduleData[day][time];
                cell.textContent = shiftInfo.names.length > 0 ? shiftInfo.names.join(', ') : "---";
                if (shiftInfo.names.length > 0) {
                    cell.style.fontWeight = "bold";
                }
                if (shiftInfo.description) {
                    const descSpan = document.createElement('span');
                    descSpan.classList.add('shift-description-display');
                    descSpan.textContent = shiftInfo.description;
                    cell.appendChild(descSpan);
                }
            });
        });
    }

    function renderLatestCustomShiftsForUser(shiftsForWeek) {
        if (!userLatestCustomShiftsTableBody || !userLatestCustomShiftsSection) return;
        userLatestCustomShiftsTableBody.innerHTML = '';
        const customApprovedShifts = shiftsForWeek.filter(s => s.status === "approved" && isCustomTimeShift(s.time));
        if (customApprovedShifts.length > 0) {
            userLatestCustomShiftsSection.classList.remove('hidden');
            sortShiftsArray(customApprovedShifts);
            customApprovedShifts.forEach(shift => {
                const row = userLatestCustomShiftsTableBody.insertRow();
                row.insertCell().textContent = shift.day; row.insertCell().textContent = formatDate(new Date(shift.date), false);
                row.insertCell().textContent = shift.time; const descCell = row.insertCell(); descCell.textContent = shift.description || "N/A";
                row.insertCell().textContent = (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.length > 0) ? shift.assignedCoworkers.join(', ') : "Error";
            });
        } else { userLatestCustomShiftsSection.classList.add('hidden'); }
    }

    function renderScheduleOverview(shiftsForWeek, tableBodyElement) {
        tableBodyElement.innerHTML = "";
        if (!shiftsForWeek) {
            shiftsForWeek = [];
        }
        sortShiftsArray(shiftsForWeek);
        const scheduleData = {};
        workDays.forEach(day => {
            scheduleData[day] = {};
            standardShiftTimes.forEach(time => scheduleData[day][time] = { names: [], description: "", exists: false });
        });

        shiftsForWeek.forEach(shift => {
            const isStandard = standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time);
            if (isStandard && scheduleData[shift.day] && scheduleData[shift.day][shift.time]) {
                const namesToDisplay = (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.length > 0) ? shift.assignedCoworkers : [];
                scheduleData[shift.day][shift.time].names = namesToDisplay;
                scheduleData[shift.day][shift.time].description = (shift.description && shift.description !== "Normal Shift") ? shift.description : "";
                scheduleData[shift.day][shift.time].exists = true;
            }
        });

        workDays.forEach(day => {
            const row = tableBodyElement.insertRow();
            const dateForDay = getDateForDayInWeek(day, currentViewingDateMgr);
            const dayCell = row.insertCell();
            dayCell.innerHTML = `${day}<br><small>${formatDate(new Date(dateForDay), false)}</small>`;

            standardShiftTimes.forEach(time => {
                const cell = row.insertCell();
                cell.style.textAlign = 'center';
                cell.style.verticalAlign = 'middle';
                const shiftInfo = scheduleData[day][time];

                if (shiftInfo.exists) {
                    cell.textContent = shiftInfo.names.length > 0 ? shiftInfo.names.join(', ') : "Unassigned";
                    if(shiftInfo.names.length > 0) cell.style.fontWeight = "bold";
                    if (shiftInfo.description) {
                        const descSpan = document.createElement('span');
                        descSpan.classList.add('shift-description-display');
                        descSpan.textContent = shiftInfo.description;
                        cell.appendChild(descSpan);
                    }
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'x';
                    deleteBtn.classList.add('delete', 'small-action');
                    deleteBtn.style.cssFloat = 'right';
                    deleteBtn.style.padding = '2px 5px';
                    deleteBtn.title = 'Delete this shift';
                    deleteBtn.onclick = (e) => { e.stopPropagation(); managerAddOrDeleteStandardShift(day, time, 'delete'); };
                    cell.appendChild(deleteBtn);
                } else {
                    const addBtn = document.createElement('button');
                    addBtn.textContent = '+';
                    addBtn.classList.add('approve', 'small-action');
                    addBtn.style.padding = '2px 6px';
                    addBtn.title = 'Add this shift';
                    addBtn.onclick = (e) => { e.stopPropagation(); managerAddOrDeleteStandardShift(day, time, 'add'); };
                    cell.appendChild(addBtn);
                }
            });
        });

        const customApprovedShifts = shiftsForWeek.filter(s => s.status === "approved" && isCustomTimeShift(s.time));
        if (managerCustomShiftsPreviewTableBody) {
            managerCustomShiftsPreviewTableBody.innerHTML = '';
            if (customApprovedShifts.length > 0) {
                managerCustomShiftsPreviewSection.classList.remove('hidden');
                sortShiftsArray(customApprovedShifts);
                customApprovedShifts.forEach(shift => {
                    const row = managerCustomShiftsPreviewTableBody.insertRow();
                    row.insertCell().textContent = shift.day;
                    row.insertCell().textContent = formatDate(new Date(shift.date), false);
                    row.insertCell().textContent = shift.time;
                    const descCell = row.insertCell();
                    descCell.textContent = shift.description || "N/A";
                    row.insertCell().textContent = (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.length > 0) ? shift.assignedCoworkers.join(', ') : "Error";
                });
            } else {
                managerCustomShiftsPreviewSection.classList.add('hidden');
            }
        }
    }

    async function refreshManagerDashboard() {
        if (!isManagerModeActive) return;
        try {
            const weekData = await getWeekData(currentViewingDateMgr);
            if (weekData.error || !weekData.shifts) {
                managerSidebarWeekDisplay.textContent = "Error loading week.";
                managerApplicationWeekDisplay.textContent = "Error loading apps.";
                managerSchedulePreviewTitle.textContent = "Error loading schedule.";
                if(managerShiftsTableBody) managerShiftsTableBody.innerHTML = '<tr><td colspan="6">Error loading shifts.</td></tr>';
                if(managerCustomShiftsApplicationTableBody) managerCustomShiftsApplicationTableBody.innerHTML = '<tr><td colspan="6">Error loading custom shifts.</td></tr>';
                if(managerSchedulePreviewTableBody) managerSchedulePreviewTableBody.innerHTML = '<tr><td colspan="3">Error loading preview.</td></tr>';
                if(hoursOverviewDisplayDiv) hoursOverviewDisplayDiv.innerHTML = "<p>Error loading hours.</p>";
                if(managerCustomShiftsPreviewSection) managerCustomShiftsPreviewSection.classList.add('hidden');
                return;
            }
            const shiftsForViewingWeek = weekData.shifts;
            sortShiftsArray(shiftsForViewingWeek);
            managerSidebarWeekDisplay.textContent = `Week: ${formatDate(currentViewingDateMgr, false)}`;
            managerApplicationWeekDisplay.textContent = `Apps for week: ${formatDate(currentViewingDateMgr, false)}`;
            managerSchedulePreviewTitle.textContent = `Schedule: Week of ${formatDate(currentViewingDateMgr, false)}`;
            renderManagerApplications(shiftsForViewingWeek);
            renderScheduleOverview(shiftsForViewingWeek, managerSchedulePreviewTableBody);
            renderHoursOverview(shiftsForViewingWeek);

            if (weekData.isPublished) {
                publishWeekBtn.textContent = "Unpublish Week";
                publishWeekBtn.classList.remove("publish");
                publishWeekBtn.classList.add("deny");
                publishStatusIndicator.textContent = "Status: Published";
                publishStatusIndicator.style.color = "green";
            } else {
                publishWeekBtn.textContent = "Publish Week";
                publishWeekBtn.classList.add("publish");
                publishWeekBtn.classList.remove("deny");
                publishStatusIndicator.textContent = "Status: Not Published";
                publishStatusIndicator.style.color = "orange";
            }
        } catch (error) {
            console.error("Error refreshing manager dashboard:", error);
        }
    }

    function renderManagerApplications(allShiftsForWeek) {
        const shiftsToDisplay = allShiftsForWeek.filter(shift => {
            const isStandardByTime = standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time);
            if (currentManagerShiftView === 'standard') {
                return isStandardByTime;
            } else {
                return !isStandardByTime;
            }
        });

        const targetTableBody = currentManagerShiftView === 'standard' ? managerShiftsTableBody : managerCustomShiftsApplicationTableBody;

        if (!targetTableBody) {
            console.error("Target table body for manager applications not found:", currentManagerShiftView);
            return;
        }
        targetTableBody.innerHTML = "";

        if (shiftsToDisplay.length === 0) {
            targetTableBody.innerHTML = `<tr><td colspan="6">No ${currentManagerShiftView} shifts with applications for this week.</td></tr>`;
        } else {
            sortShiftsArray(shiftsToDisplay);
            shiftsToDisplay.forEach(shift => {
                const row = targetTableBody.insertRow();
                row.insertCell().textContent = shift.day;
                row.insertCell().textContent = formatDate(new Date(shift.date), false);
                const timeCell = row.insertCell(); timeCell.textContent = shift.time;
                const effectiveDescription = (!shift.description && standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time)) ? "Normal Shift" : shift.description;
                if (effectiveDescription && effectiveDescription !== "Normal Shift") {
                    const descSpan = document.createElement('span');
                    descSpan.classList.add('shift-description-display');
                    descSpan.textContent = effectiveDescription;
                    timeCell.appendChild(descSpan);
                }
                const statusCell = row.insertCell(); statusCell.textContent = shift.status.charAt(0).toUpperCase() + shift.status.slice(1); statusCell.className = `status-${shift.status}`;
                let applicantDisplay = "---";
                if (shift.status === "approved") { if (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.length > 0) { applicantDisplay = shift.assignedCoworkers.join(', '); } else if (shift.applicantName) { applicantDisplay = shift.applicantName; }
                } else if (shift.status === "pending" && Array.isArray(shift.applicants) && shift.applicants.length > 0) { applicantDisplay = shift.applicants.join(', '); }
                row.insertCell().textContent = applicantDisplay;
                const actionCell = row.insertCell(); actionCell.classList.add("action-cell"); const weekKey = getWeekKey(new Date(shift.date));

                if (shift.status === "pending" && Array.isArray(shift.applicants) && shift.applicants.length > 0) {
                    const applicantCheckboxContainer = document.createElement('div');
                    applicantCheckboxContainer.id = `checkbox-container-pending-${shift.id}`;
                    applicantCheckboxContainer.style.textAlign = 'left';
                    applicantCheckboxContainer.style.maxHeight = '100px';
                    applicantCheckboxContainer.style.overflowY = 'auto';
                    applicantCheckboxContainer.style.marginBottom = '5px';

                    shift.applicants.forEach(appName => {
                        const checkboxLabel = document.createElement('label');
                        checkboxLabel.classList.add('applicant-checkbox-item');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = appName;
                        checkbox.name = `pending-applicant-${shift.id}`;
                        checkbox.style.marginRight = '5px';
                        checkboxLabel.appendChild(checkbox);
                        checkboxLabel.appendChild(document.createTextNode(appName));
                        applicantCheckboxContainer.appendChild(checkboxLabel);
                    });
                    actionCell.appendChild(applicantCheckboxContainer);

                    const approveSelectedBtn = document.createElement('button');
                    approveSelectedBtn.textContent = "Approve Sel.";
                    approveSelectedBtn.classList.add("approve", "small-action");
                    approveSelectedBtn.onclick = async () => {
                        const selectedNames = [];
                        const checkboxes = document.querySelectorAll(`input[name="pending-applicant-${shift.id}"]:checked`);
                        checkboxes.forEach(cb => selectedNames.push(cb.value));
                        if (selectedNames.length > 0) {
                            await managerApproveMultipleApplicants(shift.id, weekKey, selectedNames);
                        } else {
                            await showAlert("Please select at least one applicant to approve.");
                        }
                    };
                    actionCell.appendChild(approveSelectedBtn);

                    const denyAllBtn = document.createElement('button');
                    denyAllBtn.textContent = "Deny All";
                    denyAllBtn.classList.add("deny", "small-action");
                    denyAllBtn.style.marginLeft = "5px";
                    denyAllBtn.onclick = async () => await managerDenyAllApplicants(shift.id, weekKey);
                    actionCell.appendChild(denyAllBtn);
                }
                else if (shift.status === "approved") {
                    const editBtn = document.createElement('button');
                    editBtn.textContent = "Edit Assignment(s)";
                    editBtn.classList.add("edit", "small-action");
                    editBtn.style.marginBottom = "5px";
                    editBtn.onclick = () => openAssignEditModal(shift, weekKey, true);
                    actionCell.appendChild(editBtn);

                    const clearBtn = document.createElement('button');
                    clearBtn.textContent = "Clear Assignment(s)";
                    clearBtn.classList.add("deny", "small-action");
                    clearBtn.onclick = async () => {
                        const confirmClear = await showConfirm("Are you sure you want to clear all assignments for this shift?");
                        if (confirmClear) {
                            await managerClearApprovedShift(shift.id, weekKey);
                        }
                    };
                    actionCell.appendChild(clearBtn);
                }
               if (shift.status === "available") {
                    if (actionCell.childNodes.length > 0 && actionCell.lastChild.tagName !== 'HR' ) actionCell.appendChild(document.createElement('hr'));
                    const assignBtn = document.createElement('button');
                    assignBtn.textContent = "Assign Coworker(s)";
                    assignBtn.classList.add("assign", "small-action");
                    assignBtn.onclick = () => openAssignEditModal(shift, weekKey, false);
                    actionCell.appendChild(assignBtn);
                }

                if (actionCell.childElementCount === 0) {
                    actionCell.textContent = '---';
                }
            });
        }
    }

    function renderHoursOverview(shiftsForViewingWeek) {
        if (!hoursOverviewDisplayDiv) return;
        hoursOverviewDisplayDiv.innerHTML = "";

        if (!shiftsForViewingWeek || !Array.isArray(shiftsForViewingWeek)) {
            hoursOverviewDisplayDiv.innerHTML = "<p>Could not load hours.</p>";
            return;
        }

        const type = hoursViewTypeSelect.value;
        const hoursData = {};
        coworkers.forEach(c => {
            hoursData[c.name] = 0;
        });

        const processShiftHours = (shift) => {
            if (standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time)) return SHIFT_DURATION_HOURS;
            if (shift.time && shift.time.includes(' - ')) {
                try {
                    const [startStr, endStr] = shift.time.split(' - ');
                    const [startH, startM] = startStr.split(':').map(Number);
                    const [endH, endM] = endStr.split(':').map(Number);
                    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
                        const startDate = new Date(0, 0, 0, startH, startM);
                        const endDate = new Date(0, 0, 0, endH, endM);
                        let diffMillis = endDate - startDate;
                        if (diffMillis < 0) diffMillis += 24 * 60 * 60 * 1000;
                        return diffMillis / (1000 * 60 * 60);
                    }
                } catch (e) { return 0; }
            }
            return 0;
        };

        let shiftsToProcessForHours = [];
        if (type === "weekly") {
            shiftsToProcessForHours = shiftsForViewingWeek;
        } else if (type === "monthly") {
            const targetMonth = currentViewingDateMgr.getMonth();
            const targetYear = currentViewingDateMgr.getFullYear();
            for (const weekKey in allShiftsData) {
                const weekStartDate = new Date(weekKey);
                if (weekStartDate.getMonth() === targetMonth && weekStartDate.getFullYear() === targetYear && allShiftsData[weekKey] && Array.isArray(allShiftsData[weekKey].shifts)) {
                    shiftsToProcessForHours = shiftsToProcessForHours.concat(allShiftsData[weekKey].shifts);
                }
            }
        }

        const filteredShiftsForHours = shiftsToProcessForHours.filter(s => {
            const isStandardByTime = standardShiftTimes.includes(s.time) && !isCustomTimeShift(s.time);
            if (currentManagerShiftView === 'standard') {
                return isStandardByTime;
            } else {
                return !isStandardByTime;
            }
        });

        filteredShiftsForHours.filter(s => s.status === "approved").forEach(s => {
            const duration = processShiftHours(s);
            if (Array.isArray(s.assignedCoworkers)) {
                s.assignedCoworkers.forEach(name => {
                    if (hoursData.hasOwnProperty(name)) {
                        hoursData[name] += duration;
                    }
                });
            } else if (s.applicantName && hoursData.hasOwnProperty(s.applicantName)) {
                 hoursData[s.applicantName] += duration;
            }
        });

        const overviewTitle = document.createElement('h4');
        overviewTitle.textContent = currentManagerShiftView === 'standard' ? "Standard Shift Hours:" : "Custom Shift/Event Hours:";
        hoursOverviewDisplayDiv.appendChild(overviewTitle);

        const sortedCoworkers = Object.keys(hoursData).sort();
        if (sortedCoworkers.length === 0) {
            const p = document.createElement('p');
            p.textContent = "No coworkers found.";
            hoursOverviewDisplayDiv.appendChild(p);
        } else {
            let hasHoursToShow = false;
            sortedCoworkers.forEach(name => {
                if (hoursData[name] > 0) hasHoursToShow = true;
                const item = document.createElement('div');
                item.classList.add('hours-overview-item');
                item.textContent = `${name}: ${hoursData[name].toFixed(1)} hrs`;
                hoursOverviewDisplayDiv.appendChild(item);
            });
            if (!hasHoursToShow) {
                const p = document.createElement('p');
                p.style.fontSize = '0.85em';
                p.style.fontStyle = 'italic';
                p.textContent = `No ${currentManagerShiftView} hours for this ${type} period.`;
                hoursOverviewDisplayDiv.appendChild(p);
            }
        }
    }

    async function renderMyPastShifts() { if (!loggedInCoworker) { if (myPastShiftsSection) myPastShiftsSection.classList.add('hidden'); return; } if (!myPastShiftsSection) { return; } myPastShiftsSection.classList.remove('hidden'); const viewType = pastShiftsViewTypeSelect.value; myPastShiftsTableBody.innerHTML = ""; let periodStart, periodEnd, displayPeriodString = ""; if (viewType === "weekly") { periodStart = getMondayOfDate(new Date(currentPastShiftViewDate)); periodEnd = new Date(periodStart); periodEnd.setDate(periodStart.getDate() + 6); periodEnd.setHours(23, 59, 59, 999); displayPeriodString = `Week of ${formatDate(periodStart, false)}`; } else { periodStart = new Date(currentPastShiftViewDate.getFullYear(), currentPastShiftViewDate.getMonth(), 1); periodEnd = new Date(currentPastShiftViewDate.getFullYear(), currentPastShiftViewDate.getMonth() + 1, 0); periodEnd.setHours(23, 59, 59, 999); displayPeriodString = `${periodStart.toLocaleString('default', { month: 'long' })} ${periodStart.getFullYear()}`; } myPastShiftsPeriodDisplay.textContent = displayPeriodString; const userPastShifts = []; try { for (const weekKey in allShiftsData) { const weekData = allShiftsData[weekKey]; if (weekData && Array.isArray(weekData.shifts)) { weekData.shifts.forEach(shift => { const shiftDate = new Date(shift.date); const isAssignedToUser = (shift.applicantName === loggedInCoworker.name) || (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.includes(loggedInCoworker.name)); if ( shift.status === 'approved' && isAssignedToUser && shiftDate >= periodStart && shiftDate <= periodEnd ) { userPastShifts.push(shift); } }); } } } catch (error) { myPastShiftsTableBody.innerHTML = `<tr><td colspan="3">Error loading past shifts.</td></tr>`; return; } if (userPastShifts.length === 0) { myPastShiftsTableBody.innerHTML = `<tr><td colspan="3">No approved shifts found.</td></tr>`; return; } sortShiftsArray(userPastShifts); userPastShifts.forEach(shift => { const row = myPastShiftsTableBody.insertRow(); row.insertCell().textContent = formatDate(new Date(shift.date), false); row.insertCell().textContent = shift.day; const timeCell = row.insertCell(); timeCell.textContent = shift.time; const effectiveDescription = (!shift.description && standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time)) ? "Normal Shift" : shift.description; if(effectiveDescription && effectiveDescription !== "Normal Shift"){ const descSpan = document.createElement('span'); descSpan.className='shift-description-display'; descSpan.textContent = effectiveDescription; timeCell.appendChild(descSpan);} }); }

    async function renderTotalHoursSummary() {
        totalHoursSummaryTableBodyModal.innerHTML = '<tr><td colspan="2">Loading summary...</td></tr>';
        const period = totalHoursPeriodSelectModal.value;
        const summaryData = {};
        coworkers.forEach(c => summaryData[c.name] = 0);

        const processShiftHours = (shift) => {
            if (standardShiftTimes.includes(shift.time) && !isCustomTimeShift(shift.time)) return SHIFT_DURATION_HOURS;
            if (shift.time && shift.time.includes(' - ')) {
                try {
                    const [startStr, endStr] = shift.time.split(' - ');
                    const [startH, startM] = startStr.split(':').map(Number);
                    const [endH, endM] = endStr.split(':').map(Number);
                    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
                        const startDate = new Date(0, 0, 0, startH, startM);
                        const endDate = new Date(0, 0, 0, endH, endM);
                        let diffMillis = endDate - startDate;
                        if (diffMillis < 0) diffMillis += 24 * 60 * 60 * 1000;
                        return diffMillis / (1000 * 60 * 60);
                    }
                } catch (e) {
                    return 0;
                }
            }
            return 0;
        };

        let shiftsToConsider = [];

        try {
            let query = db.collection('shifts');

            if (period === "viewing_week") {
                const weekKey = getWeekKey(currentViewingDateMgr);
                const weekDoc = await query.doc(weekKey).get();
                if (weekDoc.exists && weekDoc.data().shifts) {
                    shiftsToConsider = weekDoc.data().shifts;
                }
            } else if (period === "viewing_month") {
                const viewDate = currentViewingDateMgr;
                const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

                const monthStartKey = getWeekKey(monthStart);
                const monthEndKey = getWeekKey(monthEnd);

                const monthQuerySnapshot = await query.where(firebase.firestore.FieldPath.documentId(), '>=', monthStartKey).where(firebase.firestore.FieldPath.documentId(), '<', monthEndKey).get();

                monthQuerySnapshot.forEach(doc => {
                     if (doc.data() && doc.data().shifts) {
                        shiftsToConsider = shiftsToConsider.concat(doc.data().shifts);
                    }
                });

            } else {
                const allWeeksSnapshot = await query.get();
                allWeeksSnapshot.forEach(doc => {
                    if (doc.data() && doc.data().shifts) {
                        shiftsToConsider = shiftsToConsider.concat(doc.data().shifts);
                    }
                });
            }

            shiftsToConsider.filter(s => s.status === "approved").forEach(s => {
                const duration = processShiftHours(s);
                if (Array.isArray(s.assignedCoworkers)) {
                    s.assignedCoworkers.forEach(name => {
                        if (summaryData.hasOwnProperty(name)) summaryData[name] += duration;
                    });
                }
            });

            totalHoursSummaryTableBodyModal.innerHTML = '';
            const sortedCoworkerNames = Object.keys(summaryData).sort();

            if(sortedCoworkerNames.length === 0) {
                totalHoursSummaryTableBodyModal.innerHTML = '<tr><td colspan="2">No coworkers found.</td></tr>';
            }

            sortedCoworkerNames.forEach(name => {
                const row = totalHoursSummaryTableBodyModal.insertRow();
                row.insertCell().textContent = name;
                row.insertCell().textContent = summaryData[name].toFixed(1) + " hrs";
            });

        } catch (error) {
            console.error("Error rendering total hours summary:", error);
            totalHoursSummaryTableBodyModal.innerHTML = '<tr><td colspan="2" class="error-message">Error loading summary.</td></tr>';
        }
    }

    async function applyForShift(shiftId, weekKey) { if (!loggedInCoworker) { await showAlert("You must be logged in."); return; } const weekDocRef = db.collection('shifts').doc(weekKey); try { await db.runTransaction(async (transaction) => { const weekDoc = await transaction.get(weekDocRef); if (!weekDoc.exists) throw "Shift data not found!"; const weekData = weekDoc.data(); if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data."; const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId); if (shiftIndex === -1) throw "Shift not found!"; const shift = weekData.shifts[shiftIndex]; if (shift.status === 'approved') { await showAlert("Shift already approved."); return; } if (!Array.isArray(shift.applicants)) shift.applicants = []; if (shift.applicants.includes(loggedInCoworker.name)) { await showAlert("Already applied."); return; } weekData.shifts[shiftIndex].applicants.push(loggedInCoworker.name); weekData.shifts[shiftIndex].status = "pending"; weekData.shifts[shiftIndex].applicantName = ""; transaction.update(weekDocRef, { shifts: weekData.shifts }); allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData)); }); await renderCurrentUserApplicationWeek(); } catch (error) { console.error("Error applying for shift:", error); await showAlert("Failed to apply: " + error.message); } }
    async function cancelApplication(shiftId, weekKey) { if (!loggedInCoworker) return; const weekDocRef = db.collection('shifts').doc(weekKey); try { await db.runTransaction(async (transaction) => { const weekDoc = await transaction.get(weekDocRef); if (!weekDoc.exists) throw "Shift data not found!"; const weekData = weekDoc.data(); if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data."; const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId); if (shiftIndex === -1) throw "Shift not found!"; const shift = weekData.shifts[shiftIndex]; if (!Array.isArray(shift.applicants)) shift.applicants = []; if (shift.status !== 'pending' || !shift.applicants.includes(loggedInCoworker.name)) { await showAlert("Cannot cancel."); return; } weekData.shifts[shiftIndex].applicants = shift.applicants.filter(name => name !== loggedInCoworker.name); if (weekData.shifts[shiftIndex].applicants.length === 0) { weekData.shifts[shiftIndex].status = "available"; } transaction.update(weekDocRef, { shifts: weekData.shifts }); allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData)); }); await renderCurrentUserApplicationWeek(); } catch (error) { console.error("Error cancelling application:", error); await showAlert("Failed to cancel: " + error.message); } }

    async function managerApproveMultipleApplicants(shiftId, weekKey, selectedApplicantNames) {
        const weekDocRef = db.collection('shifts').doc(weekKey);
        try {
            await db.runTransaction(async (transaction) => {
                const weekDoc = await transaction.get(weekDocRef);
                if (!weekDoc.exists) throw "Shift data not found!";
                const weekData = weekDoc.data();
                if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data.";
                const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId);
                if (shiftIndex === -1) throw "Shift not found!";
                if (weekData.shifts[shiftIndex].status !== 'pending') {
                    await showAlert("Shift is no longer pending. Refresh and try again.");
                    return;
                }
                weekData.shifts[shiftIndex].status = "approved";
                weekData.shifts[shiftIndex].applicantName = "";
                weekData.shifts[shiftIndex].assignedCoworkers = selectedApplicantNames;
                weekData.shifts[shiftIndex].applicants = [];
                transaction.update(weekDocRef, { shifts: weekData.shifts });
                allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData));
            });
            await refreshManagerDashboard();
            await prepareUserView();
        } catch (error) {
            console.error("Error approving multiple applicants:", error);
            await showAlert("Failed to approve applicants: " + error.message);
        }
    }

    async function managerApproveSelectedApplicant(shiftId, weekKey, selectedApplicantName) {
        await managerApproveMultipleApplicants(shiftId, weekKey, [selectedApplicantName]);
    }

    async function managerDenyAllApplicants(shiftId, weekKey) { const weekDocRef = db.collection('shifts').doc(weekKey); try { await db.runTransaction(async (transaction) => { const weekDoc = await transaction.get(weekDocRef); if (!weekDoc.exists) throw "Shift data not found!"; const weekData = weekDoc.data(); if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data."; const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId); if (shiftIndex === -1) throw "Shift not found!"; weekData.shifts[shiftIndex].status = "available"; weekData.shifts[shiftIndex].applicantName = ""; weekData.shifts[shiftIndex].applicants = []; weekData.shifts[shiftIndex].assignedCoworkers = []; transaction.update(weekDocRef, { shifts: weekData.shifts }); allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData)); }); await refreshManagerDashboard(); await prepareUserView(); } catch (error) { console.error("Error denying applicants:", error); await showAlert("Failed to deny: " + error.message); } }
    async function managerClearApprovedShift(shiftId, weekKey) { const weekDocRef = db.collection('shifts').doc(weekKey); try { await db.runTransaction(async (transaction) => { const weekDoc = await transaction.get(weekDocRef); if (!weekDoc.exists) throw "Shift data not found!"; const weekData = weekDoc.data(); if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data."; const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId); if (shiftIndex === -1) throw "Shift not found!"; if (weekData.shifts[shiftIndex].status !== 'approved') { await showAlert("Shift not approved."); return; } weekData.shifts[shiftIndex].status = "available"; weekData.shifts[shiftIndex].applicantName = ""; weekData.shifts[shiftIndex].applicants = []; weekData.shifts[shiftIndex].assignedCoworkers = []; transaction.update(weekDocRef, { shifts: weekData.shifts }); allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData)); }); await refreshManagerDashboard(); await prepareUserView(); } catch (error) { console.error("Error clearing shift:", error); await showAlert("Failed to clear: " + error.message); } }

    async function managerManuallyAssignMultipleShift(shiftId, weekKey, coworkerNames) {
        if (!Array.isArray(coworkerNames) || coworkerNames.length === 0) {
            await managerClearApprovedShift(shiftId, weekKey);
            return;
        }
        const weekDocRef = db.collection('shifts').doc(weekKey);
        try {
            await db.runTransaction(async (transaction) => {
                const weekDoc = await transaction.get(weekDocRef);
                if (!weekDoc.exists) throw "Shift data not found!";
                const weekData = weekDoc.data();
                if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data.";
                const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId);
                if (shiftIndex === -1) throw "Shift not found!";
                weekData.shifts[shiftIndex].status = "approved";
                weekData.shifts[shiftIndex].applicantName = "";
                weekData.shifts[shiftIndex].applicants = [];
                weekData.shifts[shiftIndex].assignedCoworkers = coworkerNames;
                transaction.update(weekDocRef, { shifts: weekData.shifts });
                allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData));
            });
            await refreshManagerDashboard();
            await prepareUserView();
        } catch (error) {
            console.error("Error assigning shift via modal:", error);
            await showAlert("Failed to assign: " + error.message);
        }
    }

    async function handlePublishWeekToggle() { const weekKeyToPublish = getWeekKey(currentViewingDateMgr); const weekDocRefToPublish = db.collection('shifts').doc(weekKeyToPublish); try { const docToPublish = await weekDocRefToPublish.get(); if (!docToPublish.exists) { await showAlert("Cannot publish a non-existent week."); return; } const dataToPublish = docToPublish.data(); if (!dataToPublish || typeof dataToPublish.isPublished !== 'boolean') { await showAlert("Week data invalid."); return; } if (dataToPublish.isPublished) { const doUnpublish = await showConfirm(`Unpublish week of ${formatDate(currentViewingDateMgr, false)}?`); if (doUnpublish) { await weekDocRefToPublish.update({ isPublished: false }); if (allShiftsData[weekKeyToPublish]) { allShiftsData[weekKeyToPublish].isPublished = false; } await showAlert(`Week of ${formatDate(currentViewingDateMgr, false)} Unpublished.`); } else { return; } } else { const publishedWeeksQuery = db.collection('shifts').where('isPublished', '==', true); const snapshot = await publishedWeeksQuery.get(); let previouslyPublishedWeekKey = null; let previouslyPublishedWeekDocRef = null; snapshot.forEach(doc => { if (doc.id !== weekKeyToPublish) { previouslyPublishedWeekKey = doc.id; previouslyPublishedWeekDocRef = doc.ref; } }); let doPublishCurrentWeek = true; if (previouslyPublishedWeekKey) { const confirmUnpublishOld = await showConfirm( `Week of ${formatDate(new Date(weekKeyToPublish), false)} is about to be published.\n` + `The week of ${formatDate(new Date(previouslyPublishedWeekKey), false)} is currently published.\n\n` + `Unpublish the week of ${formatDate(new Date(previouslyPublishedWeekKey), false)} first?` ); if (confirmUnpublishOld) { await previouslyPublishedWeekDocRef.update({ isPublished: false }); if (allShiftsData[previouslyPublishedWeekKey]) { allShiftsData[previouslyPublishedWeekKey].isPublished = false; } } } else { const confirmPublish = await showConfirm(`Publish week of ${formatDate(currentViewingDateMgr, false)}?`); if (!confirmPublish) { doPublishCurrentWeek = false; } } if (doPublishCurrentWeek) { await weekDocRefToPublish.update({ isPublished: true }); if (allShiftsData[weekKeyToPublish]) { allShiftsData[weekKeyToPublish].isPublished = true; } else { const freshData = (await weekDocRefToPublish.get()).data(); if (freshData) { freshData.isPublished = true; allShiftsData[weekKeyToPublish] = JSON.parse(JSON.stringify(freshData)); } } await showAlert(`Week of ${formatDate(currentViewingDateMgr, false)} Published.`); } } await refreshManagerDashboard(); await prepareUserView(); } catch (error) { console.error("Error toggling publish status:", error); await showAlert("Failed to toggle publish status: " + error.message); } }

    async function managerAddOrDeleteStandardShift(day, time, action) {
        const weekKey = getWeekKey(currentViewingDateMgr);
        const shiftSpecificDateISO = getDateForDayInWeek(day, currentViewingDateMgr);
        if (!shiftSpecificDateISO) {
            await showAlert("Could not determine date for this shift.");
            return;
        }

        const weekDocRef = db.collection('shifts').doc(weekKey);

        try {
            await db.runTransaction(async (transaction) => {
                const weekDoc = await transaction.get(weekDocRef);
                let weekData;

                if (!weekDoc.exists) {
                    weekData = { shifts: [], isPublished: false };
                } else {
                    weekData = weekDoc.data();
                    if (!Array.isArray(weekData.shifts)) weekData.shifts = [];
                }

                const existingShiftIndex = weekData.shifts.findIndex(s => s.day === day && s.time === time);

                if (action === 'add' && existingShiftIndex === -1) {
                    const newShift = {
                        id: `${weekKey}-${Date.now()}`,
                        day: day,
                        date: shiftSpecificDateISO,
                        time: time,
                        status: "available",
                        applicants: [],
                        applicantName: "",
                        description: "Normal Shift",
                        assignedCoworkers: []
                    };
                    weekData.shifts.push(newShift);
                } else if (action === 'delete' && existingShiftIndex !== -1) {
                    const shiftToDelete = weekData.shifts[existingShiftIndex];
                    if (shiftToDelete.status === 'approved' || shiftToDelete.status === 'pending') {
                        const confirmDelete = await showConfirm(
                            `This shift has applicants or is assigned. Are you sure you want to delete it? All applications will be lost.`
                        );
                        if (!confirmDelete) throw new Error("Deletion cancelled by user.");
                    }
                    weekData.shifts.splice(existingShiftIndex, 1);
                } else {
                    return;
                }

                sortShiftsArray(weekData.shifts);
                transaction.update(weekDocRef, { shifts: weekData.shifts });
                allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData));
            });

            await refreshManagerDashboard();

        } catch (error) {
            if (error.message !== "Deletion cancelled by user.") {
                 console.error("Error adding/deleting standard shift:", error);
                 await showAlert("Failed to modify shift: " + error.message);
            }
        }
    }

    async function handleClearWeekShifts() {
        const confirmClear = await showConfirm(`Are you sure you want to delete ALL shifts for the week of ${formatDate(currentViewingDateMgr, false)}? This cannot be undone.`);
        if (!confirmClear) return;

        const weekKey = getWeekKey(currentViewingDateMgr);
        const weekDocRef = db.collection('shifts').doc(weekKey);

        try {
            await weekDocRef.update({ shifts: [] });
            if (allShiftsData[weekKey]) {
                allShiftsData[weekKey].shifts = [];
            }
            await showAlert("Success", "All shifts for this week have been deleted.");
            await refreshManagerDashboard();
        } catch (error) {
            console.error("Error clearing week shifts:", error);
            await showAlert("Error", "Could not clear the shifts for this week.");
        }
    }

    function isCustomTimeShift(timeStr) {
        if (!timeStr) return false;
        return !standardShiftTimes.includes(timeStr);
    }

    function renderCoworkerListForManager() {
        coworkerListDivModal.innerHTML = "<h4>Current Coworkers:</h4>";
        if (coworkers.length === 0) {
            coworkerListDivModal.innerHTML += "<p>No coworkers.</p>";
            return;
        }
        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '0';
        coworkers.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
            const li = document.createElement('li');
            li.classList.add('coworker-management-item');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${c.name} ${c.isManager ? '(Mgr)' : ''} ${c.email ? '('+c.email+')': ''}`;
            li.appendChild(nameSpan);
            const actionDiv = document.createElement('div');
            const toggleMgrBtn = document.createElement('button');
            toggleMgrBtn.textContent = c.isManager ? "Demote" : "Promote";
            toggleMgrBtn.classList.add("secondary", "small-action");
            toggleMgrBtn.onclick = () => handleToggleManagerStatus(c.id || c.name);
            actionDiv.appendChild(toggleMgrBtn);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Del";
            deleteBtn.classList.add("delete", "small-action");
            deleteBtn.onclick = () => handleDeleteCoworker(c.id || c.name);
            actionDiv.appendChild(deleteBtn);
            li.appendChild(actionDiv);
            ul.appendChild(li);
        });
        coworkerListDivModal.appendChild(ul);
    }

    async function handleAddCoworker() {
        const name = newCoworkerNameInputModal.value.trim();
        const password = newCoworkerPasswordInputModal.value;
        const isManager = newCoworkerIsManagerCheckboxModal.checked;

        if (!name || !password) { await showAlert("Name and password required."); return; }
        if (coworkers.find(c => c.name.toLowerCase() === name.toLowerCase())) { await showAlert("Coworker name already exists."); return; }

        try {
            const newCoworkerData = {
                name,
                password,
                isManager,
                email: "",
                emailReminderDisabled: false
            };
            await db.collection('coworkers').doc(name).set(newCoworkerData);
            await initializeCoworkers();
            populateLoginUserDropdown();
            renderCoworkerListForManager();
            newCoworkerNameInputModal.value = "";
            newCoworkerPasswordInputModal.value = "";
            newCoworkerIsManagerCheckboxModal.checked = false;
            await showAlert(`${name} added.`);
        } catch (error) {
            console.error("Error adding coworker:", error);
            await showAlert("Failed to add: " + error.message);
        }
    }

    async function handleDeleteCoworker(coworkerDocIdOrName) {
        const coworkerToDelete = coworkers.find(c => c.id === coworkerDocIdOrName || c.name === coworkerDocIdOrName);
        if (!coworkerToDelete) { await showAlert("Coworker not found."); return;}

        if (coworkerToDelete.isManager && coworkers.filter(c => c.isManager).length <= 1) {
            await showAlert("Action Denied: Cannot delete the last manager. The system requires at least one manager account.");
            return;
        }
        if (coworkerToDelete.isManager) {
            const enteredPassword = await showPrompt(`To delete manager '${coworkerToDelete.name}', please enter the Master Admin Password:`);
            if (enteredPassword === null) { await showAlert("Deletion cancelled by user."); return; }
            if (enteredPassword !== currentMasterPassword) { await showAlert("Master Admin Password incorrect. Deletion cancelled."); return; }
            await showAlert("Master Admin Password confirmed. Proceeding with deletion confirmation...");
        }

        const doDelete = await showConfirm(`Delete ${coworkerToDelete.name}? This will also remove their assignments and applications.`);
        if (!doDelete) return;

        try {
            await db.collection('coworkers').doc(coworkerToDelete.id || coworkerToDelete.name).delete();
            const shiftsCollectionRef = db.collection('shifts');
            const querySnapshot = await shiftsCollectionRef.get();
            const batch = db.batch();
            let changesMadeToShifts = false;
            querySnapshot.forEach(weekDoc => {
                const weekKey = weekDoc.id;
                const weekData = weekDoc.data();
                if (!weekData || !Array.isArray(weekData.shifts)) return;
                let weekModified = false;
                const updatedShifts = weekData.shifts.map(shift => {
                    let shiftChanged = false;
                    if (shift.applicantName === coworkerToDelete.name) { shift.applicantName = ""; shift.status = "available"; shift.assignedCoworkers = []; shiftChanged = true; }
                    if (Array.isArray(shift.applicants) && shift.applicants.includes(coworkerToDelete.name)) { shift.applicants = shift.applicants.filter(name => name !== coworkerToDelete.name); if (shift.status === "pending" && shift.applicants.length === 0) { shift.status = "available"; } shiftChanged = true; }
                    if (Array.isArray(shift.assignedCoworkers) && shift.assignedCoworkers.includes(coworkerToDelete.name)){ shift.assignedCoworkers = shift.assignedCoworkers.filter(name => name !== coworkerToDelete.name); if(shift.status === "approved" && shift.assignedCoworkers.length === 0 && !shift.applicantName) {shift.status = "available";} shiftChanged = true;}
                    if(shiftChanged) weekModified = true; return shift;
                });
                if (weekModified) { batch.update(shiftsCollectionRef.doc(weekKey), { shifts: updatedShifts }); changesMadeToShifts = true; if (allShiftsData[weekKey]) { allShiftsData[weekKey].shifts = updatedShifts.map(s => JSON.parse(JSON.stringify(s)));} }
            });
            if (changesMadeToShifts) { await batch.commit(); }
            await initializeCoworkers();
            populateLoginUserDropdown();
            if (loggedInCoworker && loggedInCoworker.name === coworkerToDelete.name) logout();
            else { if (isManagerModeActive) await refreshManagerDashboard(); await prepareUserView(); }
            await showAlert(`${coworkerToDelete.name} deleted.`);
        } catch (error) {
            console.error("Error deleting coworker:", error);
            await showAlert("Failed to delete: " + error.message);
        }
    }

    async function handleToggleManagerStatus(coworkerDocIdOrName) {
        const coworkerToToggle = coworkers.find(c => c.id === coworkerDocIdOrName || c.name === coworkerDocIdOrName);
        if (!coworkerToToggle) return;
        const newManagerStatus = !coworkerToToggle.isManager;

        if (coworkerToToggle.isManager && newManagerStatus === false && coworkers.filter(c => c.isManager).length <= 1) {
            await showAlert("Action Denied: Cannot demote the last manager. The system requires at least one manager account.");
            return;
        }
        if (coworkerToToggle.isManager && newManagerStatus === false) {
            const enteredPassword = await showPrompt(`To demote manager '${coworkerToToggle.name}', please enter the Master Admin Password:`);
             if (enteredPassword === null) { await showAlert("Demotion cancelled by user."); return; }
            if (enteredPassword !== currentMasterPassword) { await showAlert("Master Admin Password incorrect. Demotion cancelled."); return; }
            await showAlert("Master Admin Password confirmed. Proceeding with demotion...");
        }

        try {
            await db.collection('coworkers').doc(coworkerDocIdOrName).update({ isManager: newManagerStatus });
            coworkerToToggle.isManager = newManagerStatus;
            renderCoworkerListForManager();
            if (loggedInCoworker && (loggedInCoworker.id === coworkerDocIdOrName || loggedInCoworker.name === coworkerDocIdOrName)) {
                loggedInCoworker.isManager = newManagerStatus;
                accessManagerPanelBtn.classList.toggle('hidden', !loggedInCoworker.isManager);
                if (!loggedInCoworker.isManager && isManagerModeActive) { isManagerModeActive = false; showCorrectView(); }
            }
            await showAlert(`Manager status updated for ${coworkerToToggle.name}.`);
        } catch (error) {
            console.error("Error toggling manager status:", error);
            await showAlert("Failed to toggle: " + error.message);
        }
    }
    async function handleSubmitChangeMasterPassword() { changeMasterPassError.textContent = ""; changeMasterPassSuccess.textContent = ""; const currentPassAttempt = currentMasterPasswordInput.value; const newPass = newMasterPasswordInput.value; const confirmPass = confirmNewMasterPasswordInput.value; if (currentPassAttempt !== currentMasterPassword) { changeMasterPassError.textContent = "Current Master Password incorrect."; return; } if (!newPass || newPass.length < 6) { changeMasterPassError.textContent = "New password must be at least 6 characters."; return; } if (newPass !== confirmPass) { changeMasterPassError.textContent = "New passwords do not match."; return; } try { await db.collection('config').doc('adminConfig').set({ masterAdminPassword: newPass }, { merge: true }); currentMasterPassword = newPass; changeMasterPassSuccess.textContent = "Master Admin Password changed successfully!"; currentMasterPasswordInput.value = ""; newMasterPasswordInput.value = ""; confirmNewMasterPasswordInput.value = ""; setTimeout(() => { changeMasterPasswordSection.classList.add('hidden'); changeMasterPassSuccess.textContent = ""; }, 2000); } catch (error) { console.error("Error updating master password:", error); changeMasterPassError.textContent = "Failed to update."; } }
    async function handleResetAllData() {
        const doReset = await showConfirm("This will clear your local session. Data in Firestore will NOT be deleted by this action. This action is primarily for development & testing. Are you sure?");
        if (doReset) {
            loggedInCoworker = null;
            isManagerModeActive = false;
            localStorage.removeItem(ACTIVE_SESSION_USER_KEY);
            allShiftsData = {};
            await initializeApp();
            await showAlert("Local session reset. App re-initialized data (may fetch from Firestore or use defaults if Firestore is empty).");
        }
    }

    function openAssignEditModal(shift, weekKey, isEditingAssignments) {
        currentShiftForModal = { ...shift, weekKey: weekKey, isEditingAssignments: isEditingAssignments };
        assignEditModalTitle.textContent = isEditingAssignments ? `Edit Assignments for ${shift.day} ${shift.time}` : `Assign Coworkers to ${shift.day} ${shift.time}`;

        assignEditCoworkerListDiv.innerHTML = '';
        coworkers.sort((a,b) => a.name.localeCompare(b.name)).forEach(cw => {
            const checkboxId = `modal-assign-cw-${cw.id || cw.name.replace(/\s+/g, '-')}-${shift.id}`;
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox"; checkbox.id = checkboxId; checkbox.value = cw.name; checkbox.name = "modalCoworkerAssign";
            if (isEditingAssignments && shift.assignedCoworkers && shift.assignedCoworkers.includes(cw.name)) { checkbox.checked = true; }
            label.appendChild(checkbox); label.appendChild(document.createTextNode(` ${cw.name}`));
            assignEditCoworkerListDiv.appendChild(label);
        });
        assignEditModal.classList.remove('hidden'); assignEditModal.style.display = 'flex';
    }

    if(assignEditCancelBtn) { assignEditCancelBtn.addEventListener('click', () => { assignEditModal.classList.add('hidden'); assignEditModal.style.display = 'none'; currentShiftForModal = null; });}

    if(assignEditSaveBtn) {
        assignEditSaveBtn.addEventListener('click', async () => {
            if (!currentShiftForModal) return;
            const selectedCoworkers = [];
            assignEditCoworkerListDiv.querySelectorAll('input[name="modalCoworkerAssign"]:checked').forEach(checkbox => { selectedCoworkers.push(checkbox.value); });
            const weekKey = currentShiftForModal.weekKey; const shiftId = currentShiftForModal.id;
            const weekDocRef = db.collection('shifts').doc(weekKey);
            try {
                await db.runTransaction(async (transaction) => {
                    const weekDoc = await transaction.get(weekDocRef); if (!weekDoc.exists) throw "Shift data not found!";
                    const weekData = weekDoc.data(); if (!weekData || !Array.isArray(weekData.shifts)) throw "Invalid week data.";
                    const shiftIndex = weekData.shifts.findIndex(s => s.id === shiftId); if (shiftIndex === -1) throw "Shift not found in week data!";
                    weekData.shifts[shiftIndex].assignedCoworkers = selectedCoworkers; weekData.shifts[shiftIndex].applicantName = ""; weekData.shifts[shiftIndex].applicants = [];
                    if (selectedCoworkers.length > 0) { weekData.shifts[shiftIndex].status = "approved"; } else { weekData.shifts[shiftIndex].status = "available"; }
                    transaction.update(weekDocRef, { shifts: weekData.shifts }); allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData));
                });
                assignEditModal.classList.add('hidden'); assignEditModal.style.display = 'none';
                await refreshManagerDashboard(); await prepareUserView(); currentShiftForModal = null;
            } catch (error) { console.error("Error saving assignments from modal:", error); await showAlert("Failed to save assignments: " + error.message); }
        });
    }
    function openCustomShiftCreationModal(shiftToEdit = null) {
        editingCustomShiftId = null;
        customShiftModalTitle.textContent = "Add New Custom Shift/Event"; saveCustomShiftBtn.textContent = "Add Custom Shift";
        const defaultDate = currentViewingDateMgr ? getMondayOfDate(new Date(currentViewingDateMgr)) : new Date();
        customShiftDateInput.value = defaultDate.toISOString().split('T')[0];
        customShiftStartTimeInput.value = ""; customShiftEndTimeInput.value = ""; customShiftDescriptionInput.value = "";
        customShiftAssignCoworkerListDiv.innerHTML = '';
        coworkers.sort((a, b) => a.name.localeCompare(b.name)).forEach(cw => {
            const checkboxId = `custom-modal-assign-cw-${cw.id || cw.name.replace(/\s+/g, '-')}`;
            const label = document.createElement('label'); const checkbox = document.createElement('input');
            checkbox.type = "checkbox"; checkbox.id = checkboxId; checkbox.value = cw.name; checkbox.name = "customModalCoworkerAssign";
            label.appendChild(checkbox); label.appendChild(document.createTextNode(` ${cw.name}`));
            customShiftAssignCoworkerListDiv.appendChild(label);
        });
        customShiftCreationModal.classList.remove('hidden'); customShiftCreationModal.style.display = 'flex';
    }
    if (showCustomShiftModalBtn) { showCustomShiftModalBtn.addEventListener('click', () => openCustomShiftCreationModal()); }
    if (cancelCustomShiftBtn) { cancelCustomShiftBtn.addEventListener('click', () => { customShiftCreationModal.classList.add('hidden'); customShiftCreationModal.style.display = 'none'; editingCustomShiftId = null; }); }
    if (saveCustomShiftBtn) {
        saveCustomShiftBtn.addEventListener('click', async () => {
            const shiftDateStr = customShiftDateInput.value; const startTime = customShiftStartTimeInput.value; const endTime = customShiftEndTimeInput.value; const description = customShiftDescriptionInput.value.trim();
            if (!shiftDateStr || !startTime || !endTime || !description) { await showAlert("Date, Start Time, End Time, and Description are required for custom shifts."); return; }
            if (startTime >= endTime) { await showAlert("Start time must be before end time."); return; }
            const selectedDate = new Date(shiftDateStr + "T00:00:00"); if (isNaN(selectedDate.getTime())) { await showAlert("Invalid date selected."); return; }
            const dayName = dayNames[selectedDate.getDay()]; const shiftTimeStr = `${startTime} - ${endTime}`;
            const selectedAssignees = []; customShiftAssignCoworkerListDiv.querySelectorAll('input[name="customModalCoworkerAssign"]:checked').forEach(checkbox => { selectedAssignees.push(checkbox.value); });
            const weekKey = getWeekKey(selectedDate); const shiftSpecificDateISO = selectedDate.toISOString();
            const newCustomShift = { id: `${weekKey}-${Date.now()}`, day: dayName, date: shiftSpecificDateISO, time: shiftTimeStr, status: selectedAssignees.length > 0 ? "approved" : "available", applicants: [], applicantName: "", description: description, assignedCoworkers: selectedAssignees };
            const weekDocRef = db.collection('shifts').doc(weekKey);
            try {
                await db.runTransaction(async (transaction) => {
                    const weekDoc = await transaction.get(weekDocRef); let weekData;
                    if (!weekDoc.exists) { weekData = { shifts: [], isPublished: false }; }
                    else { weekData = weekDoc.data(); if (!Array.isArray(weekData.shifts)) weekData.shifts = []; }
                    const existingShift = weekData.shifts.find(s => s.date.split('T')[0] === newCustomShift.date.split('T')[0] && s.time === newCustomShift.time && s.description === newCustomShift.description );
                    if (existingShift && !editingCustomShiftId) { throw new Error(`A custom shift for ${formatDate(selectedDate, false)} at ${shiftTimeStr} with description "${description}" already exists.`); }
                    weekData.shifts.push(newCustomShift); sortShiftsArray(weekData.shifts);
                    if (!weekDoc.exists) { transaction.set(weekDocRef, weekData); } else { transaction.update(weekDocRef, { shifts: weekData.shifts }); }
                    allShiftsData[weekKey] = JSON.parse(JSON.stringify(weekData));
                });
                customShiftCreationModal.classList.add('hidden'); customShiftCreationModal.style.display = 'none'; editingCustomShiftId = null;
                await showAlert(`Custom shift "${description}" on ${formatDate(selectedDate, false)} added.`);
                if (getWeekKey(currentViewingDateMgr) === weekKey) { await refreshManagerDashboard(); } else { delete allShiftsData[weekKey]; }
                await prepareUserView();
            } catch (error) { console.error("Error adding custom shift:", error); await showAlert("Failed to save custom shift: " + error.message); }
        });
    }

    function isValidEmail(email) { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email); }

    async function checkAndShowEmailPrompt() {
        if (loggedInCoworker && (!loggedInCoworker.email || loggedInCoworker.email.trim() === "") && !loggedInCoworker.emailReminderDisabled) {
            emailPromptInput.value = ""; emailPromptError.textContent = ""; emailPromptDontRemindCheckbox.checked = false;
            emailPromptModal.classList.remove('hidden'); emailPromptModal.style.display = 'flex';
        }
    }

    if (emailPromptSaveBtn) {
        emailPromptSaveBtn.addEventListener('click', async () => {
            console.log("DEBUG: emailPromptSaveBtn geklickt");
            const email = emailPromptInput.value.trim();
            const dontRemind = emailPromptDontRemindCheckbox.checked;
            emailPromptError.textContent = "";

            if (!email) {
                emailPromptError.textContent = "Please enter an email address or skip.";
                return;
            }
            if (!isValidEmail(email)) {
                emailPromptError.textContent = "Please enter a valid email address.";
                return;
            }

            try {
                await db.collection('coworkers').doc(loggedInCoworker.id || loggedInCoworker.name).update({
                    email: email,
                    emailReminderDisabled: dontRemind
                });
                loggedInCoworker.email = email;
                loggedInCoworker.emailReminderDisabled = dontRemind;
                const localCoworker = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                if (localCoworker) {
                    localCoworker.email = email;
                    localCoworker.emailReminderDisabled = dontRemind;
                }

                emailPromptModal.classList.add('hidden');
                emailPromptModal.style.display = 'none';
                await showAlert("Email address saved successfully!");

                console.log("DEBUG: E-Mail im Coworker-Dokument gespeichert (Prompt). Versuche nun, sendEmailNotification aufzurufen für:", email);
                const subject = "Your Email Address has been Registered!";
                const htmlBody = `<p>Hello ${loggedInCoworker.name},</p><p>Your email address (<strong>${email}</strong>) has been successfully registered with the Shift Scheduler.</p><p>Thank you!</p>`;
                const textBody = `Hello ${loggedInCoworker.name},\n\nYour email address (${email}) has been successfully registered with the Shift Scheduler.\n\nThank you!`;
                await sendEmailNotification(email, subject, htmlBody, textBody);

                if (!myAccountSettingsSection.classList.contains('hidden')) {
                    populateMyAccountDetails();
                }
            } catch (error) {
                console.error("Error saving email from prompt:", error);
                emailPromptError.textContent = "Failed to save email. Please try again.";
            }
        });
    }

    if (emailPromptSkipBtn) {
        emailPromptSkipBtn.addEventListener('click', async () => {
            const dontRemind = emailPromptDontRemindCheckbox.checked;
            if (dontRemind && loggedInCoworker) {
                try {
                    await db.collection('coworkers').doc(loggedInCoworker.id || loggedInCoworker.name).update({
                        emailReminderDisabled: true
                    });
                    loggedInCoworker.emailReminderDisabled = true;
                     const localCoworker = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                    if(localCoworker) localCoworker.emailReminderDisabled = true;
                } catch (error) {
                    console.error("Error setting 'don't remind' flag:", error);
                }
            }
            emailPromptModal.classList.add('hidden');
            emailPromptModal.style.display = 'none';
        });
    }
    function populateMyAccountDetails() {
        if (!loggedInCoworker) return;
        currentMyPasswordInput.value = ""; newMyPasswordInput.value = ""; confirmNewMyPasswordInput.value = "";
        myPasswordChangeError.textContent = ""; myPasswordChangeSuccess.textContent = "";
        myEmailInput.value = loggedInCoworker.email || "";
        myEmailDisplay.textContent = loggedInCoworker.email ? `Your current email: ${loggedInCoworker.email}` : "Your current email: Not set";
        deleteMyEmailBtn.classList.toggle('hidden', !loggedInCoworker.email);
        myEmailError.textContent = ""; myEmailSuccess.textContent = "";
    }

    if (myAccountBtn) {
        myAccountBtn.addEventListener('click', () => {
            populateMyAccountDetails(); myAccountSettingsSection.classList.remove('hidden');
            [latestPublishedScheduleSection, userShiftView, userCustomShiftsSection, myPastShiftsSection, myUpcomingShiftsSection, shiftTradeRequestsSection].forEach(s => { if(s) s.classList.add('hidden'); });
            myAccountSettingsSection.scrollIntoView({behavior: "smooth"});
        });
    }
    if(closeMyAccountSettingsBtn){
         closeMyAccountSettingsBtn.addEventListener('click', () => {
            myAccountSettingsSection.classList.add('hidden');
            if (loggedInCoworker) { prepareUserView(); } else { showCorrectView(); }
        });
    }

    if (submitMyPasswordChangeBtn) {
        submitMyPasswordChangeBtn.addEventListener('click', async () => {
            if (!loggedInCoworker) return;
            myPasswordChangeError.textContent = ""; myPasswordChangeSuccess.textContent = "";
            const currentPass = currentMyPasswordInput.value; const newPass = newMyPasswordInput.value; const confirmPass = confirmNewMyPasswordInput.value;
            if (currentPass !== loggedInCoworker.password) { myPasswordChangeError.textContent = "Current password incorrect."; return; }
            if (!newPass || newPass.length < 4) { myPasswordChangeError.textContent = "New password must be at least 4 characters."; return; }
            if (newPass !== confirmPass) { myPasswordChangeError.textContent = "New passwords do not match."; return; }
            try {
                await db.collection('coworkers').doc(loggedInCoworker.id || loggedInCoworker.name).update({ password: newPass });
                loggedInCoworker.password = newPass;
                const localCoworker = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                if(localCoworker) localCoworker.password = newPass;
                localStorage.setItem(ACTIVE_SESSION_USER_KEY, JSON.stringify({ name: loggedInCoworker.name, password: newPass }));
                myPasswordChangeSuccess.textContent = "Password changed successfully!";
                currentMyPasswordInput.value = ""; newMyPasswordInput.value = ""; confirmNewMyPasswordInput.value = "";
                setTimeout(() => { myPasswordChangeSuccess.textContent = ""; }, 3000);
            } catch (error) { console.error("Error changing own password:", error); myPasswordChangeError.textContent = "Failed to change password. Please try again."; }
        });
    }

    if (saveMyEmailBtn) {
        saveMyEmailBtn.addEventListener('click', async () => {
            console.log("DEBUG: saveMyEmailBtn geklickt");
            if (!loggedInCoworker) return;
            myEmailError.textContent = "";
            myEmailSuccess.textContent = "";
            const newEmail = myEmailInput.value.trim();

            if (!newEmail) {
                myEmailError.textContent = "Email address cannot be empty. To remove, use Delete Email.";
                return;
            }
            if (!isValidEmail(newEmail)) {
                myEmailError.textContent = "Please enter a valid email address.";
                return;
            }

            try {
                await db.collection('coworkers').doc(loggedInCoworker.id || loggedInCoworker.name).update({ email: newEmail });
                loggedInCoworker.email = newEmail;
                const localCoworker = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                if (localCoworker) localCoworker.email = newEmail;

                myEmailDisplay.textContent = `Your current email: ${newEmail}`;
                deleteMyEmailBtn.classList.remove('hidden');
                myEmailSuccess.textContent = "Email address updated!";
                setTimeout(() => { myEmailSuccess.textContent = ""; }, 3000);

                console.log("DEBUG: E-Mail im Coworker-Dokument gespeichert (MyAccount). Versuche nun, sendEmailNotification aufzurufen für:", newEmail);
                const subject = "Your Email Address has been Updated!";
                const htmlBody = `<p>Hello ${loggedInCoworker.name},</p><p>Your email address for the Shift Scheduler has been successfully updated to <strong>${newEmail}</strong>.</p><p>Thank you!</p>`;
                const textBody = `Hello ${loggedInCoworker.name},\n\nYour email address for the Shift Scheduler has been successfully updated to ${newEmail}.\n\nThank you!`;
                await sendEmailNotification(newEmail, subject, htmlBody, textBody);

            } catch (error) {
                console.error("Error saving email:", error);
                myEmailError.textContent = "Failed to save email. Please try again.";
            }
        });
    }

    if (deleteMyEmailBtn) {
        deleteMyEmailBtn.addEventListener('click', async () => {
            if (!loggedInCoworker) return;
            const confirmDelete = await showConfirm("Are you sure you want to delete your email address?");
            if (!confirmDelete) return;
            myEmailError.textContent = ""; myEmailSuccess.textContent = "";
            try {
                await db.collection('coworkers').doc(loggedInCoworker.id || loggedInCoworker.name).update({ email: "" });
                loggedInCoworker.email = "";
                const localCoworker = coworkers.find(c => c.id === loggedInCoworker.id || c.name === loggedInCoworker.name);
                if(localCoworker) localCoworker.email = "";
                myEmailInput.value = ""; myEmailDisplay.textContent = "Your current email: Not set"; deleteMyEmailBtn.classList.add('hidden');
                myEmailSuccess.textContent = "Email address deleted!"; setTimeout(() => { myEmailSuccess.textContent = ""; }, 3000);
            } catch (error) { console.error("Error deleting email:", error); myEmailError.textContent = "Failed to delete email. Please try again."; }
        });
    }

    if (sendTestEmailBtn) {
        sendTestEmailBtn.addEventListener('click', async () => {
            if (!loggedInCoworker || !loggedInCoworker.email) {
                if(testEmailStatus) testEmailStatus.textContent = "Please set and save your email address first.";
                await showAlert("No Email Set", "Please set and save your email address in 'Manage My Email Address' before sending a test email.");
                return;
            }

            if(testEmailStatus) testEmailStatus.textContent = "Sending test email...";
            console.log("DEBUG: sendTestEmailBtn geklickt. Sende Test-E-Mail an:", loggedInCoworker.email);

            const subject = "Test Email from Shift Scheduler Pro";
            const htmlBody = `<p>Hello ${loggedInCoworker.name},</p><p>This is a test email triggered by the 'Send Test Email' button in your account settings.</p><p>If you received this, the email sending mechanism is working!</p><p>Your registered email is: ${loggedInCoworker.email}</p>`;
            const textBody = `Hello ${loggedInCoworker.name},\n\nThis is a test email triggered by the 'Send Test Email' button in your account settings.\n\nIf you received this, the email sending mechanism is working!\n\nYour registered email is: ${loggedInCoworker.email}`;

            try {
                await sendEmailNotification(loggedInCoworker.email, subject, htmlBody, textBody);
                if(testEmailStatus) testEmailStatus.textContent = "Test email request sent! Check your inbox (and spam).";
                await showAlert("Test Email Sent", "The request to send a test email has been submitted. Please check your inbox (and spam folder) shortly.");
            } catch (error) {
                console.error("Error triggering test email:", error);
                if(testEmailStatus) testEmailStatus.textContent = "Error sending test email. Check console.";
                await showAlert("Error", "Could not send the test email. Please check the console for errors.");
            }
        });
    }

    if (cancelTradeOptionsBtn) {
        cancelTradeOptionsBtn.addEventListener('click', () => {
            tradeOptionsModal.classList.add('hidden');
            tradeOptionsModal.style.display = 'none';
            currentShiftToTrade = null;
        });
    }
    if (showSwapModalBtn) {
        showSwapModalBtn.addEventListener('click', handleShowSwapModal);
    }
    if(offerGiveawayBtn) {
        offerGiveawayBtn.addEventListener('click', handleOfferGiveaway);
    }
    if (cancelSwapShiftBtn) {
        cancelSwapShiftBtn.addEventListener('click', () => {
            swapShiftModal.classList.add('hidden');
            swapShiftModal.style.display = 'none';
            currentShiftToTrade = null;
        });
    }
    if (sendSwapRequestBtn) {
        sendSwapRequestBtn.addEventListener('click', handleSendSwapRequest);
    }

    if (showCoworkerManagerModalBtn) {
        showCoworkerManagerModalBtn.addEventListener('click', () => {
            renderCoworkerListForManager();
            coworkerManagementModal.classList.remove('hidden');
            coworkerManagementModal.style.display = 'flex';
        });
    }
    if (closeCoworkerManagerModalBtn) {
        closeCoworkerManagerModalBtn.addEventListener('click', () => {
            coworkerManagementModal.classList.add('hidden');
            coworkerManagementModal.style.display = 'none';
        });
    }

    if (showHoursSummaryModalBtn) {
        showHoursSummaryModalBtn.addEventListener('click', async () => {
            hoursSummaryModal.classList.remove('hidden');
            hoursSummaryModal.style.display = 'flex';
            await renderTotalHoursSummary();
        });
    }
    if (closeHoursSummaryModalBtn) {
        closeHoursSummaryModalBtn.addEventListener('click', () => {
            hoursSummaryModal.classList.add('hidden');
            hoursSummaryModal.style.display = 'none';
        });
    }

    if (addCoworkerBtnModal) {
        addCoworkerBtnModal.addEventListener('click', handleAddCoworker);
    }

    if (totalHoursPeriodSelectModal) {
        totalHoursPeriodSelectModal.addEventListener('change', renderTotalHoursSummary);
    }

    if(clearWeekShiftsBtn) {
        clearWeekShiftsBtn.addEventListener('click', handleClearWeekShifts);
    }

    coworkerLoginBtn.addEventListener('click', handleCoworkerLogin);
    loginPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCoworkerLogin(); });
    accessManagerPanelBtn.addEventListener('click', handleAccessManagerPanel);
    userLogoutBtn.addEventListener('click', logout);
    unlockManagerPanelBtn.addEventListener('click', handleUnlockManagerPanel);
    masterManagerPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUnlockManagerPanel(); });
    cancelManagerUnlockBtn.addEventListener('click', () => managerUnlockModal.classList.add('hidden'));
    switchToUserViewBtn.addEventListener('click', () => { isManagerModeActive = false; changeMasterPasswordSection.classList.add('hidden'); showCorrectView(); });
    managerDashboardLogoutBtn.addEventListener('click', logout);
    prevWeekBtnMgr.addEventListener('click', () => { currentViewingDateMgr.setDate(currentViewingDateMgr.getDate() - 7); refreshManagerDashboard(); });
    jumpToTargetWeekBtnMgr.addEventListener('click', () => { currentViewingDateMgr = getNextWeekStartDate(); refreshManagerDashboard(); });
    nextWeekBtnMgr.addEventListener('click', () => { currentViewingDateMgr.setDate(currentViewingDateMgr.getDate() + 7); refreshManagerDashboard(); });
    publishWeekBtn.addEventListener('click', handlePublishWeekToggle);
    showChangeMasterPassBtn.addEventListener('click', () => { changeMasterPasswordSection.classList.toggle('hidden'); changeMasterPassError.textContent = ""; changeMasterPassSuccess.textContent = ""; currentMasterPasswordInput.value = ""; newMasterPasswordInput.value = ""; confirmNewMasterPasswordInput.value = ""; });
    submitChangeMasterPassBtn.addEventListener('click', handleSubmitChangeMasterPassword);
    cancelChangeMasterPassBtn.addEventListener('click', () => { changeMasterPasswordSection.classList.add('hidden'); changeMasterPassError.textContent = ""; changeMasterPassSuccess.textContent = ""; });
    hoursViewTypeSelect.addEventListener('change', () => renderHoursOverview());

    if(viewStandardShiftsBtnMgr) {
        viewStandardShiftsBtnMgr.addEventListener('click', () => {
            currentManagerShiftView = 'standard';
            standardShiftsManagementSection.classList.remove('hidden');
            if(customShiftsManagementSection) customShiftsManagementSection.classList.add('hidden');
            viewStandardShiftsBtnMgr.classList.add('active-view');
            if(viewCustomShiftsBtnMgr) viewCustomShiftsBtnMgr.classList.remove('active-view');
            refreshManagerDashboard();
        });
    }
    if(viewCustomShiftsBtnMgr) {
        viewCustomShiftsBtnMgr.addEventListener('click', () => {
            currentManagerShiftView = 'custom';
            if(customShiftsManagementSection) customShiftsManagementSection.classList.remove('hidden');
            standardShiftsManagementSection.classList.add('hidden');
            if(viewCustomShiftsBtnMgr) viewCustomShiftsBtnMgr.classList.add('active-view');
            viewStandardShiftsBtnMgr.classList.remove('active-view');
            refreshManagerDashboard();
        });
    }

    if (prevUserAppWeekBtn) {
        prevUserAppWeekBtn.addEventListener('click', async () => {
            const earliestAllowedAppDate = getMondayOfDate(new Date());
            if (currentUserApplicationViewingDate && getMondayOfDate(new Date(currentUserApplicationViewingDate)).getTime() > earliestAllowedAppDate.getTime()) {
                currentUserApplicationViewingDate.setDate(currentUserApplicationViewingDate.getDate() - 7);
                await renderCurrentUserApplicationWeek();
            }
        });
    }
    if (nextUserAppWeekBtn) {
        nextUserAppWeekBtn.addEventListener('click', async () => {
            const defaultUserViewDateForBoundary = getNextWeekStartDate();
            const lastAllowedAppDateBoundary = new Date(defaultUserViewDateForBoundary);
            lastAllowedAppDateBoundary.setDate(defaultUserViewDateForBoundary.getDate() + (USER_APPLICATION_WEEKS_FORWARD * 7));

            if (currentUserApplicationViewingDate && getMondayOfDate(new Date(currentUserApplicationViewingDate)).getTime() < getMondayOfDate(new Date(lastAllowedAppDateBoundary)).getTime()) {
                currentUserApplicationViewingDate.setDate(currentUserApplicationViewingDate.getDate() + 7);
                await renderCurrentUserApplicationWeek();
            }
        });
    }
    prevPastPeriodBtn.addEventListener('click', () => { const viewType = pastShiftsViewTypeSelect.value; if (viewType === "weekly") { currentPastShiftViewDate.setDate(currentPastShiftViewDate.getDate() - 7); } else { currentPastShiftViewDate.setMonth(currentPastShiftViewDate.getMonth() - 1); } renderMyPastShifts(); });
    nextPastPeriodBtn.addEventListener('click', () => { const viewType = pastShiftsViewTypeSelect.value; if (viewType === "weekly") { currentPastShiftViewDate.setDate(currentPastShiftViewDate.getDate() + 7); } else { currentPastShiftViewDate.setMonth(currentPastShiftViewDate.getMonth() + 1); } renderMyPastShifts(); });
    pastShiftsViewTypeSelect.addEventListener('change', () => { currentPastShiftViewDate = getMondayOfDate(new Date()); renderMyPastShifts(); });

    initializeApp();
}