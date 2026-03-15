/* ============================================================
   chatbot.js – FinGuard AI Chatbot with smart responses
   ============================================================ */

'use strict';

const CHAT_CONTEXT_AWARE = {
  subscriptions: [
    'Your active subscriptions are:\n• 🎬 Netflix – ₹649/mo\n• 🎵 Spotify Premium – ₹119/mo\n• 📺 Amazon Prime – ₹179/mo\n• 📡 Hotstar – ₹299/mo\n• ☁️ Dropbox Plus – ₹999/mo\n• 🎨 Adobe Creative – ₹1,675/mo\n• 💪 Gym Membership – ₹1,499/mo\n• 💼 LinkedIn Premium – ₹2,399/mo\n\n📊 **Total: ₹7,818/month** (₹93,816/year)\n\nWould you like to identify which ones you can cancel to save money?'
  ],
  fraud: [
    '🚨 You have **3 fraud alerts** that need your attention:\n\n1. **Amazon US** – ₹1,42,400 on 13 Mar\n   → Foreign transaction + Amount 37× above average\n\n2. **Unknown Merchant (Nigeria)** – ₹58,000 on 12 Mar\n   → High-risk country + Late night transaction\n\n3. **PayPal Transfer** – ₹89,000 on 11 Mar\n   → Duplicate attempt within 3 minutes\n\n⚠️ **Recommended action**: Contact your bank immediately for transactions #1 and #2. Mark #3 only if you initiated it.'
  ],
  tips: [
    '💡 **Top savings tips based on your spending:**\n\n1. Your entertainment subscriptions cost ₹3,125/mo. Consider cutting 1-2 streaming services to save ~₹800/mo.\n\n2. Food delivery (Swiggy/Zomato) cost ₹1,300+ this week. Cooking at home 3× per week could save ₹3,000/month.\n\n3. LinkedIn Premium at ₹2,399/mo is your biggest subscription. Evaluate if it brings direct ROI.\n\n4. Your December spending was ₹51,000 vs monthly average ₹35,000 — holiday spike. Plan a festival budget next time.',
  ],
  vault: [
    '🔐 **What to store in your Digital Asset Vault:**\n\n• 🏦 **Bank Accounts** – Account numbers, branch details, nominee info\n• ₿ **Crypto Wallets** – Wallet addresses, exchange logins (NOT seed phrase digitally!)\n• 📈 **Investments** – Demat account, Zerodha/Groww details, MF folios\n• 🛡️ **Insurance** – Policy numbers, sum assured, agent contacts, renewal dates\n• 🔑 **Passwords** – Master password hints, 2FA backup codes\n\n⚠️ **Never** store crypto seed phrases digitally. Write them on paper and store physically.',
    '🔐 **Digital Inheritance Tips:**\n\nTo ensure your family can access your assets:\n1. Add emergency contacts to every asset in the vault\n2. Use the "Emergency Share" button to print a physical copy\n3. Store the print in a bank locker or fireproof safe\n4. Update the vault quarterly or after major financial changes\n5. Inform your trusted family member about the vault\'s existence (not the PIN)'
  ],
  balance: [
    '💰 Your current financial overview:\n\n• **Total Balance**: ₹4,82,340\n• **Monthly Income**: ₹85,000\n• **Monthly Spend**: ₹38,650 (45.5% of income)\n• **Net Savings**: ₹46,350/month\n\n📊 Spending breakdown:\n→ Shopping: ₹8,400 (22%)\n→ Subscriptions: ₹3,847 (10%)\n→ Food: ₹6,200 (16%)\n→ EMI: ₹12,000 (31%)\n\nYour savings rate of 54.5% is excellent! 👏'
  ],
  crypto: [
    '₿ **Crypto Wallet Security Tips:**\n\n1. **Never store seed phrases digitally** — write on durable paper, store in fireproof safe\n2. Use hardware wallets (Ledger, Trezor) for holdings over ₹50,000\n3. Enable 2FA on all exchange accounts\n4. Keep exchange holdings minimal — use cold storage for long-term\n5. Store wallet addresses in your FinGuard vault for family reference\n6. Split large holdings across multiple wallets\n\n🔐 You have 1 crypto wallet in your vault (₹12,50,000 in Bitcoin cold storage)'
  ],
  payments: [
    '📲 **How to pay bills in FinGuard:**\n\n1. Go to the **Payments & Bills** section\n2. Select your utility (Gas, Water, Mobile, etc.)\n3. Enter your Customer ID and amount\n4. Enter your 4-digit UPI PIN (Demo: 1234)\n\n✅ You\'ll earn a scratch card for every payment above ₹500!'
  ],
  travel: [
    '✈️ **Booking Travel with FinGuard:**\n\nI can help you find flights, hotels, trains, and even book an Uber! \n\nGo to the **Travel & Booking** section, select your destination, and I\'ll search for the best prices. Once you confirm, you can pay securely using your linked bank account.'
  ],
  rewards: [
    '🎁 **Rewards & Scratch Cards:**\n\nYou currently have **2 unused scratch cards**! \n\nYou can reveal cashbacks or vouchers by visiting the **Rewards** section. Remember, every major payment or booking earns you more rewards. 🥳'
  ],
  general: [
    'I\'m FinGuard AI, your personal financial security assistant! 🛡️\n\nI can help you with:\n• 📊 Understanding your spending patterns\n• 🚨 Explaining fraud alerts\n• 🔄 Managing subscriptions\n• 🔐 Digital asset vault & inheritance\n• 💡 Financial tips & savings advice\n\nWhat would you like to know?',
    'Great question! Here are some quick stats about your finances:\n\n• You\'ve spent ₹38,650 this month\n• You have 3 unreviewed fraud alerts\n• Your subscriptions cost ₹3,847/month\n• Your digital vault has 6 assets worth ~₹29.6L\n\nWant me to dive deeper into any of these?'
  ]
};

