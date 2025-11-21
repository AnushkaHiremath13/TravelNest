document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const passwordInput = document.getElementById("signupPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const toggleIcons = document.querySelectorAll(".toggle-password");
    const submitButton = form.querySelector(".login-btn");
    const btnText = submitButton.querySelector(".btn-text");
    const spinner = submitButton.querySelector(".loading-spinner");

    // Password toggle (show/hide)
    toggleIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const input = this.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");
            } else {
                input.type = "password";
                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");
            }
        });
    });

    // Email Validation Function
    function isValidEmail(email) {
        // Simple regex for email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Form validation
    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent form from submitting normally

        const fullName = form.querySelector("input[placeholder='Full Name']").value.trim();
        const email = form.querySelector("input[type='email']").value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const termsChecked = form.querySelector("input[type='checkbox']").checked;

        // Check for empty fields
        if (!fullName || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        // Check valid email format
        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Check Terms and Conditions
        if (!termsChecked) {
            alert("Please accept the Terms & Conditions.");
            return;
        }

        // Check password match
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Show loading spinner
        btnText.style.display = "none";
        spinner.style.display = "block";

        // Simulate signup delay (like API call)
        setTimeout(() => {
            alert("Signup successful!");
            // Reset form and button after simulation
            form.reset();
            btnText.style.display = "inline-block";
            spinner.style.display = "none";
        }, 2000);
    });
});
