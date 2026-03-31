/* ── leaderboard.js ── */
const Leaderboard = {
  activeFilter: 'all',

  render() {
    const allUsers = APP.users;
    const creators = allUsers
      .filter(u => u.role === 'creator')
      .sort((a,b)=>(b.vpCoins||0)-(a.vpCoins||0));

    const top3 = creators.slice(0,3);
    const rest = creators.slice(3);
    const myRank = creators.findIndex(u=>u.id===APP.user?.id)+1;
    const myEntry = creators.find(u=>u.id===APP.user?.id);

    document.getElementById('mainContent').innerHTML = `
      ${myEntry ? `
      <div class="card" style="margin-bottom:20px;background:rgba(192,38,211,.06);border-color:rgba(192,38,211,.2);">
        <div class="flex-between flex-wrap" style="gap:10px;">
          <div>
            <div style="font-size:.75rem;color:var(--text-3);margin-bottom:4px;">YOUR RANKING</div>
            <div style="font-size:1.5rem;font-weight:800;">#${myRank}</div>
            <div style="font-size:.82rem;color:var(--text-2);">${myEntry.name} · <span class="tier-badge ${getTier(myEntry.vpCoins||0).cls}">${getTier(myEntry.vpCoins||0).label}</span></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:.75rem;color:var(--text-3);margin-bottom:4px;">YOUR VP</div>
            <div style="font-size:1.5rem;font-weight:800;color:var(--accent3);">${(myEntry.vpCoins||0).toLocaleString()}</div>
            <div style="font-size:.78rem;color:var(--text-3);">Next tier: ${this.nextTierInfo(myEntry.vpCoins||0)}</div>
          </div>
        </div>
      </div>` : ''}

      <div class="lb-filters">
        ${['all','action','romance','fantasy','scifi','horror'].map(f=>`
          <button class="lb-filter-btn ${this.activeFilter===f?'active':''}" onclick="Leaderboard.setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
      </div>

      ${top3.length >= 3 ? `
      <div class="podium">
        <div class="podium-item p2">${top3[1] ? this.podiumItem(top3[1],2) : ''}</div>
        <div class="podium-item p1">${this.podiumItem(top3[0],1)}</div>
        <div class="podium-item p3">${top3[2] ? this.podiumItem(top3[2],3) : ''}</div>
      </div>` : ''}

      <div class="card">
        <table class="lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Creator</th>
              <th>Tier</th>
              <th>VP Coins</th>
              <th>Works</th>
            </tr>
          </thead>
          <tbody>
            ${creators.slice(0,50).map((u,i)=>{
              const tier = getTier(u.vpCoins||0);
              const isMe = u.id === APP.user?.id;
              return `<tr style="${isMe?'background:rgba(192,38,211,.06)':''}">
                <td><span class="lb-rank">${['🥇','🥈','🥉'][i]||('#'+(i+1))}</span></td>
                <td>
                  <div class="lb-creator-cell">
                    <div class="lb-creator-ava">${u.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div class="lb-creator-name">${u.name}${isMe?' (You)':''}</div>
                      <div class="lb-creator-works">${u.works||0} manga published</div>
                    </div>
                  </div>
                </td>
                <td><span class="tier-badge ${tier.cls}">${tier.label}</span></td>
                <td class="lb-vp-val">${(u.vpCoins||0).toLocaleString()}</td>
                <td style="color:var(--text-3);font-size:.85rem;">${u.works||0}</td>
              </tr>`;
            }).join('')}
            ${!creators.length ? `<tr><td colspan="5"><div class="empty-state" style="padding:30px;"><div class="empty-icon">🏆</div><div class="empty-title">No creators yet</div><div class="empty-desc">Be the first to publish manga!</div></div></td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="section-title" style="margin-bottom:12px">📊 Tier System</div>
        <div style="display:grid;gap:8px;">
          ${[['🥉 Bronze','0–499 VP','Basic badge'],['🥈 Silver','500–1,999 VP','Highlighted in Discover'],['🥇 Gold','2,000–9,999 VP','Featured section + bonus VP'],['💎 Diamond','10,000–49,999 VP','Homepage spotlight + monthly bonus'],['👑 Legend','50,000+ VP','Top creator crown + exclusive events']].map(([tier,range,perk])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);flex-wrap:wrap;gap:8px;">
              <div><div style="font-weight:600;font-size:.88rem;">${tier}</div><div style="font-size:.75rem;color:var(--text-3);">${perk}</div></div>
              <div style="font-size:.82rem;color:var(--accent3);font-weight:600;">${range}</div>
            </div>`).join('')}
        </div>
      </div>
    `;
  },

  podiumItem(u, rank) {
    const medals = ['🥇','🥈','🥉'];
    const blockH = [80,60,40][rank-1];
    return `
      <div class="podium-rank-icon">${medals[rank-1]}</div>
      <div class="podium-avatar" style="width:${rank===1?72:56}px;height:${rank===1?72:56}px;font-size:${rank===1?'1.1rem':'0.9rem'}">${u.name.slice(0,2).toUpperCase()}</div>
      <div class="podium-name">${u.name}</div>
      <div class="podium-vp-val">${(u.vpCoins||0).toLocaleString()} VP</div>
      <div class="podium-block" style="height:${blockH}px"></div>
    `;
  },

  nextTierInfo(vp) {
    if (vp < 500)   return `${500-vp} VP to Silver`;
    if (vp < 2000)  return `${2000-vp} VP to Gold`;
    if (vp < 10000) return `${10000-vp} VP to Diamond`;
    if (vp < 50000) return `${50000-vp} VP to Legend`;
    return '👑 Max Tier!';
  },

  setFilter(f) {
    this.activeFilter = f;
    this.render();
  }
};
