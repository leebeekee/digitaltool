import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc, setDoc, updateDoc, increment, getDoc, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTION_NAME = 'group_sites'; // 사이트 등록
const EVAL_COLLECTION = 'evaluations'; // 평가 집계
const LOG_COLLECTION = 'evaluation_logs'; // 개별 상세 로그 (NEW)
let isAdmin = false;
let logUnsubscribe = null; // 로그 구독 관리

const teams = [
    { id: 'team_1', name: '1조' }, { id: 'team_2', name: '2조' },
    { id: 'team_3', name: '3조' }, { id: 'team_4', name: '4조' },
    { id: 'team_5', name: '5조' }, { id: 'team_6', name: '6조' },
    { id: 'team_7', name: '7조' }, { id: 'team_8', name: '8조' },
    { id: 'team_9', name: '9조' }, { id: 'team_10', name: '10조' },
    { id: 'team_11', name: '11조' } 
];

// --- Global Ranking ---
const rankingList = document.getElementById('rankingList');
if (rankingList) {
    onSnapshot(collection(db, EVAL_COLLECTION), (snapshot) => {
        const rankings = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const tm = teams.find(t => t.id === docSnap.id);
            if (tm && data.count > 0) {
                const total = 20 * ((data.sum_creative/data.count * 0.5) + (data.sum_complete/data.count * 0.4) + (data.sum_design/data.count * 0.1));
                rankings.push({ name: tm.name, score: total, count: data.count });
            }
        });
        rankings.sort((a, b) => b.score - a.score);
        rankingList.innerHTML = '';
        if (rankings.length === 0) rankingList.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">데이터 없음</div>';

        rankings.forEach((r, i) => {
            const div = document.createElement('div');
            div.className = `ranking-item rank-${i+1}`;
            div.innerHTML = `
                <div style="display:flex;align-items:center;"><span class="rank-badge">${i+1}위</span> <strong>${r.name}</strong></div>
                <div><span style="font-size:0.9em;color:#666;margin-right:10px;">${r.count}명</span> <strong class="team-score">${r.score.toFixed(1)}점</strong></div>
            `;
            rankingList.appendChild(div);
        });
    });
}

// --- Admin Logic ---
window.openAdminModal = function() {
    const modal = document.getElementById('loginModal');
    if(modal) modal.classList.remove('hidden');
}
window.closeAdminModal = function() {
    const modal = document.getElementById('loginModal');
    if(modal) modal.classList.add('hidden');
}
window.tryAdminLogin = function() {
    const id = document.getElementById('adminId').value;
    const pw = document.getElementById('adminPw').value;
    
    if (id === 'abc' && pw === '1234') { 
        isAdmin = true; 
        alert('관리자 모드 전환 완료'); 
        closeAdminModal();
        const loginBtn = document.getElementById('adminLoginBtn');
        const resetBtn = document.getElementById('resetAllBtn');
        const adminLogSection = document.getElementById('adminLogSection');
        
        if(loginBtn) loginBtn.style.display = 'none';
        if(resetBtn) resetBtn.classList.remove('hidden');
        if(adminLogSection) {
            adminLogSection.classList.remove('hidden'); // 로그 섹션 표시
            subscribeToLogs(); // 로그 구독 시작
        }
        
        document.body.classList.add('admin-mode');
        loadGroups();
    } else { alert('실패'); }
}

