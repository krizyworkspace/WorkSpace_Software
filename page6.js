// --- Buy and Store Logic ---
    const BUY_KEY = 'buyItems';
    const STORE_KEY = 'storeItems';
    const INCOME_KEY = 'completedDays';
    const PENDING_KEY = 'yesterdayPendingWorks';

    function loadBuyItems() {
      return JSON.parse(localStorage.getItem(BUY_KEY) || '[]');
    }
    function saveBuyItems(items) {
      localStorage.setItem(BUY_KEY, JSON.stringify(items));
    }
    function loadStoreItems() {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    }
    function saveStoreItems(items) {
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
    }
    function loadIncomeItems() {
      return JSON.parse(localStorage.getItem(INCOME_KEY) || '[]');
    }
    function loadPendingWorks() {
      return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    }

    // Set today's date as default
    function setDefaultDate() {
      const buyDate = document.getElementById('buyDate');
      const today = new Date().toISOString().slice(0,10);
      buyDate.value = today;
    }

    function renderBuy() {
      const buyList = document.getElementById('buyList');
      const items = loadBuyItems();
      buyList.innerHTML = '';
      if (items.length === 0) {
        buyList.innerHTML = `<tr><td colspan="7" style="color:#888;">No purchases yet.</td></tr>`;
        return;
      }
      items.slice().reverse().forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-align:left; padding-left:16px;">${items.length - idx}</td>
          <td class="name-cell" style="text-align:left; padding-left:8px;">${item.name}</td>
          <td>${item.qty}</td>
          <td>${item.amount}</td>
          <td>${formatDate(item.date)}</td>
          <td>
            <button class="addStoreBtn${item.addedToStore ? ' added' : ''}" onclick="addToStoreFromBuy(${item.id})" ${item.addedToStore ? 'disabled' : ''}>
              ${item.addedToStore ? 'Added' : 'Add to Store'}
            </button>
          </td>
          <td>
            <button class="deleteBtn" onclick="deleteBuyItem(${item.id})">Delete</button>
          </td>
        `;
        buyList.appendChild(tr);
      });
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    document.getElementById('buyForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('buyName').value.trim();
      const qty = Number(document.getElementById('buyQty').value);
      const amount = Number(document.getElementById('buyAmount').value);
      const date = document.getElementById('buyDate').value;
      if (!name) {
        alert('Please enter item name.');
        return;
      }
      if (isNaN(qty) || qty < 1) {
        alert('Please enter valid quantity.');
        return;
      }
      if (isNaN(amount) || amount < 0) {
        alert('Please enter valid amount.');
        return;
      }
      if (!date) {
        alert('Please select date.');
        return;
      }
      let items = loadBuyItems();
      items.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        name,
        qty,
        amount,
        date,
        addedToStore: false
      });
      saveBuyItems(items);
      this.reset();
      setDefaultDate();
      renderBuy();
      renderMonthly();
    });

    function deleteBuyItem(id) {
      if (!confirm('Are you sure you want to delete this purchase?')) return;
      let items = loadBuyItems();
      items = items.filter(i => i.id !== id);
      saveBuyItems(items);
      renderBuy();
      renderMonthly();
    }

    // Add to Store logic
    function addToStoreFromBuy(id) {
      let buyItems = loadBuyItems();
      const idx = buyItems.findIndex(i => i.id === id);
      if (idx === -1) return;
      if (buyItems[idx].addedToStore) return;

      const { name, qty } = buyItems[idx];

      let storeItems = loadStoreItems();
      const storeIdx = storeItems.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
      if (storeIdx > -1) {
        storeItems[storeIdx].stock = (Number(storeItems[storeIdx].stock) || 0) + qty;
      } else {
        storeItems.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          name,
          stock: qty
        });
      }
      saveStoreItems(storeItems);

      buyItems[idx].addedToStore = true;
      saveBuyItems(buyItems);
      renderBuy();
    }

    window.deleteBuyItem = deleteBuyItem;
    window.addToStoreFromBuy = addToStoreFromBuy;

    function ensureBuyItemsHaveId() {
      let items = loadBuyItems();
      let changed = false;
      items.forEach(i => {
        if (!i.id) {
          i.id = Date.now() + Math.floor(Math.random() * 10000);
          changed = true;
        }
        if (typeof i.addedToStore === "undefined") {
          i.addedToStore = false;
          changed = true;
        }
      });
      if (changed) saveBuyItems(items);
    }
    ensureBuyItemsHaveId();
    setDefaultDate();
    renderBuy();

    // --- Monthly Purchase/Income Section ---
    function getMonthKey(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d)) return '';
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }
    function getMonthDisplay(monthKey) {
      if (!monthKey) return '';
      const [year, month] = monthKey.split('-');
      const d = new Date(year, Number(month)-1, 1);
      return d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
    }
    function sum(arr, key) {
      return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
    }
    function renderMonthly() {
      const buyItems = loadBuyItems();
      const incomeItems = loadIncomeItems();

      // Collect all months from buy and income
      const monthSet = new Set();
      buyItems.forEach(b => { if (b.date) monthSet.add(getMonthKey(b.date)); });
      incomeItems.forEach(i => { if (i.date) monthSet.add(getMonthKey(i.date)); });
      const months = Array.from(monthSet).filter(Boolean).sort();

      let totalPurchase = 0, totalIncome = 0;
      const monthlyList = document.getElementById('monthlyList');
      monthlyList.innerHTML = '';
      months.forEach((monthKey, idx) => {
        // Purchase: sum of all buy amounts in this month
        const purchase = sum(buyItems.filter(b => getMonthKey(b.date) === monthKey), 'amount');
        // Income: sum of all income (total received) in this month
        const income = incomeItems
          .filter(i => getMonthKey(i.date) === monthKey)
          .reduce((acc, i) => acc + sum(i.works || [], 'received'), 0);

        totalPurchase += purchase;
        totalIncome += income;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td class="month-cell">${getMonthDisplay(monthKey)}</td>
          <td>${purchase}</td>
          <td>${income}</td>
        `;
        monthlyList.appendChild(tr);
      });
      document.getElementById('totalPurchase').textContent = totalPurchase;
      document.getElementById('totalIncome').textContent = totalIncome;
    }
    renderMonthly();

    // --- Reset Data and PDF Export ---
    async function resetData() {
      if (!confirm("Are you sure you want to reset all data? A PDF of the monthly report, pending work, and store items will be downloaded before data is cleared.")) return;
      await exportAllPDF();
      localStorage.clear();
      alert("All data has been reset.");
      location.reload();
    }

    // Compose all tables for PDF and export
    async function exportAllPDF() {
      // Monthly
      document.getElementById('pdf-monthly').innerHTML = "<div class='pdf-section-title'>Monthly Purchase/Income</div>" + document.getElementById('monthlyTableContainer').innerHTML;

      // Pending Work
      const pendingWorks = loadPendingWorks();
      let pendingHtml = "<div class='pdf-section-title'>Pending Work</div><table class='pdf-table'><thead><tr><th>#</th><th>Description</th><th>Received (₹)</th><th>Pending (₹)</th><th>Status</th></tr></thead><tbody>";
      if (pendingWorks.length === 0) {
        pendingHtml += "<tr><td colspan='5' style='color:#888;'>No pending works.</td></tr>";
      } else {
        pendingWorks.forEach((w, i) => {
          pendingHtml += `<tr>
            <td>${i+1}</td>
            <td>${w.description || ''}</td>
            <td>${w.received || 0}</td>
            <td>${w.pending || 0}</td>
            <td>${w.status || 'Pending'}</td>
          </tr>`;
        });
      }
      pendingHtml += "</tbody></table>";
      document.getElementById('pdf-pending').innerHTML = pendingHtml;

      // Store Items
      const storeItems = loadStoreItems();
      let storeHtml = "<div class='pdf-section-title'>Store Items</div><table class='pdf-table'><thead><tr><th>#</th><th>Name</th><th>Stock</th></tr></thead><tbody>";
      if (storeItems.length === 0) {
        storeHtml += "<tr><td colspan='3' style='color:#888;'>No items in store.</td></tr>";
      } else {
        storeItems.forEach((s, i) => {
          storeHtml += `<tr>
            <td>${i+1}</td>
            <td>${s.name || ''}</td>
            <td>${s.stock || 0}</td>
          </tr>`;
        });
      }
      storeHtml += "</tbody></table>";
      document.getElementById('pdf-store').innerHTML = storeHtml;

      // Render all as PDF
      const container = document.getElementById('pdf-content');
      container.style.display = 'block';
      await html2canvas(container, { backgroundColor: "#fff", scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        let pdfWidth = pageWidth - 40;
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        if (pdfHeight > pageHeight - 80) {
          pdfHeight = pageHeight - 80;
          pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
        }
        pdf.text("Sri Lakshmi Mobiles - Full Report", 40, 40);
        pdf.addImage(imgData, 'PNG', 20, 60, pdfWidth, pdfHeight);
        pdf.save('full_report.pdf');
      });
      container.style.display = 'none';
    }

    // Update monthly section when buy/income data changes
    window.addEventListener('storage', function(e) {
      if (e.key === BUY_KEY || e.key === INCOME_KEY) renderMonthly();
    });