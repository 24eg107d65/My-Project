import { useEffect, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowRight, Bell, CalendarDays, Check, CheckCircle2,
  CircleHelp, Clock3, Heart, HeartHandshake, Home, LogOut, MapPin,
  Menu, MessageCircle, Plus, ShieldCheck, Siren, Sparkles, Star, Users, X,
} from 'lucide-react'

const roles = [
  ['SENIOR', 'I need a hand', 'Request trusted neighborhood help', Heart],
  ['FAMILY', 'I support someone', 'Stay close to a loved one’s care', Users],
  ['VOLUNTEER', 'I can lend a hand', 'Make a difference close to home', HeartHandshake],
  ['ADMIN', 'Network coordinator', 'Keep the community running safely', ShieldCheck],
]
const categories = ['Medicine', 'Groceries', 'Transport', 'Hospital visit', 'Digital support', 'Home essentials', 'Companionship']
const navFor = (role) => {
  if (role === 'ADMIN') return [['overview', 'Overview', Home], ['requests', 'Requests', Activity], ['volunteers', 'Volunteers', Users]]
  if (role === 'VOLUNTEER') return [['overview', 'My day', Home], ['requests', 'Open requests', Activity], ['volunteers', 'Community', Users]]
  const items = [['overview', 'Home', Home], ['requests', 'My requests', Activity], ['volunteers', 'Community', Users]]
  if (role === 'FAMILY') items.push(['family', 'Family circle', Heart])
  return items
}

