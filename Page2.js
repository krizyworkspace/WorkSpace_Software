 // LocalStorage Keys
    const TODAY_WORK_KEY = 'todayWorks';
    const STORE_KEY = 'storeItems';
    const USED_ITEMS_KEY = 'usedItemsToday';
    const TODAY_DUES_KEY = 'todaysDues';
    const PENDING_WORK_KEY = 'pendingWorks';
    const YESTERDAY_PENDING_KEY = 'yesterdayPendingWorks';

    const workForm = document.getElementById('workForm');
    const workInput = document.getElementById('workInput');
    const doneBtn = workForm.querySelector('button.done');
    const pendingBtn = workForm.querySelector('button.pending');
    const workList = document.getElementById('workList');

    // Modal
    const amountModal = document.getElementById('amountModal');
    const receivedAmountInput = document.getElementById('receivedAmount');
    const pendingAmountInput = document.getElementById('pendingAmount');
    const amountSubmitBtn = document.getElementById('amountSubmitBtn');
    const closeBtn = document.querySelector('.closeBtn');
    let currentWorkDesc = '';
    let currentAction = '';
    let currentEditId = null;

    function loadData(key) { return JSON.parse(localStorage.getItem(key)) || []; }
    function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

    function renderTodayWorks() {
      const works = loadData(TODAY_WORK_KEY);
      workList.innerHTML = '';
      if (works.length === 0) {
        workList.innerHTML = `<tr><td colspan="6" style="color:#888;">No work added yet.</td></tr>`;
        return;
      }
      works.forEach((work, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', work.id);
        tr.innerHTML =
          `<td>${index + 1}</td>
           <td class="desc-cell">${work.description}</td>
           <td>${work.received || 0}</td>
           <td>${work.pending || 0}</td>
           <td class="status-cell"><span class="status ${work.status}">${work.status}</span></td>
           <td><button class="deleteBtn" onclick="deleteWork('${work.id}')">Delete</button></td>`;
        workList.appendChild(tr);
      });
    }

    function renderUsedItems() {
      const usedItems = loadData(USED_ITEMS_KEY);
      const usedItemsList = document.getElementById('usedItemsList');
      usedItemsList.innerHTML = '';
      if (usedItems.length === 0) {
        usedItemsList.innerHTML = '<li style="color:#888;">No items used yet today.</li>';
        return;
      }
      usedItems.forEach((item, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${idx + 1}. ${item.name}</span>
          <span class="usedQty">x${item.qty}</span>`;
        usedItemsList.appendChild(li);
      });
    }

    function renderTodayPayments() {
  const works = loadData('todayWorks');
  const paymentsList = document.getElementById('paymentsList');
  const paymentsTotal = document.getElementById('paymentsTotal');
  let total = 0;
  paymentsList.innerHTML = '';
  let payments = works.filter(w => w.status === 'Done' && Number(w.received) > 0);
  if (payments.length === 0) {
    paymentsList.innerHTML = `<tr><td colspan="3" style="color:#888;">No payments received today.</td></tr>`;
  } else {
    payments.forEach((w, idx) => {
      total += Number(w.received) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:left; padding-left:16px;">${idx + 1}</td>
        <td class="desc-cell">${w.description}</td>
        <td class="amount-cell">${w.received}</td>
      `;
      paymentsList.appendChild(tr);
    });
  }
  paymentsTotal.textContent = total;
}

