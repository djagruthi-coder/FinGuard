/* ============================================================
   login.js – Simple demo login storing name, phone, and bank locally
   ============================================================ */

'use strict';

const USER_SESSION_KEY = 'finguardUser';

function getSavedUser() {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to parse user session', err);
    return null;
  }
}

function saveUserSession(user) {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
}

function redirectToDashboard() {
  window.location.href = 'dashboard.html';
}

function isDigits(value, length) {
  return new RegExp('^\\d{' + length + '}$').test(value);
}

function showMessage(message, isError = true) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? '#d93025' : 'rgb(0, 114, 255)';
}

function clearMessage() {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = '';
}

function initLogin() {
  const saved = getSavedUser();
  if (saved && saved.mobile) {
    redirectToDashboard();
    return;
  }

  const nameInput = document.getElementById('fullName');
  const mobileInput = document.getElementById('mobile');
  const bankInput = document.getElementById('bank');
  const form = document.getElementById('login-form');

  if (!nameInput || !mobileInput || !bankInput || !form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage();

    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const bank = bankInput.value.trim();

    if (name.length < 2) {
      showMessage('Please enter your full name.');
      nameInput.focus();
      return;
    }

    if (!isDigits(mobile, 10)) {
      showMessage('Please enter a valid 10-digit mobile number.');
      mobileInput.focus();
      return;
    }

    const profile = { name, mobile, bank, loggedInAt: new Date().toISOString() };
    saveUserSession(profile);
    if (window.FinGuardDB && window.FinGuardDB.saveUserProfile) {
      window.FinGuardDB.saveUserProfile(profile).catch(() => {});
    }

    showMessage('Login successful! Redirecting…', false);
    setTimeout(redirectToDashboard, 450);
  });

  initVoiceAssistant();
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const langSelect = document.getElementById('voice-lang');
  const lang = langSelect?.value || 'en-US';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function initVoiceAssistant() {
  const btn = document.getElementById('voiceBtn');
  if (!btn) return;

  const nameInput = document.getElementById('fullName');
  const mobileInput = document.getElementById('mobile');
  const bankInput = document.getElementById('bank');
  const langSelect = document.getElementById('voice-lang');
  const messageEl = document.getElementById('message');

  let recognition;
  let listening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btn.title = 'Speech recognition not supported in this browser';
    btn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = (langSelect && langSelect.value) ? langSelect.value : 'en-US';

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      recognition.lang = langSelect.value;
    });
  }

  recognition.onstart = () => {
    listening = true;
    btn.textContent = '🛑';
    btn.style.background = '#fb7185';
    showMessage('Listening... speak your name, phone, or bank number.', false);
  };

  recognition.onend = () => {
    listening = false;
    btn.textContent = '🎤';
    btn.style.background = '#5f259f';
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    showMessage(`Heard: "${text}"`, false);
    parseVoiceCommand(text, { nameInput, mobileInput, bankInput });
  };

  recognition.onerror = () => {
    showMessage('Voice recognition error, please try again.', true);
  };

  btn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    recognition.start();
  });
}

function parseVoiceCommand(text, inputs) {
  const { nameInput, mobileInput, bankInput } = inputs;
  const langSelect = document.getElementById('voice-lang');
  const lang = langSelect?.value || 'en-US';
  const lower = text.toLowerCase();

  // Name detection (English + Hindi/Telugu/Tamil)
  const namePatterns = [
    /(?:name is|my name is|i am|i'm)\s+(.+)/i,
    /(?:मेरा नाम(?: है)?|मेरा नाम)\s+(.+)/i,
    /(?:నా పేరు)\s+(.+)/i,
    /(?:என் பெயர்)\s+(.+)/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      nameInput.value = match[1].trim();
      const greeting = {
        'hi-IN': `नमस्ते ${nameInput.value}, मिलकर अच्छा लगा।`,
        'te-IN': `హలో ${nameInput.value}, కలవడం ఆనందంగా ఉంది.`,
        'ta-IN': `வணக்கம் ${nameInput.value}, சந்தித்ததில் மகிழ்ச்சி.`,
      }[lang];
      speak(greeting || `Hello ${nameInput.value}, nice to meet you.`);
      return;
    }
  }

  // Mobile number detection
  if (/[0-9]/.test(text)) {
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 10) {
      mobileInput.value = digits.slice(-10);
      const confirmation = {
        'hi-IN': 'फोन नंबर सेट किया गया।',
        'te-IN': 'ఫోన్ నంబర్ సెట్ చేయబడింది.',
        'ta-IN': 'போன் எண் அமைக்கப்பட்டது.',
      }[lang];
      speak(confirmation || 'Phone number set.');
      return;
    }
  }

  // Bank account detection
  const bankPatterns = [
    /(?:bank(?: account)? number(?: is)? )(.+)/i,
    /(?:बैंक(?: खाता)?(?: संख्या)?(?: है)? )(.+)/i,
    /(?:బ్యాంక్(?: ఖాతా)?(?: నెంబర్)? )(.+)/i,
    /(?:வங்கி(?: கணக்கு)?(?: எண்)? )(.+)/i,
  ];
  for (const pattern of bankPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      bankInput.value = match[1].trim();
      const confirmation = {
        'hi-IN': 'बैंक खाते की जानकारी अपडेट की गई।',
        'te-IN': 'బ్యాంక్ ఖాతా వివరాలు నవీకరించబడ్డాయి.',
        'ta-IN': 'வங்கி கணக்கு விவரம் புதுப்பிக்கப்பட்டது.',
      }[lang];
      speak(confirmation || 'Bank account updated.');
      return;
    }
  }

  // Help / instructions
  const helpTriggers = ['help', 'मदद', 'ఉపాయం', 'உதவி'];
  if (helpTriggers.some((w) => lower.includes(w))) {
    const hint = {
      'hi-IN': 'अपने नाम, फ़ोन नंबर या बैंक खाता कहें। फिर Proceed दबाएँ।',
      'te-IN': 'మీ పేరు, ఫోన్ నెంబర్ లేదా బ్యాంక్ ఖాతాను చెప్పండి. తర్వాత Proceed నొక్కండి.',
      'ta-IN': 'உங்கள் பெயர், கைபேசி எண், அல்லது வங்கி கணக்கை சொல்லுங்கள். பின்னர் Proceed ஐ அழுத்துங்கள்.',
    }[lang];
    speak(hint || 'Say your name, phone number, or bank account to fill the form. Then press proceed.');
    return;
  }

  const fallback = {
    'hi-IN': 'माफ़ कीजिए, मैं समझ नहीं पाया। आप नाम, फ़ोन या बैंक खाता कह सकते हैं।',
    'te-IN': 'క్షమించండి, నేను అర్థం చేసుకోలేను. మీరు పేరు, ఫోన్ లేదా బ్యాంక్ ఖాతాను చెప్పండి.',
    'ta-IN': 'நான் புரிந்து கொள்ளவில்லை. உங்கள் பெயர், போன் அல்லது வங்கி கணக்கை கூறலாம்.',
  }[lang];
  speak(fallback || 'Sorry, I did not understand. You can say your name, phone, or bank number.');
}

window.addEventListener('load', initLogin);