async function api(path, token, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Something went wrong (${response.status}).`)
  }
  return response.json()
}

function App() {
  const [account, setAccount] = useState(() => JSON.parse(sessionStorage.getItem('elderlink-account') || 'null'))
  const [data, setData] = useState(null)
  const [page, setPage] = useState('overview')
  const [modal, setModal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  async function refresh() {
    if (!account?.token) return
    try { setData(await api('/api/dashboard', account.token)); setError('') } catch (err) { setError(err.message) }
  }
  useEffect(() => { void refresh() }, [account?.token])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])
  async function signIn(credentials, endpoint = '/api/auth/login') {
    setBusy(true)
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Email or password is incorrect.')
      sessionStorage.setItem('elderlink-account', JSON.stringify(result))
      setAccount(result)
      setPage('overview')
      setError('')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function register(profile) {
    setBusy(true)
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Could not create the account.')
      setError('')
      return result
    } finally { setBusy(false) }
  }
  async function action(work, message) {
    try { await work(); await refresh(); setToast(message); setError('') } catch (err) { setError(err.message) }
  }
  function signOut() {
    sessionStorage.removeItem('elderlink-account')
    setAccount(null)
    setData(null)
  }
  if (!account) return <Welcome onSignIn={signIn} onRegister={register} onDemo={(role) => signIn({ role }, '/api/auth/demo')} busy={busy} error={error} />
  const nav = navFor(account.role)
  const requests = data?.requests || []
  const people = data?.volunteers || []
  const stats = data?.stats || { open: 0, inProgress: 0, completed: 0, urgent: 0 }
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#home" onClick={() => setPage('overview')}><span className="brand-mark"><HeartHandshake size={21} /></span><span>elderlink<span className="brand-dot">.</span></span></a>
      <div className="side-label">YOUR SPACE</div>
      <nav className="side-nav">{nav.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setMenuOpen(false) }}><Icon size={18} /><span>{label}</span>{id === 'requests' && stats.urgent > 0 && <i className="nav-count">{stats.urgent}</i>}</button>)}</nav>
      <div className="side-bottom"><div className="neighbor-note"><div className="note-icon"><Heart size={17} /></div><p>Good care starts<br />with being here.</p><span>Neighbors make it possible.</span></div><button className="nav-item" onClick={() => setToast('Our care team is here for you at (555) 014-2230.')}><CircleHelp size={17} /><span>Get help</span></button><button className="nav-item" onClick={signOut}><LogOut size={17} /><span>Switch account</span></button><div className="side-profile"><div className="avatar avatar-small">{initials(account.name)}</div><div className="profile-copy"><b>{account.name}</b><span>{roleLabel(account.role, account.verified)}</span></div><ShieldCheck size={16} className="verified-icon" /></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button><div className="crumb">Riverside neighborhood <span>/</span> {nav.find(([id]) => id === page)?.[1] || 'Home'}</div><div className="top-actions"><span className="safe-label"><span className="safe-dot" /> Network active</span><button className="icon-button" aria-label="Notifications" onClick={() => setToast(stats.urgent ? 'An urgent request needs support. See the highlighted request below.' : 'You’re all caught up.')}><Bell size={18} />{stats.urgent > 0 && <i className="notification-dot" />}</button><div className="avatar avatar-top">{initials(account.name)}</div></div></header>
      <div className="content-wrap">
        {error && <div className="alert error-alert"><CircleHelp size={17} /><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}
        {account.role === 'VOLUNTEER' && account.verified === false && <div className="verification-pending-banner"><ShieldCheck size={19} /><div><b>Your helper profile is awaiting review.</b><span>A coordinator will verify your details before you can be matched with a request.</span></div></div>}
        {page === 'overview' && <Overview account={account} requests={requests} people={people} stats={stats} onNew={() => setModal(true)} onPage={setPage} onAction={action} />}
        {page === 'requests' && <RequestsPage role={account.role} requests={requests} people={people} onNew={() => setModal(true)} onAction={action} token={account.token} />}
        {page === 'volunteers' && <VolunteersPage people={people} role={account.role} onAction={action} token={account.token} />}
        {page === 'family' && <FamilyPage requests={requests} people={people} onPage={setPage} onAction={action} token={account.token} />}
      </div>
      <footer className="footer"><span>Here for one another, every day.</span><span><ShieldCheck size={14} /> Your community, thoughtfully connected</span></footer>
    </main>
    {modal && <RequestModal token={account.token} onClose={() => setModal(false)} onCreated={() => { setModal(false); void refresh(); setToast('Your request is on its way to the community.') }} onError={setError} />}
    {toast && <div className="toast"><CheckCircle2 size={17} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
  </div>
}

function Welcome({ onSignIn, onRegister, onDemo, busy, error }) {
  const [mode, setMode] = useState('register')
  const [role, setRole] = useState('SENIOR')
  const [showDemo, setShowDemo] = useState(false)
  const [message, setMessage] = useState('')
  const [interests, setInterests] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', area: 'Riverside', bio: '' })

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    if (mode === 'login') return onSignIn({ email: form.email, password: form.password })
    try {
      const result = await onRegister({ ...form, role, interests: role === 'VOLUNTEER' ? interests : [] })
      setMessage(result.message)
      setMode('login')
    } catch (err) { setMessage(err.message) }
  }

  function toggleInterest(value) {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }
  const submitLabel = { register: 'Create account', login: 'Sign in' }[mode]

  return <main className="welcome-page">
    <header className="welcome-nav"><a className="brand" href="#home"><span className="brand-mark"><HeartHandshake size={21} /></span><span>elderlink<span className="brand-dot">.</span></span></a><span className="welcome-trust"><ShieldCheck size={15} /> A little help, close to home</span></header>
    <section className="welcome-grid"><div className="welcome-copy"><div className="eyebrow"><span /> CARE IS CLOSER THAN YOU THINK</div><h1>Good neighbors.<br /><em>Good days.</em></h1><p className="welcome-sub">A trusted community for everyday help, caring connections, and a little more peace of mind.</p><div className="welcome-proof"><div className="proof-avatars"><span>ME</span><span>PS</span><span>AM</span><span>+24</span></div><div><strong>Neighbors looking out for neighbors</strong><small>One thoughtful connection at a time</small></div></div><div className="welcome-art"><div className="art-sun" /><div className="art-house"><div className="house-roof" /><div className="house-body"><div className="house-window" /><div className="house-door" /></div></div><div className="art-path" /><div className="art-plant plant-one">✳</div><div className="art-plant plant-two">✳</div><div className="art-caption"><span className="caption-heart"><Heart size={16} fill="currentColor" /></span><span>Small acts.<br /><b>Big comfort.</b></span></div></div></div>
      <section className="welcome-select auth-panel"><div className="welcome-select-head"><span className="step-mark">01</span><div><div className="eyebrow">WELCOME TO ELDERLINK</div><h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'register' ? 'Join a neighborhood that looks out for one another.' : 'Sign in to your Elderlink account.'}</p></div></div>
        <div className="auth-tabs"><button type="button" className={mode === 'register' ? 'auth-tab-active' : ''} onClick={() => { setMode('register'); setMessage('') }}>Create account</button><button type="button" className={mode === 'login' ? 'auth-tab-active' : ''} onClick={() => { setMode('login'); setMessage('') }}>Sign in</button></div>
        {mode === 'register' && <div className="account-role-switch" aria-label="Account type"><button type="button" aria-pressed={role === 'SENIOR'} className={role === 'SENIOR' ? 'role-selected' : ''} onClick={() => setRole('SENIOR')}><Heart size={15} /> I need help</button><button type="button" aria-pressed={role === 'VOLUNTEER'} className={role === 'VOLUNTEER' ? 'role-selected' : ''} onClick={() => setRole('VOLUNTEER')}><HeartHandshake size={15} /> I can help</button></div>}
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && <label className="auth-field">Full name<input autoComplete="name" required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>}
          <label className="auth-field">Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label className="auth-field">Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>
          {mode === 'register' && <><div className="auth-field-pair"><label className="auth-field">Phone<input type="tel" autoComplete="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Your phone number" /></label><label className="auth-field">Neighborhood<select value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })}><option>Riverside</option><option>Oakwood</option></select></label></div>
            {role === 'VOLUNTEER' && <><fieldset className="interest-field"><legend>What kind of help interests you?</legend><div className="interest-options">{categories.map((category) => <label key={category} className={interests.includes(category) ? 'interest-selected' : ''}><input type="checkbox" checked={interests.includes(category)} onChange={() => toggleInterest(category)} />{category}</label>)}</div></fieldset><label className="auth-field">A little about you<textarea rows="2" maxLength="1000" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Experience, availability, or anything neighbors should know" /></label><p className="verification-note"><ShieldCheck size={14} /> New helpers are reviewed by a coordinator before they can be matched.</p></>}
          </>}
          {(message || error) && <div className={(message && mode === 'login' ? 'success-message' : 'error-message')}>{message || error}</div>}
          <button type="submit" className="button-primary auth-submit" disabled={busy}>{submitLabel} <ArrowRight size={16} /></button>
        </form>
        <div className="privacy-note"><ShieldCheck size={16} /><span>Your information stays within your care circle.</span></div>
        <div className="demo-access"><button type="button" className="demo-toggle" onClick={() => setShowDemo(!showDemo)}>{showDemo ? 'Hide demo accounts' : 'Explore with a demo account'} <ArrowRight size={13} /></button>{showDemo && <div className="demo-roles">{roles.map(([id, label]) => <button type="button" key={id} disabled={busy} onClick={() => onDemo(id)}>{label}</button>)}</div>}</div>
      </section></section>
    <footer className="welcome-footer"><span>© 2026 Elderlink Community Network</span><span><MapPin size={13} /> Riverside & Oakwood</span><span>Made for the moments that matter</span></footer>
  </main>
}

function Overview({ account, requests, people, stats, onNew, onPage, onAction }) {
  const role = account.role
  const active = requests.filter((request) => !['COMPLETED', 'CANCELLED'].includes(request.status))
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const greetings = { VOLUNTEER: 'Your kindness is in good company.', ADMIN: 'Here’s how the neighborhood is doing.', SENIOR: 'A good day starts with knowing help is near.', FAMILY: 'A good day starts with knowing help is near.' }
  const sectionTitle = { VOLUNTEER: 'A few ways to show up', ADMIN: 'Community pulse' }[role] || 'Your neighbors are here'
  const sectionLink = { ADMIN: 'Manage network', VOLUNTEER: 'See requests' }[role] || 'Meet the community'
  const sectionPage = ['ADMIN', 'VOLUNTEER'].includes(role) ? 'requests' : 'volunteers'
  return <>
    <div className="page-intro"><div><div className="eyebrow">{today.toUpperCase()} <span className="eyebrow-dot">·</span> RIVERSIDE</div><h1>{role === 'VOLUNTEER' ? 'Hello, ' : 'Good morning, '}{account.name?.split(' ')[0]}<span className="intro-comma">.</span></h1><p>{greetings[role]}</p></div>{!['VOLUNTEER', 'ADMIN'].includes(role) && <button className="button-primary" onClick={onNew}><Plus size={17} /> Ask for help</button>}</div>
    {stats.urgent > 0 && <div className="urgent-banner"><span className="urgent-icon"><Siren size={18} /></span><div><b>{stats.urgent} urgent {stats.urgent === 1 ? 'request needs' : 'requests need'} a neighbor</b><span>Verified volunteers are being notified now.</span></div><button onClick={() => onPage('requests')}>View request <ArrowRight size={15} /></button></div>}
    <div className="stat-row"><Stat label={role === 'VOLUNTEER' ? 'Ready to help' : 'Waiting for a neighbor'} value={stats.open} icon={HeartHandshake} tone="mint" /><Stat label="In good hands" value={stats.inProgress} icon={Activity} tone="blue" /><Stat label="Kindness delivered" value={stats.completed} icon={CheckCircle2} tone="yellow" /><Stat label="Neighbors nearby" value={people.filter((person) => person.verified).length} icon={Users} tone="coral" /></div>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">THE CARE CIRCLE</div><h2>{sectionTitle}</h2></div><button className="text-link" onClick={() => onPage(sectionPage)}>{sectionLink} <ArrowRight size={15} /></button></div>
      <div className="overview-columns"><div className="request-list-panel"><div className="panel-title"><span>{role === 'VOLUNTEER' ? 'NEEDS A NEIGHBOR' : 'RECENT REQUESTS'}</span><button className="icon-button compact" aria-label="See all requests" onClick={() => onPage('requests')}><ArrowRight size={16} /></button></div>{active.length === 0 ? <EmptyState title="A little quiet, in the best way." detail="There are no active requests right now." /> : active.slice(0, 3).map((request) => <RequestRow key={request.id} request={request} role={role} onAction={onAction} />)}<button className="panel-footer-link" onClick={() => onPage('requests')}>All requests <ArrowRight size={14} /></button></div>
      <div className="neighbor-panel"><div className="neighbor-panel-top"><div><div className="eyebrow">VERIFIED & NEARBY</div><h3>Good people,<br />close by.</h3></div><span className="neighbor-stamp"><Heart size={17} fill="currentColor" /></span></div><div className="neighbor-mini-list">{people.filter((person) => person.verified).slice(0, 3).map((person, index) => <div className="neighbor-mini" key={person.id}><div className={`avatar volunteer-avatar avatar-color-${index}`}>{initials(person.name)}</div><div><b>{person.name}</b><span>{person.specialty} · {person.area}</span></div><span className="rating"><Star size={12} fill="currentColor" /> {Number(person.rating).toFixed(1)}</span></div>)}</div><button className="neighbor-panel-link" onClick={() => onPage('volunteers')}>Get to know them <ArrowRight size={15} /></button></div></div>
    </section>
    <div className="bottom-note"><span className="note-check"><Check size={14} /></span><span><b>You’re part of a caring community.</b> Every helper is verified, and you’re always in control.</span><button onClick={() => onPage(role === 'FAMILY' ? 'family' : 'volunteers')}>Learn about your care circle <ArrowRight size={14} /></button></div>
  </>
}

function Stat({ label, value, icon: Icon, tone }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}><Icon size={19} /></span><div><strong>{value}</strong><span>{label}</span></div><span className="stat-spark"><Activity size={15} /></span></div>
}

function RequestRow({ request, role, onAction }) {
  const Icon = request.emergency ? Siren : ({ Transport: ArrowDownLeft, Medicine: Heart }[request.category] || CalendarDays)
  return <div className={`request-row ${request.emergency && request.status !== 'COMPLETED' ? 'request-urgent' : ''}`}>
    <span className={`request-category-icon ${request.emergency ? 'emergency-category' : ''}`}><Icon size={17} /></span>
    <div className="request-main"><div className="request-title-line"><b>{request.title}</b>{request.emergency && <span className="urgent-pill">URGENT</span>}</div><span>{request.category} <i>·</i> {request.requesterName || 'Margaret Ellis'} <i>·</i> {request.location}</span><div className="request-meta"><Clock3 size={12} /> {request.scheduledFor || 'Time flexible'}{request.volunteerName && <><span className="meta-divider">·</span><span>with {request.volunteerName}</span></>}</div></div>
    <div className="request-tail"><StatusBadge status={request.status} />
      {role === 'VOLUNTEER' && request.status === 'ASSIGNED' && <div className="approval-actions"><button onClick={() => onAction(() => api(`/api/requests/${request.id}/decision`, getToken(), { method: 'POST', body: JSON.stringify({ accepted: true }) }), 'Request accepted. You can now get ready to help.')}>Accept</button><button onClick={() => onAction(() => api(`/api/requests/${request.id}/decision`, getToken(), { method: 'POST', body: JSON.stringify({ accepted: false }) }), 'Request declined. We’ll look for another helper.')}>Decline</button></div>}
      {role === 'VOLUNTEER' && request.status === 'OPEN' && <button className="row-action" onClick={() => onAction(() => api(`/api/requests/${request.id}/claim`, getToken(), { method: 'POST' }), 'Request reserved for you. Please approve it to confirm.')}>Offer help</button>}
      {role === 'VOLUNTEER' && ['MATCHED', 'IN_PROGRESS'].includes(request.status) && <button className="row-action" onClick={() => onAction(() => api(`/api/requests/${request.id}/status`, getToken(), { method: 'PATCH', body: JSON.stringify({ status: request.status === 'MATCHED' ? 'IN_PROGRESS' : 'COMPLETED' }) }), request.status === 'MATCHED' ? 'You’re ready. The request is now in progress.' : 'Another good turn, completed.')}>{request.status === 'MATCHED' ? 'Start helping' : 'Complete'}</button>}
    </div>
  </div>
}

function StatusBadge({ status }) {
  const labels = { OPEN: 'Needs a neighbor', ASSIGNED: 'Waiting for helper approval', MATCHED: 'Helper approved', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
  return <span className={`status-badge status-${status?.toLowerCase()}`}><i />{labels[status] || status}</span>
}

function RequestsPage({ role, requests, people, onNew, onAction, token }) {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Needs help', 'In good hands', 'Completed']
  const isIncluded = (request) => filter === 'All' || (filter === 'Needs help' && ['OPEN', 'ASSIGNED', 'MATCHED'].includes(request.status)) || (filter === 'In good hands' && request.status === 'IN_PROGRESS') || (filter === 'Completed' && request.status === 'COMPLETED')
  const filtered = requests.filter(isIncluded)
  const filterCount = (item) => {
    if (item === 'All') return requests.length
    return requests.filter((request) => {
      if (item === 'Needs help') return ['OPEN', 'ASSIGNED', 'MATCHED'].includes(request.status)
      if (item === 'In good hands') return request.status === 'IN_PROGRESS'
      return request.status === 'COMPLETED'
    }).length
  }
  const requestHeading = { VOLUNTEER: 'Requests nearby', ADMIN: 'Community requests' }[role] || 'Your requests'
  return <><div className="page-intro"><div><div className="eyebrow">THE LITTLE THINGS THAT MATTER</div><h1>{requestHeading}<span className="intro-comma">.</span></h1><p>Every request is a chance to make someone’s day easier.</p></div>{['SENIOR', 'FAMILY'].includes(role) && <button className="button-primary" onClick={onNew}><Plus size={17} /> New request</button>}</div>
    <div className="filter-bar"><div className="filter-tabs">{filters.map((item) => <button className={filter === item ? 'filter-active' : ''} key={item} onClick={() => setFilter(item)}>{item}<span>{filterCount(item)}</span></button>)}</div><div className="sort-label"><CalendarDays size={15} /> Upcoming first</div></div>
    <div className="requests-page-list">{filtered.length ? filtered.map((request) => <RequestCard key={request.id} request={request} people={people} role={role} onAction={onAction} token={token} />) : <EmptyState title="Nothing in this list just yet." detail="Try another filter or check back a little later." />}</div>
  </>
}

function RequestCard({ request, people = [], role, onAction, token }) {
  const [matches, setMatches] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [fallbackPeople, setFallbackPeople] = useState([])
  const CategoryIcon = request.emergency ? Siren : ({ Transport: ArrowDownLeft, Medicine: Heart }[request.category] || CalendarDays)
  useEffect(() => {
    if (people.length > 0 || !request.volunteerId) return undefined
    let active = true
    api('/api/volunteers', token).then((profiles) => {
      if (active) setFallbackPeople(profiles)
    }).catch(() => {})
    return () => { active = false }
  }, [people.length, request.volunteerId, token])
  const helper = people.find((person) => person.id === request.volunteerId)
    || fallbackPeople.find((person) => person.id === request.volunteerId)
  async function showMatches() {
    setExpanded(!expanded)
    if (!expanded && matches.length === 0) {
      try { setMatches(await api(`/api/requests/${request.id}/matches`, token)) } catch (err) { onAction(() => Promise.reject(err), '') }
    }
  }
  return <article className={`request-card ${request.emergency && request.status !== 'COMPLETED' ? 'request-card-emergency' : ''}`}>
    <div className="request-card-top"><div className={`request-category-icon large ${request.emergency ? 'emergency-category' : ''}`}><CategoryIcon size={20} /></div><div className="request-card-title"><div className="request-title-line"><h3>{request.title}</h3>{request.emergency && <span className="urgent-pill">URGENT</span>}</div><span>{request.category} <i>·</i> {request.requesterName || 'Margaret Ellis'}</span></div><StatusBadge status={request.status} /></div>
    <p className="request-description">{request.details || 'A neighbor could make this day a little easier.'}</p><div className="request-card-info"><span><MapPin size={14} />{request.location}</span><span><CalendarDays size={14} />{request.scheduledFor || 'Time flexible'}</span>{request.volunteerName && <span><HeartHandshake size={14} />{request.volunteerName}</span>}</div>
    {request.volunteerId && <div className="assigned-helper"><div className="avatar helper-avatar">{initials(helper?.name || request.volunteerName || '')}</div><div className="helper-copy"><span>YOUR HELPER</span><b>{helper?.name || request.volunteerName}</b><small>{helper ? `${helper.interests || helper.specialty} · ${helper.area}` : 'Profile details unavailable'}</small>{helper?.bio && <small className="helper-bio">{helper.bio}</small>}</div>{helper?.verified ? <span className="verified-label"><ShieldCheck size={15} /> Community verified</span> : <span className="pending-label"><Clock3 size={14} /> Verification unavailable</span>}{helper && <div className="helper-trust-stats"><span><Star size={13} fill="currentColor" /> {Number(helper.rating).toFixed(1)}</span><span>{helper.completed} neighbors helped</span></div>}</div>}
    {role === 'VOLUNTEER' && request.status === 'ASSIGNED' && <div className="approval-actions card-approval"><span>This request is reserved for you. Approve it to confirm you can help.</span><div><button className="button-primary" onClick={() => onAction(() => api(`/api/requests/${request.id}/decision`, token, { method: 'POST', body: JSON.stringify({ accepted: true }) }), 'Request accepted. You can now get ready to help.')}>Approve request</button><button className="button-secondary" onClick={() => onAction(() => api(`/api/requests/${request.id}/decision`, token, { method: 'POST', body: JSON.stringify({ accepted: false }) }), 'Request declined. We’ll look for another helper.')}>Decline</button></div></div>}
    <div className="request-card-footer"><span>Shared {request.createdAt ? new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'just now'}</span><div className="request-actions">{['SENIOR', 'FAMILY', 'ADMIN'].includes(role) && request.status === 'OPEN' && <button className="button-secondary" onClick={showMatches}><Sparkles size={15} />{expanded ? 'Hide neighbors' : 'Find a neighbor'}</button>}{role === 'VOLUNTEER' && request.status === 'OPEN' && <button className="button-secondary" onClick={() => onAction(() => api(`/api/requests/${request.id}/claim`, token, { method: 'POST' }), 'Request reserved for you. Please approve it to confirm.')}>Offer help</button>}{role === 'VOLUNTEER' && request.status === 'MATCHED' && <button className="button-secondary" onClick={() => onAction(() => api(`/api/requests/${request.id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status: 'IN_PROGRESS' }) }), 'You’re ready. The request is now in progress.')}>Start helping</button>}{role === 'VOLUNTEER' && request.status === 'IN_PROGRESS' && <button className="button-secondary" onClick={() => onAction(() => api(`/api/requests/${request.id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) }), 'Request marked complete. Thank you!')}><Check size={15} />Mark complete</button>}{['SENIOR', 'FAMILY'].includes(role) && request.status === 'COMPLETED' && request.volunteerName && !request.rating && <button className="button-secondary" onClick={() => setExpanded(!expanded)}><Star size={15} />Leave a thank-you</button>}{request.rating && <span className="rated-label"><Star size={13} fill="currentColor" /> Thanked {request.rating}/5</span>}</div></div>
    {expanded && ['SENIOR', 'FAMILY', 'ADMIN'].includes(role) && request.status === 'OPEN' && <div className="match-results"><div className="eyebrow">YOUR BEST-FIT NEIGHBORS</div>{matches.length === 0 ? <p>Looking for available, verified neighbors…</p> : matches.slice(0, 3).map((person) => <div className="match-row" key={person.id}><div className="avatar volunteer-avatar">{initials(person.name)}</div><div className="match-person"><b>{person.name}</b><span>{person.specialty} · {person.area} · <Star size={11} fill="currentColor" /> {Number(person.rating).toFixed(1)}</span></div><span className="verified-label"><ShieldCheck size={13} /> Verified</span></div>)}<button className="button-primary match-button" onClick={() => onAction(() => api(`/api/requests/${request.id}/match`, token, { method: 'POST' }), 'A verified neighbor has been matched.')}>Match with best fit <ArrowRight size={15} /></button></div>}
    {expanded && request.status === 'COMPLETED' && ['SENIOR', 'FAMILY'].includes(role) && <form className="feedback-form" onSubmit={(event) => { event.preventDefault(); onAction(() => api(`/api/requests/${request.id}/feedback`, token, { method: 'POST', body: JSON.stringify({ rating, feedback }) }), 'Your thank-you has been shared.'); setExpanded(false) }}><label htmlFor={`feedback-${request.id}`}>How did it go?</label><div className="rating-input">{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${score} stars`} onClick={() => setRating(score)}><Star size={20} fill={score <= rating ? 'currentColor' : 'none'} /></button>)}</div><input id={`feedback-${request.id}`} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Leave a little note (optional)" /><button className="button-primary" type="submit">Send thanks <ArrowRight size={15} /></button></form>}
  </article>
}

