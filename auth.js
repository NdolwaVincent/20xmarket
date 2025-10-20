<script>
  const userData = localStorage.getItem("loggedInUser");
  if (!userData) {
    window.location.href = "login.html";
  } else {
    const user = JSON.parse(userData);
    if (Date.now() > user.expiry) {
      localStorage.removeItem("loggedInUser");
      alert("Your session has expired. Please log in again.");
      window.location.href = "login.html";
    }
  }
</script>
