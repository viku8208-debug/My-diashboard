export function injectNavigation() {
    const navHTML = `
    <nav class="sidebar">
        <h2 style="color: var(--primary-color); margin-bottom: 2rem;">StudentSathi</h2>
        <a href="dashboard.html" class="nav-link" id="nav-home"><span class="icon">🏠</span> Home</a>
        <a href="reels.html" class="nav-link" id="nav-reels"><span class="icon">📱</span> Study Reels</a>
        <a href="notes.html" class="nav-link" id="nav-notes"><span class="icon">📚</span> Notes</a>
        <a href="marketplace.html" class="nav-link" id="nav-marketplace"><span class="icon">🛒</span> Marketplace</a>
        <a href="messages.html" class="nav-link" id="nav-messages"><span class="icon">💬</span> Messages</a>
        <a href="profile.html" class="nav-link" id="nav-profile"><span class="icon">👤</span> Profile</a>
        <div style="flex-grow: 1;"></div>
        <button onclick="logout()" style="background: #eee; color: #333;">Logout</button>
    </nav>

    <nav class="bottom-nav">
        <a href="dashboard.html" class="nav-link" id="mob-home">🏠</a>
        <a href="reels.html" class="nav-link" id="mob-reels">📱</a>
        <a href="notes.html" class="nav-link" id="mob-notes">📚</a>
        <a href="marketplace.html" class="nav-link" id="mob-marketplace">🛒</a>
        <a href="messages.html" class="nav-link" id="mob-messages">💬</a>
        <a href="profile.html" class="nav-link" id="mob-profile">👤</a>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Highlight active link
    const path = window.location.pathname;
    const page = path.split("/").pop().split(".")[0] || "index";
    if (page) {
        const activeLink = document.getElementById(`nav-${page}`) || document.getElementById(`mob-${page}`);
        if (activeLink) activeLink.classList.add('active');
        const mobActiveLink = document.getElementById(`mob-${page}`);
        if (mobActiveLink) mobActiveLink.classList.add('active');
    }
}

export function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