function VolunteersPage({ people, role, onAction, token }) {
  return <><div className="page-intro"><div><div className="eyebrow">KINDNESS, CLOSE BY</div><h1>Meet your neighbors<span className="intro-comma">.</span></h1><p>Real people, thoughtfully verified, ready to lend a hand.</p></div></div><div className="community-banner"><span><ShieldCheck size={19} /></span><div><b>Every volunteer is verified by a network coordinator.</b><p>Recommendations consider the kind of help, neighborhood, availability, and community experience.</p></div></div><div className="volunteer-grid">{people.map((person, index) => <article className="volunteer-card" key={person.id}><div className={`volunteer-cover cover-${index % 4}`}><span className="volunteer-cover-mark">{person.specialty.slice(0, 1)}</span><span className={`availability ${person.available ? 'available' : 'not-available'}`}><i />{person.available ? 'Available' : 'Away today'}</span></div><div className="volunteer-card-body"><div className={`avatar volunteer-large avatar-color-${index % 4}`}>{initials(person.name)}</div><div className="volunteer-name-line"><h3>{person.name}</h3>{person.verified && <ShieldCheck size={16} className="verified-icon" />}</div><div className="volunteer-specialty">{person.interests || person.specialty}</div>{person.bio && <p className="volunteer-bio">{person.bio}</p>}<div className="volunteer-location"><MapPin size={14} /> {person.area} neighborhood</div><div className="volunteer-stats"><span><Star size={14} fill="currentColor" /> {Number(person.rating).toFixed(1)} <small>rating</small></span><span><HeartHandshake size={14} /> {person.completed} <small>neighbors helped</small></span></div>{person.verified ? <div className="verified-label"><CheckCircle2 size={14} /> Community verified</div> : <div className="pending-label"><Clock3 size={14} /> Verification pending</div>}{role === 'ADMIN' && <button className="verification-button" onClick={() => onAction(() => api(`/api/volunteers/${person.id}/verification`, token, { method: 'PUT', body: JSON.stringify({ verified: !person.verified }) }), person.verified ? 'Volunteer verification removed.' : 'Volunteer verified and ready to help.')}>{person.verified ? 'Remove verification' : 'Verify volunteer'}</button>}</div></article>)}</div></>
}

