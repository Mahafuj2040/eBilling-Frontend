
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");
  const usernameInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const validUsername = "adminlog";
  const validPassword = "adminlog@@@@#";

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredUsername = usernameInput.value.trim();
    const enteredPassword = passwordInput.value.trim();

    if (enteredUsername === validUsername && enteredPassword === validPassword) {
      const successModalEl = document.getElementById("successModal");
      const successModal = new bootstrap.Modal(successModalEl);

      successModal.show();

      // Proceed button redirect
      document.getElementById("proceedBtn").addEventListener("click", function () {
        window.location.href = "admin.html";
      });

    } else {
      const invalidModal = new bootstrap.Modal(document.getElementById("invalidModal"));
      invalidModal.show();
    }
  });
});
