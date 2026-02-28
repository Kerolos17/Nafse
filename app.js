      let S = {
        user: null,
        startDate: null,
        habits: [],
        days: {},
        apiKey: "",
        workTasks: [],
      };
      let timerSec = 90 * 60,
        timerOn = false,
        timerIv = null,
        selEmoji = "📚",
        chatHist = [],
        activeTaskTimer = null,
        taskTimers = {};

      function init() {
        const d = localStorage.getItem("nafis_v3");
        if (d) {
          S = JSON.parse(d);
          if (!S.workTasks) S.workTasks = [];
          launch();
        } else {
          document.getElementById("sDate").value = tKey();
          document.getElementById("setup").style.display = "flex";
        }
      }

      function save() {
        localStorage.setItem("nafis_v3", JSON.stringify(S));
      }

      function startJourney() {
        const n = document.getElementById("sName").value.trim();
        const g = document.getElementById("sGoal").value.trim();
        const d = document.getElementById("sDate").value;
        const k = document.getElementById("sApiKey").value.trim();
        if (!n || !g || !d) {
          toast("⚠️ اكمل كل البيانات");
          return;
        }
        S = {
          user: { name: n, goal: g },
          startDate: d,
          apiKey: k,
          habits: [
            { id: 1, name: "مذاكرة WordPress", emoji: "📚", active: true },
            { id: 2, name: "تطبيق عملي", emoji: "💻", active: true },
            { id: 3, name: "الجيم", emoji: "🏋️", active: true },
            { id: 4, name: "قراءة Documentation", emoji: "📖", active: true },
          ],
          days: {},
        };
        save();
        document.getElementById("setup").style.display = "none";
        launch();
      }

      function launch() {
        document.getElementById("app").style.display = "flex";
        document.getElementById("setup").style.display = "none";
        updateAll();
      }

      function tKey() {
        return new Date().toISOString().split("T")[0];
      }

      function dayN() {
        if (!S.startDate) return 1;
        const s = new Date(S.startDate);
        s.setHours(0, 0, 0, 0);
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return Math.max(1, Math.floor((t - s) / 86400000) + 1);
      }

      function getDd(k) {
        if (!S.days[k]) S.days[k] = { habits: {}, note: "", mood: "" };
        return S.days[k];
      }

      function todayPct() {
        const d = getDd(tKey());
        const total = S.habits.filter((h) => h.active).length;
        if (!total) return 0;
        return Math.round(
          (Object.values(d.habits).filter(Boolean).length / total) * 100,
        );
      }

      function streak() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let s = 0;
        for (let i = 0; i < 90; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const k = d.toISOString().split("T")[0];
          const data = S.days[k];
          if (data) {
            const total = S.habits.filter((h) => h.active).length;
            const done = Object.values(data.habits).filter(Boolean).length;
            if (total > 0 && done / total >= 0.5) s++;
            else if (i > 0) break;
          } else if (i > 0) break;
        }
        return s;
      }

      function bestStreak() {
        let best = 0,
          cur = 0;
        const start = new Date(S.startDate || new Date());
        for (let i = 0; i < 90; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const data = S.days[d.toISOString().split("T")[0]];
          if (data) {
            const total = S.habits.filter((h) => h.active).length;
            const done = Object.values(data.habits).filter(Boolean).length;
            if (total > 0 && done / total >= 0.5) {
              cur++;
              best = Math.max(best, cur);
            } else cur = 0;
          } else cur = 0;
        }
        return best;
      }

      function avgPct() {
        const all = Object.values(S.days).map((d) => {
          const t = S.habits.filter((h) => h.active).length;
          const dn = Object.values(d.habits).filter(Boolean).length;
          return t > 0 ? (dn / t) * 100 : 0;
        });
        return all.length
          ? Math.round(all.reduce((a, b) => a + b, 0) / all.length)
          : 0;
      }

      function goPage(p) {
        document
          .querySelectorAll(".page")
          .forEach((x) => x.classList.remove("active"));
        document
          .querySelectorAll(".nav-item")
          .forEach((x) => x.classList.remove("active"));
        document.getElementById("page-" + p).classList.add("active");
        document.getElementById("nav-" + p).classList.add("active");
        document.getElementById("content").scrollTop = 0;
        if (p === "home") updateHome();
        if (p === "today") renderToday();
        if (p === "progress") renderProgress();
      }

      function updateAll() {
        updateHome();
        renderToday();
      }

      function updateHome() {
        const dn = Math.min(dayN(), 90);
        const str = streak();
        const pct = todayPct();
        document.getElementById("hStreak").textContent = str;
        document.getElementById("hName").textContent = S.user?.name || "";
        document.getElementById("greet").textContent =
          new Date().getHours() < 12
            ? "صباح النور 👋"
            : new Date().getHours() < 17
              ? "يسعد مساك 👋"
              : "إزيك يا بطل 👋";
        document.getElementById("welcomeMsg").textContent =
          "أهلاً يا " + (S.user?.name || "بطل");
        document.getElementById("dayNum").textContent = dn;
        document.getElementById("sStreak").textContent = str;
        const totalDone = Object.values(S.days).filter((d) => {
          const t = S.habits.filter((h) => h.active).length;
          const dn2 = Object.values(d.habits).filter(Boolean).length;
          return t > 0 && dn2 / t >= 0.5;
        }).length;
        document.getElementById("sDone").textContent = totalDone;
        const elapsed = Math.min(dayN(), 90);
        document.getElementById("sPct").textContent =
          elapsed > 0 ? Math.round((totalDone / elapsed) * 100) + "%" : "0%";
        document.getElementById("sRemain").textContent = Math.max(
          0,
          90 - dayN() + 1,
        );
        const circ = 2 * Math.PI * 32;
        document.getElementById("todayRing").style.strokeDashoffset =
          circ - (pct / 100) * circ;
        document.getElementById("todayPct").textContent = pct + "%";
        const phase = dn <= 30 ? 1 : dn <= 60 ? 2 : 3;
        const pVal =
          phase === 1
            ? Math.min(Math.max(dn - 1, 0), 30)
            : phase === 2
              ? Math.min(Math.max(dn - 30, 0), 30)
              : Math.min(Math.max(dn - 60, 0), 30);
        const pN = {
          1: ["المرحلة 1 — الأساسيات", "PHP + WordPress Core + Hooks"],
          2: ["المرحلة 2 — التطوير", "WooCommerce + REST API + Performance"],
          3: ["المرحلة 3 — الاحتراف", "Portfolio + Freelance + SEO"],
        };
        document.getElementById("phName").textContent = pN[phase][0];
        document.getElementById("phDesc").textContent = pN[phase][1];
        document.getElementById("phBar").style.width = (pVal / 30) * 100 + "%";
        document.getElementById("phProg").textContent = pVal + " / 30 يوم";
        renderCal("calGrid");
      }

      function renderCal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = new Date(S.startDate || new Date());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let html = "";
        for (let i = 1; i <= 90; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i - 1);
          d.setHours(0, 0, 0, 0);
          const k = d.toISOString().split("T")[0];
          const data = S.days[k];
          const isToday = d.getTime() === today.getTime();
          const isFuture = d > today;
          let cls = "cal-cell";
          if (isToday) cls += " today";
          else if (isFuture) cls += " future";
          else if (data) {
            const t = S.habits.filter((h) => h.active).length;
            const dn2 = Object.values(data.habits).filter(Boolean).length;
            const r = t > 0 ? dn2 / t : 0;
            if (r >= 0.8) cls += " done";
            else if (r > 0) cls += " partial";
          }
          html += `<div class="${cls}">${i}</div>`;
        }
        el.innerHTML = html;
      }

      function renderToday() {
        const k = tKey();
        const data = getDd(k);
        const dn = dayN();
        const now = new Date();
        const days = [
          "الأحد",
          "الاثنين",
          "الثلاثاء",
          "الأربعاء",
          "الخميس",
          "الجمعة",
          "السبت",
        ];
        const months = [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ];
        document.getElementById("todayDateTxt").textContent =
          `${days[now.getDay()]}، ${now.getDate()} ${months[now.getMonth()]}`;
        document.getElementById("todayDayBadge").textContent =
          `يوم ${Math.min(dn, 90)}`;
        const active = S.habits.filter((h) => h.active);
        const doneCount = active.filter((h) => data.habits[h.id]).length;
        document.getElementById("habCount").textContent =
          `${doneCount}/${active.length}`;
        document.getElementById("habList").innerHTML = active
          .map(
            (h) => `
    <div class="habit-row ${data.habits[h.id] ? "done" : ""}" onclick="toggleH(${h.id})">
      <div class="habit-check">${data.habits[h.id] ? "✓" : ""}</div>
      <span style="font-size:20px;">${h.emoji}</span>
      <span style="font-weight:600;flex:1;">${h.name}</span>
      <span onclick="event.stopPropagation();removeH(${h.id})" style="color:var(--muted);font-size:20px;padding:4px;cursor:pointer;">×</span>
    </div>`,
          )
          .join("");
        document.getElementById("noteArea").value = data.note || "";
        document
          .querySelectorAll(".mood-btn")
          .forEach((b) =>
            b.classList.toggle("selected", b.textContent.trim() === data.mood),
          );
        renderWorkTasks();
      }

      function toggleH(id) {
        const k = tKey();
        const data = getDd(k);
        data.habits[id] = !data.habits[id];
        save();
        renderToday();
        updateHome();
        toast(data.habits[id] ? "✅ أحسنت!" : "↩ تم الإلغاء");
      }
      function setMood(m, el) {
        getDd(tKey()).mood = m;
        save();
        document
          .querySelectorAll(".mood-btn")
          .forEach((b) => b.classList.remove("selected"));
        el.classList.add("selected");
      }
      function saveNote() {
        getDd(tKey()).note = document.getElementById("noteArea").value;
        save();
      }
      function saveDay() {
        saveNote();
        save();
        updateHome();
        toast("💾 تم حفظ يومك!");
      }

      function openSheet() {
        document.getElementById("habitSheet").style.display = "block";
      }
      function closeSheet() {
        document.getElementById("habitSheet").style.display = "none";
      }
      function pEmoji(el) {
        selEmoji = el.textContent.trim();
        document.getElementById("hEmoji").value = selEmoji;
        document
          .querySelectorAll("#habitSheet span[onclick]")
          .forEach((e) => (e.style.background = "transparent"));
        el.style.background = "rgba(108,99,255,0.2)";
      }
      function addHabit() {
        const name = document.getElementById("hName").value.trim();
        const emoji =
          document.getElementById("hEmoji").value.trim() || selEmoji;
        if (!name) {
          toast("⚠️ اكتب اسم المهمة");
          return;
        }
        S.habits.push({ id: Date.now(), name, emoji, active: true });
        save();
        closeSheet();
        renderToday();
        document.getElementById("hName").value = "";
        toast("✅ تمت الإضافة");
      }
      function removeH(id) {
        S.habits = S.habits.filter((h) => h.id !== id);
        save();
        renderToday();
      }

      // ==================== WORK TASKS ====================
      let selectedPriority = "medium",
        workReportCache = "";

      function openWorkSheet() {
        document.getElementById("workSheet").style.display = "block";
        selectedPriority = "medium";
      }
      function closeWorkSheet() {
        document.getElementById("workSheet").style.display = "none";
      }

      function selectPriority(p, el) {
        selectedPriority = p;
        document
          .querySelectorAll(".priority-btn")
          .forEach((b) => b.classList.remove("active"));
        el.classList.add("active");
      }

      function addWorkTask() {
        const name = document.getElementById("wTaskName").value.trim();
        const time = parseInt(document.getElementById("wTaskTime").value) || 30;
        const notes = document.getElementById("wTaskNotes").value.trim();
        if (!name) {
          toast("⚠️ اكتب اسم المهمة");
          return;
        }
        const k = tKey();
        if (!S.workTasks) S.workTasks = [];
        S.workTasks.push({
          id: Date.now(),
          name,
          priority: selectedPriority,
          estimatedTime: time,
          notes,
          done: false,
          actualTime: 0,
          date: k,
        });
        save();
        closeWorkSheet();
        renderToday();
        document.getElementById("wTaskName").value = "";
        document.getElementById("wTaskNotes").value = "";
        toast("✅ تمت إضافة المهمة");
      }

      function toggleWorkTask(id) {
        const task = S.workTasks.find((t) => t.id === id);
        if (!task) return;
        task.done = !task.done;
        if (task.done && activeTaskTimer === id) {
          stopTaskTimer(id);
        }
        save();
        renderToday();
        toast(task.done ? "✅ مهمة مكتملة!" : "↩ تم الإلغاء");
      }

      function startTaskTimer(id) {
        if (activeTaskTimer) {
          stopTaskTimer(activeTaskTimer);
        }
        activeTaskTimer = id;
        if (!taskTimers[id]) taskTimers[id] = 0;
        const iv = setInterval(() => {
          taskTimers[id]++;
          const task = S.workTasks.find((t) => t.id === id);
          if (task) task.actualTime = taskTimers[id];
          save();
          renderToday();
        }, 1000);
        taskTimers[id + "_iv"] = iv;
        renderToday();
      }

      function stopTaskTimer(id) {
        if (taskTimers[id + "_iv"]) {
          clearInterval(taskTimers[id + "_iv"]);
          delete taskTimers[id + "_iv"];
        }
        if (activeTaskTimer === id) activeTaskTimer = null;
        renderToday();
      }

      function deleteWorkTask(id) {
        if (activeTaskTimer === id) stopTaskTimer(id);
        S.workTasks = S.workTasks.filter((t) => t.id !== id);
        save();
        renderToday();
        toast("🗑️ تم الحذف");
      }

      function formatTime(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        if (h > 0) return `${h}س ${m}د`;
        if (m > 0) return `${m}د ${s}ث`;
        return `${s}ث`;
      }

      function renderWorkTasks() {
        if (!S.workTasks) S.workTasks = [];
        const k = tKey();
        const todayTasks = S.workTasks.filter((t) => t.date === k);
        const el = document.getElementById("workTasksList");
        if (!el) return;
        if (todayTasks.length === 0) {
          el.innerHTML =
            '<p style="color:var(--muted);text-align:center;padding:16px;font-size:12px;">مفيش مهام شغل النهارده 💼</p>';
          return;
        }
        const sorted = [...todayTasks].sort((a, b) => {
          const pOrder = { high: 0, medium: 1, low: 2 };
          if (a.done !== b.done) return a.done ? 1 : -1;
          return pOrder[a.priority] - pOrder[b.priority];
        });
        el.innerHTML = sorted
          .map((t) => {
            const pEmoji = { high: "🔴", medium: "🟡", low: "🟢" }[t.priority];
            const isRunning = activeTaskTimer === t.id;
            return `
            <div class="work-task ${t.done ? "done" : ""} priority-${t.priority}">
              <div class="task-header">
                <div class="task-check" onclick="toggleWorkTask(${t.id})">${t.done ? "✓" : ""}</div>
                <div class="task-title">${t.name}</div>
                <div class="task-priority">${pEmoji}</div>
                <span onclick="deleteWorkTask(${t.id})" style="color:var(--muted);font-size:18px;padding:4px;cursor:pointer;">×</span>
              </div>
              <div class="task-meta">
                <div class="task-time">⏱️ ${t.actualTime > 0 ? formatTime(t.actualTime) : t.estimatedTime + "د"}</div>
                ${!t.done ? `<div class="task-timer-btn ${isRunning ? "active" : ""}" onclick="${isRunning ? "stopTaskTimer" : "startTaskTimer"}(${t.id})">${isRunning ? "⏸ إيقاف" : "▶ ابدأ"}</div>` : ""}
                ${t.notes ? `<div style="flex:1;font-size:10px;opacity:0.7;">${t.notes.substring(0, 30)}${t.notes.length > 30 ? "..." : ""}</div>` : ""}
              </div>
            </div>
          `;
          })
          .join("");
      }

      async function analyzeWorkTasks() {
        const btn = document.getElementById("analyzeBtn");
        const el = document.getElementById("workAnalysis");
        if (
          !S.workTasks ||
          S.workTasks.filter((t) => t.date === tKey() && !t.done).length === 0
        ) {
          toast("⚠️ مفيش مهام للتحليل");
          return;
        }
        btn.disabled = true;
        btn.textContent = "⏳";
        el.style.display = "block";
        el.innerHTML =
          '<div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        const tasks = S.workTasks
          .filter((t) => t.date === tKey() && !t.done)
          .map(
            (t) =>
              `${t.priority === "high" ? "🔴" : "🟡"} ${t.name} (${t.estimatedTime}د)`,
          )
          .join("\n");
        const r = await callAI(
          `مهام الشغل النهارده:\n${tasks}\n\nحللهم ورتبهم حسب الأولوية والوقت. اقترح ترتيب تنفيذ ذكي. 3-4 جمل.`,
          buildCtx(),
        );
        el.textContent = r;
        btn.disabled = false;
        btn.textContent = "🤖 حلل";
      }

      async function generateWorkReport() {
        const btn = document.getElementById("reportWorkBtn");
        const el = document.getElementById("workReportTxt");
        const copyBtn = document.getElementById("copyReportBtn");
        btn.disabled = true;
        btn.textContent = "⏳";
        const k = tKey();
        const tasks = S.workTasks.filter((t) => t.date === k);
        if (tasks.length === 0) {
          toast("⚠️ مفيش مهام للتقرير");
          btn.disabled = false;
          btn.textContent = "📋 اعمل";
          return;
        }
        const done = tasks.filter((t) => t.done);
        const pending = tasks.filter((t) => !t.done);
        const totalTime = done.reduce(
          (sum, t) => sum + (t.actualTime || t.estimatedTime * 60),
          0,
        );
        const tasksStr = `مكتمل (${done.length}):\n${done.map((t) => `✅ ${t.name}`).join("\n")}\n\nمتبقي (${pending.length}):\n${pending.map((t) => `⏳ ${t.name}`).join("\n")}`;
        const r = await callAI(
          `اعمل تقرير شغل يومي احترافي جاهز للإرسال:\n\n${tasksStr}\n\nالوقت: ${formatTime(totalTime)}\n\nالتقرير يكون: عملت إيه + هعمل إيه + أي تحديات. مختصر وواضح.`,
          buildCtx(),
        );
        workReportCache = r;
        el.textContent = r;
        copyBtn.style.display = "block";
        btn.disabled = false;
        btn.textContent = "📋 اعمل";
      }

      function copyWorkReport() {
        if (!workReportCache) {
          toast("⚠️ مفيش تقرير");
          return;
        }
        navigator.clipboard
          .writeText(workReportCache)
          .then(() => toast("📋 تم النسخ!"))
          .catch(() => toast("❌ فشل النسخ"));
      }

      function renderProgress() {
        document.getElementById("pTotal").textContent = Object.keys(
          S.days,
        ).length;
        document.getElementById("pBest").textContent = bestStreak();
        document.getElementById("pAvg").textContent = avgPct() + "%";
        document.getElementById("pRemain2").textContent = Math.max(
          0,
          90 - dayN() + 1,
        );
        renderCal("fullCal");
        const entries = Object.entries(S.days)
          .filter(([, d]) => d.note)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 5);
        document.getElementById("journal").innerHTML = entries.length
          ? entries
              .map(([k, d]) => {
                const dn2 = S.startDate
                  ? Math.floor(
                      (new Date(k) - new Date(S.startDate)) / 86400000,
                    ) + 1
                  : "-";
                return `<div style="padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span>${d.mood || "📅"}</span><span style="font-weight:700;font-size:12px;color:var(--accent);">يوم ${dn2}</span><span style="font-size:11px;color:var(--muted);">${k}</span></div>
      <p style="font-size:13px;line-height:1.7;">${d.note}</p></div>`;
              })
              .join("")
          : '<p style="color:var(--muted);text-align:center;padding:16px;font-size:13px;">لسه مفيش ملاحظات ✍️</p>';
      }

      function saveApiKey() {
        S.apiKey = document.getElementById("newApiKey").value.trim();
        save();
        toast("🔑 تم حفظ الـ API Key");
      }
      function resetApp() {
        if (!confirm("هتمسح كل بياناتك! مؤكد؟")) return;
        localStorage.removeItem("nafis_v3");
        location.reload();
      }
      function exportData() {
        const a = Object.assign(document.createElement("a"), {
          href: URL.createObjectURL(
            new Blob([JSON.stringify(S, null, 2)], {
              type: "application/json",
            }),
          ),
          download: `nafis_${tKey()}.json`,
        });
        a.click();
        toast("📤 تم التصدير!");
      }

      function toggleTimer() {
        if (timerOn) {
          clearInterval(timerIv);
          timerOn = false;
          document.getElementById("timerBtn").textContent = "▶";
        } else {
          timerOn = true;
          document.getElementById("timerBtn").textContent = "⏸";
          timerIv = setInterval(() => {
            if (timerSec <= 0) {
              clearInterval(timerIv);
              timerOn = false;
              document.getElementById("timerBtn").textContent = "▶";
              toast("🎉 انتهت الجلسة! عظيم");
              return;
            }
            timerSec--;
            updTimer();
          }, 1000);
        }
      }
      function resetTimer() {
        clearInterval(timerIv);
        timerOn = false;
        timerSec = parseInt(document.getElementById("timerSel").value) * 60;
        document.getElementById("timerBtn").textContent = "▶";
        updTimer();
      }
      function updTimer() {
        const m = Math.floor(timerSec / 60),
          s = timerSec % 60;
        document.getElementById("timerDisp").textContent =
          String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }

      function buildCtx() {
        const dn = Math.min(dayN(), 90);
        const str = streak();
        const phase = dn <= 30 ? 1 : dn <= 60 ? 2 : 3;
        const recentDays = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const k = d.toISOString().split("T")[0];
          const data = S.days[k];
          if (data) {
            const total = S.habits.filter((h) => h.active).length;
            const done = Object.values(data.habits).filter(Boolean).length;
            recentDays.push({
              date: k,
              pct: total > 0 ? Math.round((done / total) * 100) : 0,
              mood: data.mood || "-",
              note: data.note?.substring(0, 50) || "",
            });
          }
        }
        const phN = {
          1: "الأساسيات (PHP+WordPress+Hooks)",
          2: "التطوير (WooCommerce+REST API)",
          3: "الاحتراف (Portfolio+Freelance)",
        };
        const k = tKey();
        const todayWork = S.workTasks
          ? S.workTasks.filter((t) => t.date === k)
          : [];
        const workStr =
          todayWork.length > 0
            ? `\n\n== مهام الشغل اليوم ==\n${todayWork.map((t) => `${t.done ? "✅" : "⏳"} ${t.name} [${t.priority === "high" ? "🔴 عالية" : t.priority === "medium" ? "🟡 متوسطة" : "🟢 منخفضة"}] (${t.estimatedTime}د)`).join("\n")}`
            : "";
        return `أنت "نافس AI" — مساعد شخصي ذكي ومحفز يتكلم عربي بأسلوب صريح ومباشر.

== المستخدم ==
الاسم: ${S.user?.name} | الهدف: ${S.user?.goal}
اليوم: ${dn}/90 | المرحلة: ${phase} — ${phN[phase]}
Streak: ${str} يوم | متوسط: ${avgPct()}% | اليوم: ${todayPct()}%

== آخر 7 أيام ==
${recentDays.map((d) => `${d.date}: ${d.pct}% مزاج:${d.mood}${d.note ? ' "' + d.note + '"' : ""}`).join("\n") || "لا توجد بيانات"}

== المهام ==
${S.habits
  .filter((h) => h.active)
  .map((h) => h.emoji + " " + h.name)
  .join(" | ")}${workStr}

قواعد: رد عربي، مباشر، عملي، محفز. استخدم البيانات الحقيقية. لا تطول.`.trim();
      }

      async function callAI(msg, sys) {
        if (!S.apiKey)
          return "⚠️ محتاج API Key من Google Gemini — روح صفحة التقدم ← الإعدادات وحطه هناك.\n\nللحصول عليه: aistudio.google.com/app/apikey";
        
        // Gemini uses 'model' instead of 'assistant' for the AI role.
        const formattedMsgs = chatHist.map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            parts: [{ text: m.content }]
        }));
        formattedMsgs.push({ role: "user", parts: [{ text: msg }] });

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${S.apiKey}`;
        
        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    system_instruction: { 
                        parts: [{ text: sys || buildCtx() }] 
                    },
                    contents: formattedMsgs,
                    generationConfig: {
                        maxOutputTokens: 800,
                    }
                }),
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                if (res.status === 400 && e.error?.message?.includes('API key not valid')) return "❌ الـ API Key غلط. تأكد منه.";
                if (res.status === 429) return "⏳ ضغط على الـ API، استنى ثواني وحاول.";
                return `❌ خطأ ${res.status}: ${e.error?.message || "حاول تاني"}`;
            }

            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "مفيش رد من Gemini.";
            
        } catch (e) {
            console.error("API Error:", e);
            return "❌ مشكلة في الاتصال بمخدمات Gemini. تأكد من:\n• الإنترنت شغال\n• الـ API Key صحيح";
        }
      }

      async function sendMsg() {
        const input = document.getElementById("chatIn");
        const msg = input.value.trim();
        if (!msg) return;
        input.value = "";
        addBubble(msg, "user");
        chatHist.push({ role: "user", content: msg });
        document.getElementById("sendBtn").disabled = true;
        showTyping();
        const reply = await callAI(msg);
        hideTyping();
        addBubble(reply, "ai");
        chatHist.push({ role: "assistant", content: reply });
        if (chatHist.length > 20) chatHist = chatHist.slice(-20);
        document.getElementById("sendBtn").disabled = false;
      }

      function qp(msg) {
        document.getElementById("chatIn").value = msg;
        sendMsg();
      }

      function addBubble(txt, role) {
        const wrap = document.createElement("div");
        wrap.style.cssText = `display:flex;justify-content:${role === "user" ? "flex-start" : "flex-end"};`;
        wrap.innerHTML = `<div class="bubble ${role}" style="white-space:pre-wrap;">${txt}</div>`;
        const msgs = document.getElementById("chatMsgs");
        msgs.appendChild(wrap);
        msgs.scrollTop = msgs.scrollHeight;
      }

      function showTyping() {
        const msgs = document.getElementById("chatMsgs");
        const div = document.createElement("div");
        div.id = "typing";
        div.style.cssText = "display:flex;justify-content:flex-end;";
        div.innerHTML =
          '<div class="bubble ai"><div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      }
      function hideTyping() {
        const el = document.getElementById("typing");
        if (el) el.remove();
      }

      async function genInsight() {
        const btn = document.getElementById("insightBtn");
        const txt = document.getElementById("insightTxt");
        btn.disabled = true;
        btn.textContent = "⏳";
        txt.innerHTML =
          '<div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        const r = await callAI(
          "حلل أدائي بإيجاز: 1) إيه بعمله كويس 2) إيه أحسنه 3) نصيحة واحدة لليوم. 3-4 جمل بس.",
          buildCtx(),
        );
        txt.textContent = r;
        btn.disabled = false;
        btn.textContent = "تحليل";
      }

      async function suggestTask() {
        const el = document.getElementById("taskSuggest");
        el.textContent = "⏳ بفكر...";
        const dow = [
          "الأحد",
          "الاثنين",
          "الثلاثاء",
          "الأربعاء",
          "الخميس",
          "الجمعة",
          "السبت",
        ][new Date().getDay()];
        const r = await callAI(
          `يوم ${dow}. اقترح مهمة واحدة محددة لجلسة المذاكرة حسب مرحلتي. اسم المهمة + جملة شرح + السبب. مش أكتر من 3 جمل.`,
          buildCtx(),
        );
        el.textContent = r;
      }

      async function weeklyReport() {
        const btn = document.getElementById("reportBtn");
        const txt = document.getElementById("reportTxt");
        btn.disabled = true;
        btn.textContent = "⏳";
        txt.innerHTML =
          '<div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        const r = await callAI(
          "اعملي تقرير أسبوعي: الإنجازات، التحديات، نقاط القوة والضعف، وتوصية للأسبوع الجاي. صريح وعملي.",
          buildCtx(),
        );
        txt.textContent = r;
        btn.disabled = false;
        btn.textContent = "اعمل تقرير";
      }

      function toast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.style.transform = "translateX(-50%) translateY(0)";
        setTimeout(() => {
          t.style.transform = "translateX(-50%) translateY(80px)";
        }, 2500);
      }

      init();