function FamilyPage({ requests, people, onPage, onAction, token }) {
  const active = requests.filter((request) => !['COMPLETED', 'CANCELLED'].includes(request.status))
  return <><div className="page-intro"><div><div className="eyebrow">A LITTLE CLOSER, EVEN FROM AFAR</div><h1>Family circle<span className="intro-comma">.</span></h1><p>Peace of mind, shared with the people who care.</p></div></div><section className="family-summary"><div className="family-heading"><div className="avatar family-avatar">ME</div><div><div className="eyebrow">YOUR LOVED ONE</div><h2>Margaret Ellis</h2><span><MapPin size={13} /> Riverside neighborhood</span></div><span className="family-safe"><ShieldCheck size={15} /> Care circle connected</span></div><div className="family-stat-row"><div><strong>{active.length}</strong><span>Active requests</span></div><div><strong>{requests.filter((request) => request.status === 'COMPLETED').length}</strong><span>Help received</span></div><div><strong>{people.filter((person) => person.verified).length}</strong><span>Verified neighbors</span></div></div></section><div className="section-heading family-section-heading"><div><div className="eyebrow">CARE UPDATES</div><h2>Recent activity</h2></div><button className="text-link" onClick={() => onPage('requests')}>All requests <ArrowRight size={15} /></button></div><div className="requests-page-list">{requests.slice(0, 5).map((request) => <RequestCard key={request.id} request={request} role="FAMILY" onAction={onAction} token={token} />)}</div><div className="family-reminder"><MessageCircle size={18} /><div><b>Staying connected makes all the difference.</b><span>Call Margaret directly if something needs a personal touch.</span></div><a href="tel:+15550142230">(555) 014-2230</a></div></>
}