// 로그 구독 함수 (관리자용)
function subscribeToLogs() {
    if (logUnsubscribe) logUnsubscribe();
    
    const logList = document.getElementById('adminLogList');
    if (!logList) return;

    // 최신순 정렬
    const q = query(collection(db, LOG_COLLECTION), orderBy('timestamp', 'desc'));
    
    logUnsubscribe = onSnapshot(q, (snapshot) => {
        logList.innerHTML = '';
        if (snapshot.empty) {
            logList.innerHTML = '<div style="padding:10px; color:#888;">기록된 상세 로그가 없습니다.</div>';
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.innerHTML = `
            <tr style="background:#eee; text-align:left;">
                <th style="padding:8px;">시간</th>
                <th style="padding:8px;">대상</th>
                <th style="padding:8px;">창의</th>
                <th style="padding:8px;">완성</th>
                <th style="padding:8px;">디자인</th>
                <th style="padding:8px;">총점</th>
            </tr>
        `;

        snapshot.forEach(doc => {
            const d = doc.data();
            const date = d.timestamp ? new Date(d.timestamp.toDate()).toLocaleTimeString() : '-';
            // 개별 건에 대한 100점 환산
            const total = 20 * (d.creative * 0.5 + d.complete * 0.4 + d.design * 0.1); 
            
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
            tr.innerHTML = `
                <td style="padding:8px; color:#666;">${date}</td>
                <td style="padding:8px; font-weight:bold;">${d.teamName}</td>
                <td style="padding:8px;">${d.creative}</td>
                <td style="padding:8px;">${d.complete}</td>
                <td style="padding:8px;">${d.design}</td>
                <td style="padding:8px; color:#e74c3c;">${total.toFixed(0)}</td>
            `;
            table.appendChild(tr);
        });
        logList.appendChild(table);
    });
}

// 데이터 전체 초기화 (두 컬렉션 모두 삭제)
window.resetAllData = async function() {
    if (!isAdmin) return;
    if (!confirm('⚠️ 모든 평가 데이터(집계 및 상세로그)가 삭제됩니다. 초기화하시겠습니까?')) return;

    try {
        const batch = writeBatch(db);
        
        // 1. 집계 데이터 삭제
        const evalSnap = await getDocs(collection(db, EVAL_COLLECTION));
        evalSnap.forEach((doc) => batch.delete(doc.ref));

        // 2. 로그 데이터 삭제
        const logSnap = await getDocs(collection(db, LOG_COLLECTION));
        logSnap.forEach((doc) => batch.delete(doc.ref));

        await batch.commit();
        alert('초기화 완료되었습니다.');
    } catch (e) {
        console.error(e);
        alert('오류: ' + e.message);
    }
}

// --- Register Logic ---
const groupForm = document.getElementById('groupForm');
const groupList = document.getElementById('groupList');

if (groupForm) {
    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                groupNum: parseInt(document.getElementById('groupNum').value),
                participants: document.getElementById('participants').value,
                title: document.getElementById('title').value,
                desc: document.getElementById('desc').value,
                url: document.getElementById('url').value,
                timestamp: serverTimestamp()
            });
            alert('등록 완료'); groupForm.reset();
        } catch (err) { alert(err.message); }
    });
}

function loadGroups() {
    if (!groupList) return;
    const q = query(collection(db, COLLECTION_NAME), orderBy("groupNum", "asc"));
    onSnapshot(q, (snapshot) => {
        groupList.innerHTML = '';
        if(document.getElementById('totalCount')) document.getElementById('totalCount').textContent = `(${snapshot.size}팀)`;
        if(snapshot.empty) { groupList.innerHTML = '<div class="loading">없음</div>'; return; }
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const delBtn = isAdmin ? `<button class="delete-btn" onclick="deleteItem('${docSnap.id}')">삭제</button>` : '';
            const desc = data.desc ? `<div class="item-desc">${escapeHtml(data.desc)}</div>` : '';
            const item = document.createElement('div');
            item.className = 'group-item';
            item.innerHTML = `
                <div style="flex:1;">
                    <h3><span class="badge">${data.groupNum}조</span> <a href="${data.url}" target="_blank">${escapeHtml(data.title)}</a></h3>
                    ${desc}
                    <div class="group-meta">${escapeHtml(data.participants)}</div>
                </div>
                <div>${delBtn}</div>
            `;
            groupList.appendChild(item);
        });
    });
}

window.deleteItem = async function(id) {
    if (!isAdmin || !confirm('삭제?')) return;
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}
function escapeHtml(text) { if(!text) return ""; return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
loadGroups();