const KEYWORD_MAP = [
  { keywords: ['subscription', 'subscriptions', 'recurring', 'auto-pay', 'auto pay', 'netflix', 'spotify'], category: 'subscriptions' },
  { keywords: ['fraud', 'suspicious', 'alert', 'flagged', 'unusual', 'fake', 'scam'], category: 'fraud' },
  { keywords: ['tip', 'tips', 'save', 'saving', 'reduce', 'cut', 'budget', 'spending'], category: 'tips' },
  { keywords: ['vault', 'inherit', 'emergency', 'asset', 'store', 'protect', 'family', 'death', 'nominee'], category: 'vault' },
  { keywords: ['balance', 'account', 'total', 'money', 'income', 'salary', 'net'], category: 'balance' },
  { keywords: ['crypto', 'bitcoin', 'wallet', 'blockchain', 'seed', 'phrase', 'cold'], category: 'crypto' },
  { keywords: ['pay', 'bill', 'recharge', 'gas', 'water', 'electricity', 'mobile', 'upi'], category: 'payments' },
  { keywords: ['travel', 'flight', 'hotel', 'train', 'bus', 'cab', 'uber', 'book'], category: 'travel' },
  { keywords: ['reward', 'cashback', 'scratch', 'coin', 'offer'], category: 'rewards' },
];

const SUPPORTED_LANGUAGES = {
  'en-US': 'English',
  'hi-IN': 'हिन्दी',
  'te-IN': 'తెలుగు',
  'ta-IN': 'தமிழ்',
};

let chatHistory = [];
let isTyping = false;
let isListening = false;
let recognition = null;

