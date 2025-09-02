// Pro Demo logic
(function(){
  const KEY = 'bookingbt_tickets_v2';

  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; } }
  function save(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }
  function genId(){ return 'BT-' + Math.random().toString(36).slice(2,10).toUpperCase(); }
  function add(ticket){ const arr = load(); arr.push(ticket); save(arr); }
  function get(id){ return load().find(t => t.id.toUpperCase() === id.toUpperCase()); }
  function update(id, patch){
    const arr = load(); const i = arr.findIndex(t => t.id.toUpperCase() === id.toUpperCase());
    if (i >= 0){ arr[i] = { ...arr[i], ...patch }; save(arr); return arr[i]; }
    return null;
  }

  function toast(msg){
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg; el.style.display = 'block';
    setTimeout(()=> el.style.display = 'none', 1800);
  }

  async function loadEvents(){
    const res = await fetch('/events.json');
    const events = await res.json();
    const grid = document.getElementById('eventsGrid');
    const select = document.getElementById('event');
    grid.innerHTML = '';
    select.innerHTML = '';
    events.forEach((ev, idx) => {
      // grid card
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = '<img alt="'+ev.title+'" src="'+ev.image+'"/>' +
        '<div class="pad">' +
        '<h3>'+ev.title+'</h3>' +
        '<div class="meta">'+ev.date+' • '+ev.place+' • '+ev.price+'</div>' +
        '<hr>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<a class="btn" href="#book" onclick="window.bt.selectEvent(\''+ev.title.replace(/'/g, "\'")+'\')">Book</a>' +
        (ev.stripe_link ? ('<a class="btn" href="'+ev.stripe_link+'" target="_blank">Stripe (test)</a>') : '') +
        '</div>' +
        '</div>';
      grid.appendChild(card);
      // select option
      const opt = document.createElement('option');
      opt.value = ev.title; opt.textContent = ev.title; select.appendChild(opt);
    });
    window.bt._events = events;
  }

  window.bt = {
    store: load,
    selectEvent: function(name){
      const sel = document.getElementById('event');
      if (sel){ sel.value = name; document.getElementById('name')?.focus(); }
    },
    events: ()=> window.bt._events || []
  };

  document.addEventListener('DOMContentLoaded', function(){
    loadEvents();

    const form = document.getElementById('bookingForm');
    const stripeBtn = document.getElementById('stripeBtn');
    if (form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const eventName = document.getElementById('event').value;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const qty = parseInt(document.getElementById('qty').value || '1', 10);
        const id = genId();
        const ticket = { id, event: eventName, name, email, qty, used: false, createdAt: new Date().toISOString() };
        add(ticket);
        toast('Ticket created');
        // Simulate payment by redirecting to success page with ticket details
        const qs = new URLSearchParams({ id, event: eventName, name, email, qty: String(qty) });
        location.href = '/success?'+qs.toString();
      });
    }
    if (stripeBtn){
      stripeBtn.addEventListener('click', function(){
        const eventName = document.getElementById('event').value;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const qty = parseInt(document.getElementById('qty').value || '1', 10);
        // Find Stripe link for selected event
        const ev = (window.bt.events().find(e => e.title === eventName) || {});
        if (ev.stripe_link){
          // Append success params so Stripe can redirect back (manually set success url on Stripe Payment Link to /success)
          location.href = ev.stripe_link;
        } else {
          alert('No Stripe link set for this event yet. Use Test Payment instead or add a link in events.json.');
        }
      });
    }

    // Check-in logic (shared)
    const checkForm = document.getElementById('checkForm');
    const markUsedBtn = document.getElementById('markUsed');
    if (checkForm){
      checkForm.addEventListener('submit', function(e){
        e.preventDefault();
        const id = document.getElementById('ticketId').value.trim();
        const res = document.getElementById('result');
        const rHeadline = document.getElementById('rHeadline');
        const rId = document.getElementById('rId');
        const rEvent = document.getElementById('rEvent');
        const rName = document.getElementById('rName');
        const rQty = document.getElementById('rQty');
        const rStatus = document.getElementById('rStatus');

        const t = get(id);
        res.style.display = 'block';
        if (!t){
          rHeadline.textContent = '❌ Not found';
          rId.textContent = id || '—';
          rEvent.textContent = '—';
          rName.textContent = '—';
          rQty.textContent = '—';
          rStatus.innerHTML = '<span class="invalid">Invalid</span>';
          return;
        }
        rHeadline.textContent = t.used ? '⚠️ Already used' : '✅ Valid ticket';
        rId.textContent = t.id;
        rEvent.textContent = t.event;
        rName.textContent = t.name;
        rQty.textContent = String(t.qty);
        rStatus.innerHTML = t.used ? '<span class="used">Used</span>' : '<span class="valid">Valid</span>';

        document.getElementById('ticketId').value = t.id;
      });

      if (markUsedBtn){
        markUsedBtn.addEventListener('click', function(){
          const id = document.getElementById('ticketId').value.trim();
          const t = get(id);
          if (!t){ alert('Ticket not found. Validate first.'); return; }
          const updated = update(id, { used: true, usedAt: new Date().toISOString() });
          if (updated){
            document.getElementById('rHeadline').textContent = '⚠️ Marked as used';
            document.getElementById('rStatus').innerHTML = '<span class="used">Used</span>';
            alert('Ticket '+id+' marked as used.');
          }
        });
      }
    }
  });
})();
