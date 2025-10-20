<!-- auth.js -->
<script>
  // Check if user is logged in
  const user = localStorage.getItem("loggedInUser");

  if (!user) {
    // Not logged in → redirect to login page
    window.location.href = "login.html";
  } else {
    // Optional: Parse and display name or phone if needed
    const loggedUser = JSON.parse(user);
    console.log("Logged in as:", loggedUser.name || loggedUser.phone);
  }
</script>
