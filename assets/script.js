// Contatos comerciais e perfis oficiais: preencher as URLs sociais quando disponíveis.
const CONTACT_CONFIG = {
  whatsapp: {
    number: '5521996716025',
    message: 'Olá! Vim pelo site da TZÔAR e gostaria de conversar sobre uma solução de automação ou inteligência artificial.'
  },
  email: { address: 'lojadodgiko@gmail.com', subject: 'Contato pelo site TZÔAR' },
  socials: { facebook: '', instagram: '', tiktok: '' }
};

const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  toggle.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  menu.classList.toggle('open', !expanded);
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
}));
document.getElementById('year').textContent = new Date().getFullYear();
const whatsappContact = document.getElementById('whatsapp-contact');
whatsappContact.href = `https://wa.me/${CONTACT_CONFIG.whatsapp.number}?text=${encodeURIComponent(CONTACT_CONFIG.whatsapp.message)}`;
const emailContact = document.getElementById('email-contact');
emailContact.href = `mailto:${CONTACT_CONFIG.email.address}?subject=${encodeURIComponent(CONTACT_CONFIG.email.subject)}`;

function configureSocialLinks(socials) {
  document.querySelectorAll('[data-social]').forEach(link => {
    let url;
    try {
      url = new URL(socials[link.dataset.social]);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) url = null;
    } catch {
      url = null;
    }
    const status = link.querySelector('small');
    if (url) {
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      status.textContent = 'Visitar perfil ↗';
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-disabled', 'true');
      status.textContent = 'Em breve';
    }
  });
}
configureSocialLinks(CONTACT_CONFIG.socials);

// Mesmo MP4 e efeito visual no cabeçalho e na seção Sobre.
// Controle independente por elemento: fallback em falha ou movimento reduzido.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.logo-animation').forEach(logo => {
  const video = logo.querySelector('video');
  const source = video.querySelector('source');
  let failed = false;
  const showFallback = () => logo.classList.remove('is-playing');
  const failVideo = () => {
    failed = true;
    video.pause();
    showFallback();
  };
  video.addEventListener('error', failVideo);
  source.addEventListener('error', failVideo);
  video.addEventListener('playing', () => {
    if (reducedMotion.matches) {
      video.pause();
      showFallback();
    } else {
      logo.classList.add('is-playing');
    }
  });
  const updateMotion = () => {
    if (reducedMotion.matches || failed) {
      video.pause();
      showFallback();
      return;
    }
    if (!source.hasAttribute('src')) {
      source.src = source.dataset.src;
      video.load();
    }
    video.play().catch(showFallback);
  };
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();
});