function getActiveLanguage() {
  const select = document.getElementById('chat-lang');
  if (!select) return 'en-US';
  return select.value || 'en-US';
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  const lang = getActiveLanguage();
  const utterance = new SpeechSynthesisUtterance(localizeMessage(text, lang));
  utterance.lang = lang;
  utterance.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function localizeMessage(text, lang) {
  if (lang === 'hi-IN') {
    // Basic Hindi translations for common phrases
    return text
      .replace('👋 Hello! I\'m FinGuard AI. How can I help you protect your finances today?', '👋 नमस्ते! मैं FinGuard AI हूँ। मैं आपकी वित्तीय सुरक्षा में कैसे मदद कर सकता हूँ?')
      .replace('😊 You\'re welcome! Your financial security is my priority. Anything else I can help with?', '😊 आपका स्वागत है! आपकी वित्तीय सुरक्षा मेरी प्राथमिकता है। क्या और कुछ चाहिए?')
      .replace('I\'m FinGuard AI, your personal financial security assistant!', 'मैं FinGuard AI हूँ, आपका वित्तीय सुरक्षा सहायक!')
      .replace(/✅ Sure! Opening \*\*(.*?)\*\*/g, '✅ ठीक है! मैं **$1** खोल रहा हूँ...')
      .replace('That\'s an interesting question! Could you rephrase it?', 'यह एक दिलचस्प प्रश्न है! क्या आप इसे फिर से कह सकते हैं?');
  }
  if (lang === 'te-IN') {
    // Basic Telugu translations for common phrases
    return text
      .replace('👋 Hello! I\'m FinGuard AI. How can I help you protect your finances today?', '👋 నమస్కారం! నేను FinGuard AI ని. మీ ఆర్థికాలను రక్షించడానికి ఎలా సహాయం చేయవచ్చు?')
      .replace('😊 You\'re welcome! Your financial security is my priority. Anything else I can help with?', '😊 మీకు స్వాగతం! మీ ఆర్థిక భద్రత నా ప్రాధాన్యత. మరేదైనా కావాలా?')
      .replace('I\'m FinGuard AI, your personal financial security assistant!', 'నేను FinGuard AI, మీ వ్యక్తిగత ఆర్థిక భద్రత సహాయకుడు!')
      .replace(/✅ Sure! Opening \*\*(.*?)\*\*/g, '✅ సరే! **$1** ను ఇప్పుడు తెరవుతున్నాను...')
      .replace('That\'s an interesting question! Could you rephrase it?', 'ఆది ఒక ఆసక్తికర ప్రశ్న! దాన్ని మళ్లీ చెప్పగలరా?');
  }
  if (lang === 'ta-IN') {
    // Basic Tamil translations for common phrases
    return text
      .replace('👋 Hello! I\'m FinGuard AI. How can I help you protect your finances today?', '👋 வணக்கம்! நான் FinGuard AI. உங்கள் நிதியை பாதுகாக்க நான் எப்படி உதவலாம்?')
      .replace('😊 You\'re welcome! Your financial security is my priority. Anything else I can help with?', '😊 வரவேற்கிறேன்! உங்கள் நிதி பாதுகாப்பே என் முக்கியம். இன்னும் ஏதும் உதவ வேண்டுமா?')
      .replace('I\'m FinGuard AI, your personal financial security assistant!', 'நான் FinGuard AI, உங்கள் தனிப்பட்ட நிதி பாதுகாப்பு உதவியாளர்!')
      .replace(/✅ Sure! Opening \*\*(.*?)\*\*/g, '✅ சரி! **$1** இனை இப்போது திறக்கிறேன்...')
      .replace('That\'s an interesting question! Could you rephrase it?', 'அது ஒரு சுவாரஸ்யமான கேள்வி! தயவுசெய்து அதை மறுபடி சொல்ல முடியுமா?');
  }
  return text;
}

function initVoiceAssistant() {
  const btn = document.getElementById('chat-voice-btn');
  const langSelect = document.getElementById('chat-lang');
  const statusDot = document.querySelector('.chatbot-header .status-dot');

  if (!btn || !langSelect) return;

  // Setup language options (in case UI is added dynamically)
  langSelect.innerHTML = Object.entries(SUPPORTED_LANGUAGES)
    .map(([code, label]) => `<option value="${code}">${label}</option>`)
    .join('');

  // Ensure a valid default
  if (!SUPPORTED_LANGUAGES[langSelect.value]) {
    langSelect.value = 'en-US';
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btn.title = 'Speech recognition not supported in this browser';
    btn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = getActiveLanguage();

  langSelect.addEventListener('change', () => {
    if (recognition) recognition.lang = getActiveLanguage();
  });

  recognition.onstart = () => {
    isListening = true;
    if (statusDot) statusDot.style.background = '#fbbf24';
    btn.textContent = '🛑';
    btn.title = 'Stop listening';
  };
  recognition.onend = () => {
    isListening = false;
    if (statusDot) statusDot.style.background = '#4ade80';
    btn.textContent = '🎙️';
    btn.title = 'Speak your question';
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) input.value = transcript;
    sendChat();
  };
  recognition.onerror = () => {
    isListening = false;
    if (statusDot) statusDot.style.background = '#f87171';
  };

  btn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    recognition.lang = getActiveLanguage();
    recognition.start();
  });

  // Expose a global helper so pages can trigger voice input from outside the chatbot UI.
  window.startVoiceAssistant = () => {
    if (!recognition) return;

    const chatWindow = document.getElementById('chatbot-window');
    if (chatWindow && !chatWindow.classList.contains('open')) {
      toggleChat();
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    recognition.lang = getActiveLanguage();
    recognition.start();
  };
}