function RequestModal({ token, onClose, onCreated, onError }) {
  const [form, setForm] = useState({ title: '', category: 'Groceries', details: '', location: 'Riverside', scheduledFor: '', emergency: false })
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const scheduledFor = form.scheduledFor ? new Date(form.scheduledFor).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Time flexible'
      await api('/api/requests', token, { method: 'POST', body: JSON.stringify({ ...form, scheduledFor }) })
      onCreated()
    } catch (err) { onError(err.message) } finally { setSaving(false) }
  }
  return <div className="modal-backdrop"><form className="request-modal" onSubmit={submit}><div className="modal-header"><div><div className="eyebrow">A NEIGHBOR CAN HELP</div><h2>What would make today easier?</h2><p>We’ll share your request with trusted, verified neighbors.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X size={19} /></button></div><label className="field-label">What do you need? <span>*</span><input required maxLength="80" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A short description" /></label><label className="field-label">Kind of help<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="field-label">A little more detail<textarea rows="3" maxLength="300" value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Anything a neighbor should know?" /></label><div className="field-pair"><label className="field-label">Neighborhood<select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}><option>Riverside</option><option>Oakwood</option></select></label><label className="field-label">When works for you?<input type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm({ ...form, scheduledFor: event.target.value })} /></label></div><label className={`emergency-toggle ${form.emergency ? 'emergency-selected' : ''}`}><input type="checkbox" checked={form.emergency} onChange={(event) => setForm({ ...form, emergency: event.target.checked })} /><span className="emergency-check"><Check size={13} /></span><Siren size={17} /><span><b>This is urgent</b><small>Prioritize this request and alert the care network</small></span></label><div className="modal-actions"><span><ShieldCheck size={15} /> Only shared with your care circle</span><button className="button-primary" type="submit" disabled={saving}>{saving ? 'Sending…' : 'Share request'} <ArrowRight size={16} /></button></div></form></div>
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span><HeartHandshake size={20} /></span><b>{title}</b><p>{detail}</p></div>
}
function getToken() { return JSON.parse(sessionStorage.getItem('elderlink-account') || '{}').token }
function initials(name = '') { return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() }
function roleLabel(role, verified = true) {
  if (role === 'VOLUNTEER' && !verified) return 'Awaiting coordinator approval'
  return { SENIOR: 'Community member', FAMILY: 'Family circle', VOLUNTEER: 'Verified volunteer', ADMIN: 'Network coordinator' }[role] || role
}

export default App