// Demonstração local. A função receiveMessage é o ponto de troca pela futura API.
// Nenhum dado é enviado ou persistido; a conversa é reiniciada ao recarregar.
(() => {
  const demo = document.querySelector('.phone-demo');
  if (!demo) return;
  const transcript = demo.querySelector('.chat-transcript');
  const form = demo.querySelector('.chat-composer');
  const input = form.querySelector('input');
  const sendButton = form.querySelector('button');
  const typing = demo.querySelector('.chat-typing');
  let interacted = false;
  let replyQueue = Promise.resolve();
  let cancelPendingPromotion = null;
  const promotionTimers = [];

  function displayMessage(text, sender = 'assistant') {
    const message = document.createElement('div');
    message.className = `chat-message chat-message--${sender}`;
    const body = document.createElement('p');
    body.textContent = text;
    const time = document.createElement('time');
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    message.append(body, time);
    transcript.append(message);
    // Manter o histórico limitado também em sessões longas.
    while (transcript.children.length > 80) transcript.firstElementChild.remove();
    transcript.scrollTop = transcript.scrollHeight;
  }

  // Adaptador de respostas: trocar apenas esta função quando houver um backend.
  // Contrato futuro: recebe texto e devolve Promise<string>, sem credenciais no navegador.
  async function receiveMessage(text) {
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (/orcamento|preco|valor|cust[oa]|quanto|contratar/.test(normalized)) {
      return 'Cada projeto é pensado para a sua empresa. Para preparar um orçamento, a TZÔAR precisa entender o processo, as ferramentas envolvidas e o resultado esperado.\n\nEsta conversa é uma demonstração e não envia solicitações. Use “Fale com a Tzôar”, no menu, para ver a seção de contato.';
    }
    if (/exemplo|whatsapp|atendimento/.test(normalized)) {
      return 'Um exemplo: uma pessoa pede informações pelo WhatsApp, o fluxo identifica o assunto e organiza o contato em uma planilha. A equipe recebe a solicitação com os dados necessários.\n\nTambém é possível automatizar lembretes, consultas e encaminhamentos para atendimento humano.';
    }
    if (/soluc|servic|integr|sistema|planilha/.test(normalized)) {
      return 'Criamos automações de atendimento, agentes de inteligência artificial, sistemas personalizados e integrações entre plataformas.\n\nPodemos conectar formulários, planilhas, APIs e sistemas para reduzir tarefas repetitivas. Conheça mais na seção Serviços.';
    }
    if (/duvida|como|inteligencia|\bia\b|automacao/.test(normalized)) {
      return 'Uma automação executa etapas de um processo, como organizar um contato ou consultar um sistema. A inteligência artificial pode apoiar a interpretação de perguntas e informações.\n\nAqui você está experimentando respostas programadas, sem uma IA conectada. Qual opção gostaria de explorar?';
    }
    if (/^(oi|ola|bom dia|boa tarde|boa noite|obrigad)/.test(normalized)) {
      return 'Olá! 😊 Posso mostrar soluções, exemplos de automação e como começar um orçamento. Escolha uma das opções abaixo para experimentar.';
    }
    return 'Nesta demonstração, respondo a assuntos previamente programados. Você pode explorar nossas soluções, ver exemplos de automação ou conhecer os primeiros passos para um orçamento. Use os botões abaixo para continuar.';
  }

  function stopAutomaticMessages() {
    interacted = true;
    promotionTimers.forEach(clearTimeout);
    if (cancelPendingPromotion) cancelPendingPromotion();
  }

  function waitBeforeReply(promotional) {
    return new Promise(resolve => {
      const timer = setTimeout(() => { cancelPendingPromotion = null; resolve(true); }, 850);
      if (promotional) cancelPendingPromotion = () => {
        clearTimeout(timer);
        cancelPendingPromotion = null;
        resolve(false);
      };
    });
  }

  function queueReply(getReply, promotional = false) {
    replyQueue = replyQueue.then(async () => {
      if (promotional && interacted) return;
      typing.hidden = false;
      try {
        const proceed = await waitBeforeReply(promotional);
        if (!proceed || (promotional && interacted)) return;
        const reply = await getReply();
        if (!promotional || !interacted) displayMessage(reply);
      } catch {
        displayMessage('Não consegui responder agora. Tente novamente ou explore a seção Serviços.');
      } finally {
        typing.hidden = true;
      }
    });
  }

  function sendMessage(text) {
    const cleanText = text.trim().slice(0, 500);
    if (!cleanText) return;
    stopAutomaticMessages();
    displayMessage(cleanText, 'user');
    queueReply(() => receiveMessage(cleanText));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(input.value);
    input.value = '';
    sendButton.disabled = true;
  });
  input.addEventListener('input', () => {
    stopAutomaticMessages();
    sendButton.disabled = !input.value.trim();
  });
  demo.querySelectorAll('[data-chat-option]').forEach(button => {
    button.addEventListener('click', () => sendMessage(button.dataset.chatOption));
  });
  // Parar as promoções antes mesmo de a primeira mensagem ser enviada.
  ['pointerdown', 'focusin', 'keydown'].forEach(event => demo.addEventListener(event, stopAutomaticMessages));

  displayMessage('👋 Olá! Em que posso te ajudar?\n\nSou a assistente virtual da TZÔAR e posso responder às suas dúvidas sobre automação, integrações e inteligência artificial.');
  displayMessage('⚙️ O que você gostaria de fazer?\n\n• Conhecer nossas soluções\n• Ver exemplos de automação\n• Solicitar um orçamento\n• Tirar uma dúvida');
  transcript.scrollTop = 0;
  const promotions = [
    'Sabia que podemos automatizar o atendimento da sua empresa pelo WhatsApp?',
    'Também criamos integrações entre sistemas, planilhas e inteligência artificial.'
  ];
  promotions.forEach((message, index) => {
    promotionTimers.push(setTimeout(() => {
      if (!interacted) queueReply(() => Promise.resolve(message), true);
    }, 12000 * (index + 1)));
  });
})();