window.addEventListener('load', initVoiceAssistant);

function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input || isTyping) return;
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  appendMessage('user', message);
  chatHistory.push({ role: 'user', text: message });

  // Show typing indicator
  const typingId = showTyping();
  isTyping = true;

  // Simulate AI thinking delay
  const delay = 800 + Math.random() * 800;
  setTimeout(() => {
    removeTyping(typingId);
    const response = generateResponse(message);
    const lang = getActiveLanguage();
    const localized = localizeMessage(response, lang);
    appendMessage('bot', localized);
    chatHistory.push({ role: 'bot', text: localized });
    speakText(localized);
    isTyping = false;
  }, delay);
}

function normalizeUserMessageForIntent(message, lang) {
  let lower = message.toLowerCase();

  if (lang === 'hi-IN') {
    // Map common Hindi phrases to English keywords used in intent detection
    lower = lower
      .replace(/डैशबोर्ड|होम|घर/g, 'dashboard')
      .replace(/लेन[ -]?देन|ट्रां?ज़?ैक्श?n?s?/g, 'transactions')
      .replace(/भुगतान|बिल|पेमेंट/g, 'payments')
      .replace(/इनाम|पुरस्कार|रिवॉर्ड/g, 'rewards')
      .replace(/यात्रा|ट्रैवल/g, 'travel')
      .replace(/वॉल्ट|कोष|एसेट|संपत्ति/g, 'vault')
      .replace(/धन्यवाद|शुक्रिया|थैंक्स/g, 'thanks')
      .replace(/मदद|हेल्प/g, 'help');
  }

  if (lang === 'te-IN') {
    // Map common Telugu phrases to English keywords used in intent detection
    lower = lower
      .replace(/డ్యాష్?బోర్డ్|హోమ్/g, 'dashboard')
      .replace(/లావా[దే]వేల?ి|ట్రాన్సాక్షన్/g, 'transactions')
      .replace(/చెల్లింపు|బిల్లు|పేమెంట్/g, 'payments')
      .replace(/ఇనామం|బహుమతి|రివార్డ్/g, 'rewards')
      .replace(/ప్రయాణం|ట్రావెల్/g, 'travel')
      .replace(/వాల్ట్|ఆస్తి|సంచయం/g, 'vault')
      .replace(/ధన్యవాదాలు|నమస్తే/g, 'thanks')
      .replace(/సహాయం|హెల్ప్/g, 'help');
  }

  if (lang === 'ta-IN') {
    // Map common Tamil phrases to English keywords used in intent detection
    lower = lower
      .replace(/டாஷ்போர்ட்|முகப்பு/g, 'dashboard')
      .replace(/பரிவர்த்தனை|டிரான்சாக்ஷன்/g, 'transactions')
      .replace(/செலுத்துதல்|பில்|பேமெண்ட்/g, 'payments')
      .replace(/பரிசு|ரிவார்டு/g, 'rewards')
      .replace(/பயணம்|டிராவல்/g, 'travel')
      .replace(/வால்ட்|சொத்து|தனிப்படை/g, 'vault')
      .replace(/நன்றி|வாழ்த்துக்கள்/g, 'thanks')
      .replace(/உதவி|ஹெல்ப்/g, 'help');
  }

  return lower;
}

