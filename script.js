const CONFIG = {
  formspreeUrl: "https://formspree.io/f/xkjgowyo",
  redirectUrl: "https://homedesigns.ai/",
};

const form = document.getElementById("signup-form");
const emailInput = document.getElementById("email-input");
const formMsg = document.getElementById("form-message");
const submitBtn = document.getElementById("submit-btn");

function storeEmail(email, valid) {
  try {
    const all = JSON.parse(localStorage.getItem("email_site_signups") || "[]");
    all.push({ email, valid: !!valid, at: new Date().toISOString() });
    localStorage.setItem("email_site_signups", JSON.stringify(all));
  } catch (e) {}
}

function setMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = "form-message " + (type || "");
}

async function sendToFormspree(email, valid) {
  const payload = {
    email,
    valid: !!valid,
    page: location.href,
    referrer: document.referrer || "direct",
    time: new Date().toISOString(),
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(CONFIG.formspreeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
    } catch (err) {
      if (attempt === 3) return false;
      await new Promise((r) => setTimeout(r, 700 * attempt));
    }
  }
  return false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const valid = emailInput.validity.valid && email !== "";
  storeEmail(email, valid);

  if (!valid) {
    emailInput.classList.add("invalid");
    setMsg("Please enter a valid email first.", "bad");
    setTimeout(() => emailInput.classList.remove("invalid"), 500);
    return;
  }

  form.reset();
  setMsg("Thank you for joining the Home Designs AI newsletter — you're on the waitlist to get tips, tools and special discounts.", "ok");
  const ok = await sendToFormspree(email, true);
  if (!ok) {
    setMsg("Something went wrong. Please try again.", "bad");
    return;
  }
  setTimeout(() => {
    window.location.href = CONFIG.redirectUrl;
  }, 2500);
});
