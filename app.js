// Booking.bt demo logic (no backend).
// - Generates Ticket IDs like BT-XXXXXXXX
// - Saves tickets to localStorage
// - Renders QR code containing {ticket_id, event, name, qty}

(function(){
  const KEY = 'bookingbt_tickets_v1';

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; }
  }
  function save(arr){
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function genId(){
    return 'BT-' + Math.random().toString(36).slice(2,10).toUpperCase();
  }
  function add(ticket){
    const arr = load();
    arr.push(ticket);
    save(arr);
  }
  function get(id){
    return load().find(t => t.id.toUpperCase() === id.toUpperCase());
  }
  function update(id, patch){
    const arr = load();
    const idx = arr.findIndex(t => t.id.toUpperCase() === id.toUpperCase());
    if (idx >= 0){
      arr[idx] = { ...arr[idx], ...patch };
      save(arr);
      return arr[idx];
    }
    return null;
  }

  // Expose small API
  window.bt = {
    store: load,
    selectEvent: function(name){
      const sel = document.getElementById('event');
      if (sel){
        const opt = Array.from(sel.options).find(o => o.value === name);
        if (opt){ sel.value = name; }
        document.getElementById('name')?.focus();
      }
    },
  };

  // Booking page behavior
  document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('bookingForm');
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

        // Render ticket card
        const tMeta = document.getElementById('tMeta');
        const tId = document.getElementById('tId');
        const tTitle = document.getElementById('tTitle');
        document.getElementById('ticketResult').style.display = 'block';
        tTitle.textContent = 'Your QR e‑ticket';
        tMeta.textContent = eventName + ' • ' + name + ' • ' + qty + ' ticket' + (qty>1?'s':'');
        tId.textContent = id;
        document.getElementById('tStatus').textContent = 'Valid';

        // QR payload
        const payload = JSON.stringify({ ticket_id: id, event: eventName, name, qty });
        const qr = document.getElementById('qrcode');
        qr.innerHTML = '';
        new QRCode(qr, { text: payload, width: 220, height: 220 });
        window.location.hash = '#book';
      });
    }

    // Check‑in behavior
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

        // Pre-fill for markUsed
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