function renderTodaysDues() {
  const dues = loadData('todaysDues');
  const duesList = document.getElementById('duesList');
  const duesTotal = document.getElementById('duesTotal');
  duesList.innerHTML = '';
  let total = 0;
  if (dues.length === 0) {
    duesList.innerHTML = `<tr><td colspan="3" style="color:#888;">No dues for today.</td></tr>`;
  } else {
    dues.forEach((due, idx) => {
      total += Number(due.pending) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:left; padding-left:16px;">${idx + 1}</td>
        <td class="desc-cell">${due.description}</td>
        <td class="amount-cell">${due.pending}</td>
      `;
      duesList.appendChild(tr);
    });
  }
  duesTotal.textContent = total;
}


    function renderPendingWorks() {
      const pendingWorks = loadData(PENDING_WORK_KEY);
      const pendingWorkList = document.getElementById('pendingWorkList');
      pendingWorkList.innerHTML = '';
      if (pendingWorks.length === 0) {
        pendingWorkList.innerHTML = `<tr><td colspan="6" style="color:#888;">No pending works for today.</td></tr>`;
        return;
      }
      pendingWorks.forEach((work, idx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', work.id);
        tr.innerHTML =
          `<td>${idx + 1}</td>
           <td class="desc-cell">${work.description}</td>
           <td>${work.received || 0}</td>
           <td>${work.pending || 0}</td>
           <td class="status-cell"><span class="status ${work.status}">${work.status}</span></td>
           <td>
             <button class="workdoneBtn" onclick="showMarkDoneModalPending('${work.id}', ${idx})">Mark as Done</button>
             <button class="deleteBtn" onclick="deletePendingWork('${work.id}')">Delete</button>
           </td>`;
        pendingWorkList.appendChild(tr);
      });
    }

    function renderAll() {
      renderTodayWorks();
      renderUsedItems();
      renderTodayPayments();
      renderTodaysDues();
      renderPendingWorks();
    }

    function showAmountModal(action, editId = null) {
      if (action === 'Done' || action === 'Pending') {
        if (!workInput.value.trim()) {
          alert('Please enter work description.');
          return;
        }
        currentWorkDesc = workInput.value.trim();
      }
      currentAction = action;
      currentEditId = editId;
      receivedAmountInput.value = '';
      pendingAmountInput.value = '';
      amountModal.style.display = 'flex';
      receivedAmountInput.focus();
    }

    doneBtn.addEventListener('click', () => showAmountModal('Done'));
    pendingBtn.addEventListener('click', () => showAmountModal('Pending'));

    closeBtn.onclick = function() {
      amountModal.style.display = 'none';
      currentEditId = null;
    };
    window.onclick = function(event) {
      if (event.target === amountModal) {
        amountModal.style.display = 'none';
        currentEditId = null;
      }
    };

    amountSubmitBtn.onclick = function() {
      const received = Number(receivedAmountInput.value) || 0;
      const pending = Number(pendingAmountInput.value) || 0;
      if (received < 0 || pending < 0) {
        alert("Amounts can't be negative.");
        return;
      }
      if (currentAction === 'Done') {
        addWork(currentWorkDesc, 'Done', received, pending);
        if (pending > 0) addTodayDue(currentWorkDesc, received, pending);
      } else if (currentAction === 'Pending') {
        addWork(currentWorkDesc, 'Pending', received, pending);
        addPendingWork(currentWorkDesc, received, pending);
      } else if (currentAction === 'MarkDonePending') {
        let pendingWorks = loadData(PENDING_WORK_KEY);
        let works = loadData(TODAY_WORK_KEY);
        let idx = pendingWorks.findIndex(w => w.id === currentEditId);
        if (idx !== -1) {
          let todayIdx = works.findIndex(w => w.description === pendingWorks[idx].description);
          if (todayIdx !== -1) {
            works[todayIdx] = {
              ...works[todayIdx],
              status: 'Done',
              received,
              pending
            };
            saveData(TODAY_WORK_KEY, works);
          } else {
            works.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              description: pendingWorks[idx].description,
              status: 'Done',
              received,
              pending
            });
            saveData(TODAY_WORK_KEY, works);
          }
          if (pending > 0) addTodayDue(pendingWorks[idx].description, received, pending);
          pendingWorks.splice(idx, 1);
          saveData(PENDING_WORK_KEY, pendingWorks);
        }
      }
      workInput.value = '';
      amountModal.style.display = 'none';
      currentEditId = null;
      renderAll();
    };

    function addWork(description, status, received = 0, pending = 0) {
      const works = loadData(TODAY_WORK_KEY);
      const newWork = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        description: description.trim(),
        status,
        received,
        pending
      };
      works.push(newWork);
      saveData(TODAY_WORK_KEY, works);
    }

    function deleteWork(id) {
      let works = loadData(TODAY_WORK_KEY);
      works = works.filter(w => w.id !== id);
      saveData(TODAY_WORK_KEY, works);
      renderAll();
    }

    function showMarkDoneModalPending(id, idx) {
      currentEditId = id;
      currentAction = 'MarkDonePending';
      receivedAmountInput.value = '';
      pendingAmountInput.value = '';
      amountModal.style.display = 'flex';
      receivedAmountInput.focus();
    }

    function addTodayDue(description, received, pending) {
      let dues = loadData(TODAY_DUES_KEY);
      dues.push({ description, received, pending });
      saveData(TODAY_DUES_KEY, dues);
    }

    function addPendingWork(description, received, pending) {
      let pendingWorks = loadData(PENDING_WORK_KEY);
      pendingWorks.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        description: description.trim(),
        status: 'Pending',
        received,
        pending
      });
      saveData(PENDING_WORK_KEY, pendingWorks);
    }

    function deletePendingWork(id) {
      let pendingWorks = loadData(PENDING_WORK_KEY);
      pendingWorks = pendingWorks.filter(w => w.id !== id);
      saveData(PENDING_WORK_KEY, pendingWorks);
      renderAll();
    }

    // Used Items Section
    function loadStoreItems() { return loadData(STORE_KEY); }
    function saveStoreItems(items) { saveData(STORE_KEY, items); }
    function loadUsedItems() { return loadData(USED_ITEMS_KEY); }
    function saveUsedItems(items) { saveData(USED_ITEMS_KEY, items); }
    document.getElementById('itemsUsedForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('usedItemName').value.trim();
  const qty = Number(document.getElementById('usedItemQty').value);
  if (!name) {
    alert('Please enter item name.');
    return;
  }
  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid quantity.');
    return;
  }
  let storeItems = loadStoreItems();
  const idx = storeItems.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) {
    alert(`Item "${name}" not found in store.`);
    return;
  }
  if (storeItems[idx].stock < qty) {
    alert(`Not enough stock for "${name}". Available: ${storeItems[idx].stock}`);
    return;
  }
  storeItems[idx].stock -= qty;
  saveStoreItems(storeItems);

  // Show popup if quantity is less than 2
  if (storeItems[idx].stock < 2) {
    alert(`Warning: Only ${storeItems[idx].stock} "${storeItems[idx].name}" left in store!`);
  }

  // Save used item
  let usedItems = loadUsedItems();
  const usedIdx = usedItems.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  if (usedIdx !== -1) {
    usedItems[usedIdx].qty += qty;
  } else {
    usedItems.push({ name, qty });
  }
  saveUsedItems(usedItems);

  renderUsedItems();
  this.reset();
});


    // Complete Work Button Functionality
    const completeWorkBtn = document.getElementById('completeWorkBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const confirmBtn = document.querySelector('.confirm-btn');

    completeWorkBtn.addEventListener('click', () => {
      confirmationModal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
      confirmationModal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', () => {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Prepare data for page5 (Income)
      const incomeData = {
        date: today,
        works: loadData(TODAY_WORK_KEY),
        dues: loadData(TODAY_DUES_KEY),
        payments: []
      };

      // Calculate payments from works
      const works = loadData(TODAY_WORK_KEY);
      works.forEach(work => {
        if (work.received && work.received > 0) {
          incomeData.payments.push({
            description: work.description,
            amount: work.received
          });
        }
      });

      // Save to localStorage for page5
      const completedDays = loadData('completedDays') || [];
      completedDays.push(incomeData);
      saveData('completedDays', completedDays);

      // Prepare data for page3 (Pending)
      const pendingWorks = loadData(PENDING_WORK_KEY);
      if (pendingWorks.length > 0) {
        const yesterdayPending = loadData(YESTERDAY_PENDING_KEY) || [];
        const updatedPending = [...yesterdayPending, ...pendingWorks];
        saveData(YESTERDAY_PENDING_KEY, updatedPending);
      }

      // Reset current day's data
      saveData(TODAY_WORK_KEY, []);
      saveData(TODAY_DUES_KEY, []);
      saveData(PENDING_WORK_KEY, []);
      saveData(USED_ITEMS_KEY, []);

      // Close modal and refresh
      confirmationModal.style.display = 'none';
      renderAll();
      alert('Work completed! Data transferred to Income page.');
    });

    // Midnight Transfer Logic
    function transferPendingToYesterdayIfNeeded() {
      const lastTransferDate = localStorage.getItem('lastPendingTransferDate');
      const todayDate = new Date().toISOString().slice(0, 10);
      if (lastTransferDate === todayDate) return;

      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        let pendingWorks = loadData(PENDING_WORK_KEY);
        let yesterdayPending = loadData(YESTERDAY_PENDING_KEY);
        yesterdayPending = yesterdayPending.concat(pendingWorks);
        saveData(YESTERDAY_PENDING_KEY, yesterdayPending);
        saveData(PENDING_WORK_KEY, []);
        localStorage.setItem('lastPendingTransferDate', todayDate);
        renderPendingWorks();
      }
    }
    setInterval(transferPendingToYesterdayIfNeeded, 60000);
    transferPendingToYesterdayIfNeeded();

    // Expose for inline onclick
    window.deleteWork = deleteWork;
    window.deletePendingWork = deletePendingWork;
    window.showMarkDoneModalPending = showMarkDoneModalPending;

    renderAll();