// =============================================
// MORREY DETAILING - SISTEMA DE TURNOS
// =============================================

const MORREY_MAX_PER_DAY = () => {
  try { return parseInt(localStorage.getItem('morrey_max_per_day') || '4', 10); } catch { return 4; }
};

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTH_NAMES_LOWER = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAY_NAMES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

// ---------- Data helpers ----------

function getBookings() {
  try { return JSON.parse(localStorage.getItem('morrey_bookings') || '[]'); } catch { return []; }
}

function saveBookings(b) {
  localStorage.setItem('morrey_bookings', JSON.stringify(b));
}

function addBooking(data) {
  const bookings = getBookings();
  const booking = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

function getBookingsForDate(dateStr) {
  return getBookings().filter(b => b.date === dateStr && b.status !== 'cancelled');
}

function formatDateDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${DAY_NAMES[dow]} ${d} de ${MONTH_NAMES_LOWER[m - 1]} ${y}`;
}

// ---------- Modal state ----------

let calYear, calMonth, calSelectedDate, calSelectedService;

// ---------- Open / Close ----------

function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  calSelectedDate = null;
  calSelectedService = null;

  // Reset
  const svc = document.getElementById('bookService');
  if (svc) svc.value = '';
  updateStep1Next();
  const dateText = document.getElementById('bookSelectedDateText');
  if (dateText) dateText.innerHTML = 'Seleccioná una fecha disponible';

  showBookStep(1);
  renderBookCal();

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ---------- Steps ----------

function showBookStep(n) {
  [1, 2, 3].forEach(i => {
    const step = document.getElementById('bookStep' + i);
    if (step) step.style.display = i === n ? 'block' : 'none';
    const dot = document.getElementById('bsDot' + i);
    if (dot) {
      dot.classList.remove('active', 'done');
      if (i < n) dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
    }
  });
  // Scroll modal to top
  const box = document.querySelector('.bm-box');
  if (box) box.scrollTop = 0;
}

// ---------- Calendar ----------

function renderBookCal() {
  const title = document.getElementById('bCalTitle');
  const grid = document.getElementById('bCalGrid');
  if (!title || !grid) return;

  title.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDay = parseInt(localStorage.getItem('morrey_max_per_day') || '4', 10);

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  grid.innerHTML = '';

  for (let i = 0; i < firstDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'bcal-cell empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = date.getDay();

    const cell = document.createElement('div');
    cell.className = 'bcal-cell';
    cell.textContent = d;

    const isPast = date < today;
    const isSunday = dow === 0;
    const count = getBookingsForDate(dateStr).length;
    const isFull = count >= maxDay;

    if (date.getTime() === today.getTime()) cell.classList.add('today');
    if (count > 0 && !isPast) {
      const dot = document.createElement('span');
      dot.className = 'bcal-dot';
      cell.appendChild(dot);
    }

    if (isPast || isSunday || isFull) {
      cell.classList.add('disabled');
      if (isSunday) cell.title = 'Domingos cerrado';
      else if (isFull) cell.title = 'Sin turnos disponibles';
    } else {
      if (calSelectedDate === dateStr) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        calSelectedDate = dateStr;
        renderBookCal();
        const dateText = document.getElementById('bookSelectedDateText');
        if (dateText) dateText.innerHTML = `Fecha: <strong>${formatDateDisplay(dateStr)}</strong>`;
        updateStep1Next();
      });
    }

    grid.appendChild(cell);
  }
}

function updateStep1Next() {
  const btn = document.getElementById('bookStep1Next');
  if (!btn) return;
  const svc = document.getElementById('bookService')?.value;
  btn.disabled = !(svc && calSelectedDate);
}

// ---------- Form validation ----------

function validateBookingField(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (!el.value.trim()) {
    el.classList.add('error');
    return false;
  }
  el.classList.remove('error');
  return true;
}

// ---------- Init ----------

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  // Open button
  document.getElementById('openBookingBtn')?.addEventListener('click', openBookingModal);

  // Close
  modal.addEventListener('click', e => { if (e.target === modal) closeBookingModal(); });
  document.getElementById('bmClose')?.addEventListener('click', closeBookingModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeBookingModal();
  });

  // Calendar nav
  document.getElementById('bCalPrev')?.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderBookCal();
  });
  document.getElementById('bCalNext')?.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderBookCal();
  });

  // Service change
  document.getElementById('bookService')?.addEventListener('change', updateStep1Next);

  // Step 1 → 2
  document.getElementById('bookStep1Next')?.addEventListener('click', () => {
    calSelectedService = document.getElementById('bookService')?.value;
    if (!calSelectedService || !calSelectedDate) return;
    ['bookName', 'bookEmail', 'bookPhone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    showBookStep(2);
  });

  // Step 2 → 1
  document.getElementById('bookStep2Back')?.addEventListener('click', () => showBookStep(1));

  // Step 2 submit
  document.getElementById('bookStep2Submit')?.addEventListener('click', () => {
    const v1 = validateBookingField('bookName');
    const v2 = validateBookingField('bookEmail');
    const v3 = validateBookingField('bookPhone');
    if (!v1 || !v2 || !v3) return;

    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();

    addBooking({ date: calSelectedDate, service: calSelectedService, name, email, phone });

    showBookStep(3);

    document.getElementById('bSummary').innerHTML =
      `<p><span>Servicio</span><strong>${calSelectedService}</strong></p>` +
      `<p><span>Fecha</span><strong>${formatDateDisplay(calSelectedDate)}</strong></p>` +
      `<p><span>Nombre</span><strong>${name}</strong></p>` +
      `<p><span>Email</span><strong>${email}</strong></p>` +
      `<p><span>Celular</span><strong>${phone}</strong></p>`;

    document.getElementById('bWABtn').onclick = () => {
      const [y, m, d] = calSelectedDate.split('-').map(Number);
      const text = encodeURIComponent(
        `Hola Morrey Detailing! Agendé un turno desde la web:\n` +
        `📋 Servicio: ${calSelectedService}\n` +
        `📅 Fecha: ${formatDateDisplay(calSelectedDate)}\n` +
        `👤 Nombre: ${name}\n` +
        `📱 Celular: ${phone}`
      );
      window.open(`https://wa.me/5491156359321?text=${text}`, '_blank');
    };
  });

  // Step 3 close
  document.getElementById('bCloseBtn')?.addEventListener('click', closeBookingModal);
});
