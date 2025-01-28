// Utility Functions
function sanitizeInput(input) {
    return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function closeAuthPopup() {
    const authPopup = document.getElementById("authPopup");
    if (authPopup) {
        authPopup.style.display = "none";
    }
}

function updateUIForUser(user) {
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('username-display');
    const devButton = document.getElementById('devButton');
    const linkDurationInfo = document.getElementById('linkDuration');

    if (user) {
        userInfo.classList.remove('hidden');
        usernameDisplay.textContent = user.username;

        if (user.premium) {
            usernameDisplay.innerHTML += ' <span class="premium-badge">Premium</span>';
            linkDurationInfo.textContent = 'Links last for 4 months because you have premium';
        } else {
            linkDurationInfo.textContent = 'Links last for 1 month';
        }

        if (user.isDev) {
            usernameDisplay.innerHTML += ' <span class="dev-badge">DEV</span>';
            if (devButton) {
                devButton.classList.remove("hidden");
                devButton.addEventListener('click', toggleAdminPanel);
            }
        } else {
            if (devButton) {
                devButton.classList.add("hidden");
                devButton.removeEventListener('click', toggleAdminPanel);
            }
        }
    } else {
        userInfo.classList.add('hidden');
        usernameDisplay.textContent = '';
        if (devButton) {
            devButton.classList.add("hidden");
            devButton.removeEventListener('click', toggleAdminPanel);
        }
        linkDurationInfo.textContent = '';
    }
}

async function loginUser(username, password) {
    const sanitizedUsername = sanitizeInput(username);
    try {
        console.log('Attempting login with:', sanitizedUsername);
        const response = await fetch('https://admin.aurorasigner.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username: sanitizedUsername, password }),
        });
        const data = await response.json();
        console.log('Login response:', data);
        if (data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForUser(currentUser);
            closeAuthPopup();
            showNotification('Login successful!', 'success');
            checkLoginStatus();
        } else {
            showNotification(data.error || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    }
}

async function registerUser(username, password) {
    try {
        console.log('Attempting registration with:', username);
        const response = await fetch('https://admin.aurorasigner.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password }),
        });
        const data = await response.json();
        console.log('Registration response:', data);
        if (data.success) {
            showNotification('Registration successful. You can now log in.', 'success');
            // Switch to login mode
            isLoginMode = true;
            authTitle.textContent = "Login";
            authSubmit.textContent = "Login";
            authToggle.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
            privacyPolicyAgreement.style.display = "none";
            agreePrivacyPolicyCheckbox.required = false;
        } else {
            console.error('Registration failed:', data);
            showNotification(data.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred during registration. Please try again.', 'error');
    }
}

function checkLoginStatus() {
    const storedUser = localStorage.getItem('currentUser');
    currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (currentUser) {
        if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        updateUIForUser(currentUser);
    } else {
        if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
        updateUIForUser(null);
    }
    document.dispatchEvent(new Event('loginStatusChanged'));
    updateMaxFileSize();
}

function updateMaxFileSize() {
    if (currentUser && currentUser.premium) {
        maxFileSizeElement.textContent = '1.5 GB PREMIUM';
    } else {
        maxFileSizeElement.textContent = '1 GB';
    }
}

function createSnowflakes() {
    const existingSnowContainer = document.querySelector('.snow');
    if (existingSnowContainer) return; // Prevent multiple snow containers

    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow';
    document.body.appendChild(snowContainer);

    const snowPile = document.createElement('div');
    snowPile.className = 'snow-pile';
    document.querySelector('footer').appendChild(snowPile);

    for (let i = 0; i < 50; i++) {
        createSnowflake(snowContainer);
    }

    function createSnowflake(container) {
        const snowflake = document.createElement('span');
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        snowflake.style.width = snowflake.style.height = Math.random() * 4 + 2 + 'px';

        // Add animation end listener
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            createSnowflake(container);
        });

        container.appendChild(snowflake);
    }
}

function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    themeToggle.className = `fas ${themeIcons[theme]}`;
    currentTheme = theme;

    const existingSnow = document.querySelector('.snow');
    const existingSnowPile = document.querySelector('.snow-pile');
    if (existingSnow) {
        existingSnow.remove();
    }
    if (existingSnowPile) {
        existingSnowPile.remove();
    }

    if (theme === 'christmas-mode') {
        createSnowflakes();
    }
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        console.error('Admin panel element not found');
        return;
    }

    const isHidden = adminPanel.classList.toggle('hidden');

    if (!isHidden) {
        // Admin panel is now visible
        loadUsers(); // Ensure this function is defined
        addCloseButtonToAdminPanel();
    }
}

function addCloseButtonToAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;

    let closeButton = adminPanel.querySelector('.close-button');
    if (!closeButton) {
        closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = toggleAdminPanel;
        adminPanel.insertBefore(closeButton, adminPanel.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Variable Declarations
    const hamburger = document.querySelector('.hamburger');
    const navbarLinks = document.querySelector('.navbar-links');
    const form = document.getElementById("ASrequest");
    const resultDiv = document.getElementById("result");
    const loader = document.getElementById("loader");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const themeToggle = document.getElementById("themeToggle");
    const signInButton = document.getElementById("signInButton");
    const authPopup = document.getElementById("authPopup");
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authSubmit = document.getElementById("authSubmit");
    const authToggle = document.getElementById("authToggle");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("username-display");
    const privacyPolicyAgreement = document.getElementById("privacyPolicyAgreement");
    const agreePrivacyPolicyCheckbox = document.getElementById("agreePrivacyPolicy");
    const viewPrivacyPolicyLink = document.getElementById("viewPrivacyPolicy");
    const maxFileSizeElement = document.getElementById('maxFileSize');
    const linkDurationInfo = document.getElementById('linkDuration');
    const devButton = document.getElementById('devButton');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const toggleAuthPassword = document.getElementById("toggleAuthPassword");

    let currentTheme = "normal-mode";
    const themes = ["normal-mode", "light-mode", "dark-mode", "christmas-mode"];
    const themeIcons = {
        "normal-mode": "fa-star",
        "light-mode": "fa-sun",
        "dark-mode": "fa-moon",
        "christmas-mode": "fa-tree"
    };

    let rotation = 0;
    let isLoginMode = false;
    let currentUser = null;

    // Hamburger Menu Toggle
    if (hamburger && navbarLinks) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navbarLinks.classList.toggle('active');
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const nextThemeIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
            setTheme(themes[nextThemeIndex]);
            rotation += 359;
            if (rotation >= 360) {
                rotation = 0;
            }
            this.style.transform = `rotate(${rotation}deg)`;
        });

        const savedTheme = localStorage.getItem("theme") || "normal-mode";
        setTheme(savedTheme);
    }

    // Toggle Password Visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    // Form Submission for Signing IPA
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!currentUser) {
                showNotification("Please log in to sign IPAs", "error");
                return;
            }

            const ipaFile = document.getElementById('ipa').files[0];
            const maxSize = currentUser.premium ? 1.5 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;

            if (ipaFile && ipaFile.size > maxSize) {
                showNotification(`File size exceeds the ${currentUser.premium ? '1.5 GB' : '1 GB'} limit. ${currentUser.premium ? '' : 'Upgrade to premium for larger files.'}`, "error");
                return;
            }

            resultDiv.textContent = "";
            loader.classList.remove("hidden");

            const formData = new FormData(form);
            formData.append("isPremium", currentUser.premium ? 'true' : 'false');
            formData.append("expiryDays", currentUser.premium ? "120" : "30");
            formData.append("username", currentUser.username);

            const button = form.querySelector('button[type="submit"]');
            if (button) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                button.disabled = true;
            }

            try {
                const response = await fetch("https://api.aurorasigner.xyz/sign", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                handleSigningSuccess(result);
            } catch (error) {
                console.error("Error during signing request:", error);
                handleSigningError(error);
            } finally {
                if (button) {
                    button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign IPA';
                    button.disabled = false;
                }
            }
        });
    }

    function handleSigningSuccess(data) {
        loader.classList.add("hidden");
        if (data.install_url) {
            const installLink = document.createElement("a");
            installLink.href = data.install_url;
            installLink.textContent = "Install App";
            installLink.className = "install-link";
            resultDiv.appendChild(installLink);
            showNotification("IPA signed successfully!", "success");
        } else {
            console.error("Failed to obtain install link from response data.");
            throw new Error("Unable to get the install link");
        }
    }

    async function handleSigningError(error) {
        console.error("Signing process failed:", error);
        loader.classList.add("hidden");

        if (error.response) {
            if (error.response.status === 400) {
                error.response.json().then((data) => {
                    const errorMessage = data.error || "An error occurred. Please try again.";
                    resultDiv.textContent = `Error: ${errorMessage}`;
                    showNotification(errorMessage, "error");
                }).catch(() => {
                    resultDiv.textContent = "Error: Failed to sign. Please contact support.";
                    showNotification("Failed to sign. Please contact support.", "error");
                });
            } else {
                resultDiv.textContent = `Error: ${error.response.statusText || "An error occurred"}`;
                showNotification(`Error: ${error.response.statusText || "An error occurred"}`, "error");
            }
        } else {
            resultDiv.textContent = "An error occurred while signing, P12 password may be incorrect.";
            showNotification("An error occurred while signing, P12 password may be incorrect.", "error");
        }
    }

    // File Input Validation
    if (fileInputs.length > 0) {
        fileInputs.forEach((input) => {
            input.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file && !isValidFileType(file, input.id)) {
                    showNotification(
                        `Invalid file type for ${input.id}. Please select the correct file.`,
                        "error"
                    );
                    input.value = "";
                }
            });
        });
    }

    function isValidFileType(file, inputId) {
        const validTypes = {
            p12: [".p12"],
            mobileprovision: [".mobileprovision"],
            ipa: [".ipa"],
        };
        const fileExtension = file.name.split(".").pop().toLowerCase();
        return validTypes[inputId].includes(`.${fileExtension}`);
    }

    // Event listener for sign-in button
    if (signInButton) {
        signInButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentUser) {
                // Show sign-out confirmation
                if (confirm("Are you sure you want to sign out?")) {
                    currentUser = null;
                    localStorage.removeItem('currentUser');
                    checkLoginStatus();
                    showNotification("Signed out successfully", "success");
                }
            } else {
                if (authPopup) {
                    authPopup.style.display = "block";
                } else {
                    console.error("Auth popup not found");
                }
            }
        });
    }

    // Event listener for auth form toggle (Login/Sign Up)
    if (authToggle) {
        authToggle.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
            authSubmit.textContent = isLoginMode ? "Login" : "Sign Up";
            authToggle.innerHTML = isLoginMode ? 'Don\'t have an account? <a href="#">Sign Up</a>' : 'Already have an account? <a href="#">Login</a>';
            privacyPolicyAgreement.style.display = isLoginMode ? "none" : "block";
            agreePrivacyPolicyCheckbox.required = !isLoginMode;
        });
    }

    // Event listener for auth form submission
    if (authForm) {
        authForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("auth-username").value;
            const password = document.getElementById("auth-password").value;

            if (isLoginMode) {
                await loginUser(username, password);
            } else {
                await registerUser(username, password);
            }
        });
    }

    // Toggle Password Visibility in Auth Form
    if (toggleAuthPassword) {
        toggleAuthPassword.addEventListener("click", function () {
            const passwordInput = document.getElementById("auth-password");
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    // Close Auth Popup when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === authPopup) {
            authPopup.style.display = "none";
        }
    });

    // Close buttons for popups
    document.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
            closeButton.closest(".popup").style.display = "none";
        });
    });

    // File input button labels
    const fileButtons = document.querySelectorAll(".file-button");
    fileButtons.forEach((button) => {
        button.addEventListener("click", () => {
            button.previousElementSibling.click();
        });
    });

    fileInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            const fileName = event.target.files[0] ? event.target.files[0].name : 'No file chosen';
            const label = input.nextElementSibling;
            label.textContent = fileName;
        });
    });

    // Check login status on page load
    checkLoginStatus();

    // Update max file size based on current user's status
    updateMaxFileSize();

    // Customization Menu Modal
    const customizationModal = document.getElementById("customizationMenuModal");
    const customizationButton = document.getElementById("customizationMenuButton");
    const customizationClose = customizationModal ? customizationModal.getElementsByClassName("close")[0] : null;

    if (customizationButton && customizationModal) {
        customizationButton.onclick = function () {
            customizationModal.style.display = "block";
            document.body.classList.add('modal-open');
        }
    }

    if (customizationClose) {
        customizationClose.onclick = function () {
            customizationModal.style.display = "none";
            document.body.classList.remove('modal-open');
        }
    }

    window.onclick = function (event) {
        if (event.target == customizationModal) {
            customizationModal.style.display = "none";
            document.body.classList.remove('modal-open');
        }
    }

    // Accordion for Cyan Tweaks
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }

    // Checkbox Containers
    const checkboxContainers = document.querySelectorAll('.checkbox-container');
    checkboxContainers.forEach(container => {
        const checkbox = container.querySelector('input[type="checkbox"]');

        container.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            container.classList.toggle('active', checkbox.checked);
        });
    });

    // Dropdown Containers
    const dropdownContainers = document.querySelectorAll('.dropdown-container');
    dropdownContainers.forEach(container => {
        const button = container.querySelector('.dropdown-button');

        button.addEventListener('click', () => {
            container.classList.toggle('active');
        });

        window.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                container.classList.remove('active');
            }
        });
    });

    // Compression Level Dropdown
    const compressionDropdownOptions = document.querySelectorAll('.dropdown-option');
    const compressionDropdownToggle = document.querySelector('.dropdown-toggle-button');
    const compressionDropdownContainer = document.querySelector('.dropdown-container');

    if (compressionDropdownToggle && compressionDropdownContainer) {
        compressionDropdownToggle.addEventListener('click', () => {
            compressionDropdownContainer.classList.toggle('hidden');
        });

        compressionDropdownOptions.forEach(option => {
            option.addEventListener('click', () => {
                compressionDropdownOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const selectedValue = option.getAttribute('data-value');
                console.log('Selected Compression Level:', selectedValue);
                compressionDropdownContainer.classList.add('hidden');
            });
        });
    }

    // Overwrite Checkbox
    const overwriteContainer = document.getElementById('cyan_overwrite_container');
    const overwriteCheckbox = document.getElementById('overwriteCheckbox');

    if (overwriteContainer && overwriteCheckbox) {
        overwriteContainer.classList.toggle('active', overwriteCheckbox.checked);
        overwriteContainer.classList.toggle('inactive', !overwriteCheckbox.checked);

        overwriteContainer.addEventListener('click', function () {
            overwriteCheckbox.checked = !overwriteCheckbox.checked;
            overwriteContainer.classList.toggle('active', overwriteCheckbox.checked);
            overwriteContainer.classList.toggle('inactive', !overwriteCheckbox.checked);
        });
    }

    // Check Admin Panel Access
    function checkAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (currentUser && currentUser.isDev) {
            if (devButton) {
                devButton.classList.remove('hidden');
                devButton.onclick = toggleAdminPanel;
            }
        } else {
            if (devButton) devButton.classList.add('hidden');
            if (adminPanel) adminPanel.classList.add('hidden');
        }
    }

    // Load Users Function (to be implemented)
    async function loadUsers() {
        // Implement user loading functionality here
    }

    // Call checkAdminPanel on page load
    checkAdminPanel();

    // Update UI when login status changes
    document.addEventListener('loginStatusChanged', () => {
        updateUIForUser(currentUser);
        checkAdminPanel();
    });

});