function generateResponse(message) {
  const lang = getActiveLanguage();
  const lower = normalizeUserMessageForIntent(message, lang);

  // Navigation intent: guide user to the right page when asked
  const navMatch = lower.match(/\b(?:go to|open|take me to|show me|navigate to|take me)\b.*\b(dashboard|home|transactions|payments|bills|rewards|travel|vault|assets|wallet)\b/);
  if (navMatch) {
    const target = navMatch[1];
    const map = {
      dashboard: { name: 'Dashboard', url: 'dashboard.html' },
      home: { name: 'Home', url: 'dashboard.html' },
      transactions: { name: 'Transactions', url: 'transactions.html' },
      payments: { name: 'Payments & Bills', url: 'payments.html' },
      bills: { name: 'Payments & Bills', url: 'payments.html' },
      rewards: { name: 'Rewards', url: 'rewards.html' },
      travel: { name: 'Travel & Booking', url: 'travel.html' },
      vault: { name: 'Asset Vault', url: 'vault.html' },
      assets: { name: 'Asset Vault', url: 'vault.html' },
      wallet: { name: 'Asset Vault', url: 'vault.html' },
    };

    const entry = map[target];
    if (entry) {
      setTimeout(() => navigateToUrl(entry.url), 1200);
      return `✅ Sure! Opening **${entry.name}** for you now...`;
    }
  }

  // Greetings
  if (/^(hi|hello|hey|good|namaste)/.test(lower)) {
    return '👋 Hello! I\'m FinGuard AI. How can I help you protect your finances today?';
  }
  // Thank you
  if (/thank|thanks|great|awesome|good job/.test(lower)) {
    return '😊 You\'re welcome! Your financial security is my priority. Anything else I can help with?';
  }
  // Help
  if (/^help$|what can you do|capabilities/.test(lower)) {
    return CHAT_CONTEXT_AWARE.general[0];
  }

  // Keyword matching
  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.some(kw => lower.includes(kw))) {
      const responses = CHAT_CONTEXT_AWARE[category];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Specific questions
  if (lower.includes('pin') || lower.includes('password')) {
    return '🔐 Your vault is protected by a 4-digit PIN. The demo PIN is **1234**.\n\nFor real usage, use a PIN only you know — never share it. If you forget your PIN, contact FinGuard support for identity-verified recovery.';
  }
  if (lower.includes('export') || lower.includes('download') || lower.includes('share')) {
    return '📥 You can export your data in two ways:\n\n1. **Transactions**: Click "Export CSV" on the Transactions page\n2. **Asset Vault**: Click "Emergency Share" on the Vault page to open a printable PDF\n\nThe emergency document includes all your asset details, values, and emergency contacts.';
  }
  if (lower.includes('insurance') || lower.includes('lic') || lower.includes('policy')) {
    return '🛡️ You have 1 insurance policy in your vault:\n\n**LIC Money Back Policy** (LIC-7843291)\n• Sum Assured: ₹5,00,000\n• Annual Premium: ₹8,500\n• Maturity: 2034\n• Nominee: Priya Kumar\n\nRemember to verify your nominee details are up to date — it\'s the most important step for digital inheritance.';
  }
  if (lower.includes('invest') || lower.includes('stock') || lower.includes('mutual fund') || lower.includes('zerodha')) {
    return '📈 Your investment accounts:\n\n• **Zerodha Portfolio**: ₹3,80,000\n  → Stocks & Mutual Funds\n• **PPF (SBI)**: ₹2,45,000\n  → Lock-in till 2031\n\n**Total Investments**: ₹6,25,000\n\nAll investment details are securely stored in your vault for emergency access.';
  }
  if (lower.includes('bank') || lower.includes('hdfc') || lower.includes('sbi') || lower.includes('account')) {
    return '🏦 Your bank accounts:\n\n• **HDFC Savings**: ₹4,82,340\n• **SBI Fixed Deposit**: ₹5,00,000 (matures Nov 2028)\n\n**Total Banking**: ₹9,82,340\n\nBoth accounts are stored in your vault with emergency contact info for your family.';
  }
  if (lower.includes('how') && lower.includes('work')) {
    return '⚙️ **How FinGuard works:**\n\n1. **Transactions are analyzed** using pattern-matching AI to detect fraud and identify subscriptions\n2. **Fraud detection** looks for: unusual amounts, foreign countries, late-night transactions, and duplicate charges\n3. **Subscription detection** identifies merchants that charge the same amount every ~30 days\n4. **The Vault** uses localStorage encryption to keep your assets secure on your device\n5. **The AI** (that\'s me!) answers your financial questions 24/7';
  }

  // Fallback
  const fallbacks = [
    'That\'s an interesting question! Could you rephrase it? I can help with your transactions, fraud alerts, subscriptions, digital asset vault, or general financial advice. 💡',
    'I\'m not sure I fully understood that. Try asking about:\n• "Show my subscriptions"\n• "Explain my fraud alerts"\n• "How do I protect my assets?"\n• "What are my savings tips?"',
    'I\'m trained on your FinGuard data! Try asking about your spending, fraud alerts, subscriptions, or how to use the digital asset vault. 🛡️'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function navigateToUrl(url) {
  if (!url) return;
  window.location.href = url;
}

function appendMessage(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  // Convert **bold** and line breaks
  div.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg bot typing';
  div.id = id;
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}
function removeTyping(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}
