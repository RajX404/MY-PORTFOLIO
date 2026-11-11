
import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  ArrowUpRight, Plus, Search, Smartphone, Globe2, FolderKanban,
  Users, UserRound, Settings, Image, LogOut, Menu, X, Pencil,
  Trash2, ShieldCheck, LockKeyhole, LoaderCircle, Save, ExternalLink
} from 'lucide-react';
import './admin.css';

const sections = [
  { id: 'profile', label: 'Edit Profile', icon: UserRound },
  { id: 'apps', label: 'Manage Applications', icon: Smartphone },
  { id: 'websites', label: 'Manage Websites', icon: Globe2 },
  { id: 'projects', label: 'Manage Projects', icon: FolderKanban },
  { id: 'socials', label: 'Social Media Links', icon: Users },
  { id: 'media', label: 'Photos & Media', icon: Image },
  { id: 'settings', label: 'Website Settings', icon: Settings }
];

const emptyForm = {
  name: '',
  category: '',
  description: '',
  details: '',
  status: 'In development',
  url: '',
  store_url: '',
  handle: '',
  published: false
};

const titles = {
  apps: 'Applications',
  websites: 'Websites',
  projects: 'Projects',
  socials: 'Social Media Links'
};

function ConfigNotice() {
  return (
    <div className="admin-config">
      <ShieldCheck size={25} />
      <h2>Connect your private workspace</h2>
      <p>
        Add your Supabase project URL and public anon key to the
        <code>.env</code> file, then run the SQL setup included in this project.
      </p>
      <ol>
        <li>Create a Supabase project.</li>
        <li>Copy the Project URL and public key into <code>.env</code>.</li>
        <li>Run the SQL setup in Supabase SQL Editor.</li>
        <li>Create your admin account and approve its User ID.</li>
      </ol>
      <p className="admin-warning">
        Never put your Supabase service-role key in frontend code.
      </p>
    </div>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const result = mode === 'signup'
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/admin'
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
    } else if (mode === 'signup') {
      setError(
        'Account request submitted. Verify your email if confirmation is enabled, then ask the site owner to grant admin access.'
      );
    } else {
      onLogin(result.data.user);
    }
  };

  const google = async () => {
    setBusy(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin'
      }
    });

    if (error) {
      setError(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <a href="/" className="admin-logo">
          <span>R.</span> RAJ ADMIN
        </a>

        <div className="admin-login-icon">
          <LockKeyhole />
        </div>

        <p className="admin-kicker">PRIVATE CONTROL CENTER</p>

        <h1>
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </h1>

        <p className="admin-muted">
          Sign in to manage your public portfolio.
        </p>

        <form onSubmit={submit} className="admin-form">
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          <button className="admin-primary" disabled={busy}>
            {busy
              ? <LoaderCircle className="spin" size={17} />
              : <LockKeyhole size={16} />}
            {mode === 'login' ? 'Sign in with email' : 'Create account'}
          </button>
        </form>

        <div className="admin-or">
          <span />OR CONTINUE WITH<span />
        </div>

        <button className="admin-google" onClick={google} disabled={busy}>
          <b>G</b> Continue with Google
        </button>

        {error && <p className="admin-error">{error}</p>}

        <p className="admin-switch">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already registered?'}
          {' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </p>

        <p className="admin-footnote">
          Access is restricted to accounts explicitly approved by the site owner.
        </p>
      </div>
    </div>
  );
}

/* APPLICATION / WEBSITE / PROJECT / SOCIAL EDITOR */

function ItemEditor({ category, item, onSave, onCancel }) {
  const [form, setForm] = useState(
    item
      ? { ...emptyForm, ...item }
      : {
          ...emptyForm,
          category:
            category === 'apps'
              ? 'Application'
              : category === 'websites'
              ? 'Website'
              : category === 'projects'
              ? 'Project'
              : 'Social profile'
        }
  );

  const [busy, setBusy] = useState(false);

  const set = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    await onSave(form);
    setBusy(false);
  };

  const isSocial = category === 'socials';

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="editor-head">
        <div>
          <span className="admin-kicker">
            {item ? 'EDIT ENTRY' : 'NEW ENTRY'}
          </span>
          <h2>
            {item ? 'Update' : 'Add'}{' '}
            {isSocial ? 'social link' : category.slice(0, -1)}
          </h2>
        </div>

        <button type="button" className="admin-icon-btn" onClick={onCancel}>
          <X />
        </button>
      </div>

      <div className="editor-grid">
        <label>
          {isSocial ? 'Platform name' : 'Name / Title'}
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder={isSocial ? 'Instagram' : 'Project name'}
          />
        </label>

        {!isSocial && (
          <label>
            Category
            <input
              value={form.category}
              onChange={e => set('category', e.target.value)}
              placeholder="AI Application"
            />
          </label>
        )}

        <label className="wide">
          {isSocial ? 'Profile URL' : 'Public URL'}
          <input
            type="url"
            value={form.url}
            onChange={e => set('url', e.target.value)}
            placeholder="https://..."
          />
        </label>

        {isSocial && (
          <label>
            Username / Handle
            <input
              value={form.handle}
              onChange={e => set('handle', e.target.value)}
              placeholder="@yourhandle"
            />
          </label>
        )}

        {!isSocial && (
          <>
            <label>
              Status
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option>In development</option>
                <option>Completed</option>
                <option>Live</option>
                <option>Coming soon</option>
                <option>Archived</option>
              </select>
            </label>

            {category === 'apps' && (
              <label>
                App store URL
                <input
                  type="url"
                  value={form.store_url || ''}
                  onChange={e => set('store_url', e.target.value)}
                  placeholder="https://play.google.com/..."
                />
              </label>
            )}

            <label className="wide">
              Short description
              <textarea
                required
                rows="3"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="A short introduction..."
              />
            </label>

            <label className="wide">
              More details
              <textarea
                rows="4"
                value={form.details || ''}
                onChange={e => set('details', e.target.value)}
                placeholder="Additional project information..."
              />
            </label>
          </>
        )}

        <label className="publish-check">
          <input
            type="checkbox"
            checked={!!form.published}
            onChange={e => set('published', e.target.checked)}
          />
          Publish on public website
        </label>
      </div>

      <div className="editor-actions">
        <button type="button" className="admin-ghost" onClick={onCancel}>
          Cancel
        </button>

        <button className="admin-primary" disabled={busy}>
          {busy ? <LoaderCircle className="spin" /> : <Save size={16} />}
          Save changes
        </button>
      </div>
    </form>
  );
}

/* COMPLETE PERSONAL PROFILE EDITOR */

function ProfileEditor({ profile, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: profile?.name || 'RAJ (MD JARAEJ ALAM)',
    professional_title: profile?.professional_title ||
      '2nd Year Diploma CST Student | Aspiring Software Developer',
    education: profile?.education ||
      'Diploma in Computer Science & Technology',
    college: profile?.college || 'Itahar Government Polytechnic',
    current_year: profile?.current_year || '2nd Year',
    about_me: profile?.about_me || '',
    what_im_doing: profile?.what_im_doing || '',
    skills: profile?.skills || '',
    future_goals: profile?.future_goals || '',
    profile_photo_url: profile?.profile_photo_url || '',
    description: profile?.description || ''
  });

  const [busy, setBusy] = useState(false);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    await onSave(form);
    setBusy(false);
  };

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="editor-head">
        <div>
          <span className="admin-kicker">PERSONAL INFORMATION</span>
          <h2>Edit Personal Profile</h2>
          <p>Manage all the details visitors see on your portfolio.</p>
        </div>

        <button type="button" className="admin-icon-btn" onClick={onCancel}>
          <X />
        </button>
      </div>

      <div className="editor-grid">
        <label className="wide">
          Full Name / Display Name
          <input
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="RAJ (MD JARAEJ ALAM)"
          />
        </label>

        <label className="wide">
          Professional Title
          <input
            value={form.professional_title}
            onChange={e => update('professional_title', e.target.value)}
            placeholder="2nd Year Diploma CST Student | Aspiring Software Developer"
          />
        </label>

        <label>
          Education
          <input
            value={form.education}
            onChange={e => update('education', e.target.value)}
          />
        </label>

        <label>
          Current Year / Semester
          <input
            value={form.current_year}
            onChange={e => update('current_year', e.target.value)}
            placeholder="2nd Year"
          />
        </label>

        <label className="wide">
          College / Institute
          <input
            value={form.college}
            onChange={e => update('college', e.target.value)}
          />
        </label>

        <label className="wide">
          Profile Photo URL
          <input
            type="url"
            value={form.profile_photo_url}
            onChange={e => update('profile_photo_url', e.target.value)}
            placeholder="https://your-image-url.com/photo.jpg"
          />
        </label>

        <label className="wide">
          About Me
          <textarea
            rows="5"
            value={form.about_me}
            onChange={e => update('about_me', e.target.value)}
            placeholder="Write about yourself..."
          />
        </label>

        <label className="wide">
          What I'm Doing
          <textarea
            rows="4"
            value={form.what_im_doing}
            onChange={e => update('what_im_doing', e.target.value)}
            placeholder="What are you currently learning or building?"
          />
        </label>

        <label className="wide">
          Skills (Write one skill per line)
          <textarea
            rows="5"
            value={form.skills}
            onChange={e => update('skills', e.target.value)}
            placeholder={'HTML\nCSS\nJavaScript\nReact'}
          />
        </label>

        <label className="wide">
          Future Goals
          <textarea
            rows="4"
            value={form.future_goals}
            onChange={e => update('future_goals', e.target.value)}
            placeholder="Describe your future goals..."
          />
        </label>

        <label className="wide">
          Short Introduction
          <textarea
            rows="3"
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="A short introduction for your homepage..."
          />
        </label>
      </div>

      <div className="editor-actions">
        <button type="button" className="admin-ghost" onClick={onCancel}>
          Cancel
        </button>

        <button className="admin-primary" disabled={busy}>
          {busy
            ? <LoaderCircle className="spin" />
            : <Save size={16} />}
          Save Profile
        </button>
      </div>
    </form>
  );
}

/* ADMIN DASHBOARD */

function Dashboard({ user, onSignOut }) {
  const [section, setSection] = useState('apps');
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const currentItems = useMemo(
    () =>
      items.filter(
        x =>
          x.section === section &&
          (x.name || '').toLowerCase().includes(search.toLowerCase())
      ),
    [items, section, search]
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        ['apps', 'websites', 'projects', 'socials'].map(k => [
          k,
          items.filter(x => x.section === k).length
        ])
      ),
    [items]
  );

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setNotice(error.message);
    } else {
      setItems(data || []);
    }

    const p = await supabase
      .from('site_profile')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (p.error) {
      setNotice(p.error.message);
    } else if (p.data) {
      setProfile(p.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveItem = async form => {
    const payload = {
      section,
      name: form.name,
      category: form.category,
      description: form.description,
      details: form.details,
      status: form.status,
      url: form.url,
      store_url: form.store_url,
      handle: form.handle,
      published: form.published,
      owner_id: user.id
    };

    let result;

    if (editing) {
      result = await supabase
        .from('portfolio_items')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('portfolio_items')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setNotice(result.error.message);
      return;
    }

    setNotice('Saved successfully.');
    setEditing(null);
    setAdding(false);
    await load();
  };

  const removeItem = async item => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', item.id);

    setNotice(error ? error.message : 'Entry deleted.');

    if (!error) await load();
  };

  const saveProfile = async form => {
    const { error } = await supabase
      .from('site_profile')
      .upsert(
        {
          id: 'main',
          name: form.name,
          description: form.description,
          professional_title: form.professional_title,
          education: form.education,
          college: form.college,
          current_year: form.current_year,
          about_me: form.about_me,
          what_im_doing: form.what_im_doing,
          skills: form.skills,
          future_goals: form.future_goals,
          profile_photo_url: form.profile_photo_url,
          owner_id: user.id
        },
        { onConflict: 'id' }
      );

    if (error) {
      setNotice(error.message);
      return;
    }

    setNotice('Personal profile saved successfully.');
    setAdding(false);
    setEditing(null);
    await load();
  };

  const title =
    sections.find(s => s.id === section)?.label || 'Dashboard';

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNav ? 'show' : ''}`}>
        <a href="/" className="admin-logo">
          <span>R.</span> RAJ ADMIN
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        {sections.map(s => (
          <button
            key={s.id}
            className={`sidebar-link ${section === s.id ? 'active' : ''}`}
            onClick={() => {
              setSection(s.id);
              setAdding(false);
              setEditing(null);
              setMobileNav(false);
              setNotice('');
            }}
          >
            <s.icon size={17} />
            {s.label}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="admin-user">
            <div className="user-avatar">
              {(user.email || 'R')[0].toUpperCase()}
            </div>
            <div>
              <b>RAJ</b>
              <small>{user.email}</small>
            </div>
          </div>

          <button className="sidebar-link" onClick={onSignOut}>
            <LogOut size={17} />
            Sign out
          </button>

          <a
            className="view-site"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            View public website <ExternalLink size={14} />
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-icon-btn mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? <X /> : <Menu />}
          </button>

          <div>
            <span className="admin-kicker">RAJ / CONTROL CENTER</span>
            <h1>
              {section === 'profile'
                ? 'Profile settings'
                : section === 'settings'
                ? 'Website settings'
                : section === 'media'
                ? 'Photos & media'
                : title}
            </h1>
          </div>

          <div className="topbar-right">
            <span className="secure-tag">
              <ShieldCheck size={14} /> Secure session
            </span>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-icon-btn"
            >
              <ArrowUpRight />
            </a>
          </div>
        </header>

        <section className="admin-content">
          {notice && (
            <div className="admin-notice">
              {notice}
              <button onClick={() => setNotice('')}>
                <X size={14} />
              </button>
            </div>
          )}

          {section === 'profile' ? (
            <>
              {adding || editing ? (
                <ProfileEditor
                  profile={profile}
                  onSave={saveProfile}
                  onCancel={() => {
                    setAdding(false);
                    setEditing(null);
                  }}
                />
              ) : (
                <div className="admin-panel profile-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="admin-kicker">PUBLIC IDENTITY</span>
                      <h2>Personal Profile</h2>
                      <p>Manage the details visitors see on your portfolio.</p>
                    </div>

                    <button
                      className="admin-primary"
                      onClick={() => setAdding(true)}
                    >
                      <Pencil size={15} /> Edit profile
                    </button>
                  </div>

                  <div className="profile-preview">
                    {profile?.profile_photo_url ? (
                      <img
                        src={profile.profile_photo_url}
                        alt="Profile"
                        className="profile-monogram"
                      />
                    ) : (
                      <div className="profile-monogram">R.</div>
                    )}

                    <div>
                      <h3>{profile?.name || 'RAJ (MD JARAEJ ALAM)'}</h3>
                      <p>
                        {profile?.professional_title ||
                          'Aspiring Software Developer'}
                      </p>
                      <p>{profile?.education || 'Diploma in CST'}</p>
                      <p>
                        {profile?.college || 'Itahar Government Polytechnic'}
                      </p>
                      <p>{profile?.current_year || '2nd Year'}</p>
                    </div>
                  </div>

                  {profile && (
                    <div className="profile-preview-details">
                      {[
                        ['About Me', profile.about_me],
                        ['What I am Doing', profile.what_im_doing],
                        ['Skills', profile.skills],
                        ['Future Goals', profile.future_goals]
                      ].map(([label, value]) =>
                        value ? (
                          <div key={label}>
                            <h3>{label}</h3>
                            <p>{value}</p>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : section === 'settings' ? (
            <div className="admin-panel">
              <span className="admin-kicker">CONFIGURATION</span>
              <h2>Website settings</h2>
              <p>
                Authentication, Google OAuth and database access are managed
                through your Supabase project.
              </p>
              <a
                className="admin-inline-link"
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
              >
                Open Supabase Dashboard <ArrowUpRight size={15} />
              </a>
            </div>
          ) : section === 'media' ? (
            <div className="admin-panel">
              <span className="admin-kicker">MEDIA LIBRARY</span>
              <h2>Photos & media</h2>
              <p>
                Image uploads need a configured Supabase Storage bucket.
                Storage upload can be enabled as a next step.
              </p>
            </div>
          ) : (
            <>
              {adding || editing ? (
                <ItemEditor
                  category={section}
                  item={editing}
                  onSave={saveItem}
                  onCancel={() => {
                    setAdding(false);
                    setEditing(null);
                  }}
                />
              ) : (
                <>
                  <div className="admin-stats">
                    {[
                      { k: 'apps', label: 'Applications', icon: Smartphone },
                      { k: 'websites', label: 'Websites', icon: Globe2 },
                      { k: 'projects', label: 'Projects', icon: FolderKanban },
                      { k: 'socials', label: 'Social platforms', icon: Users }
                    ].map(s => (
                      <div className="stat-card" key={s.k}>
                        <s.icon />
                        <strong>{counts[s.k] || 0}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <span className="admin-kicker">
                          CONTENT MANAGEMENT
                        </span>
                        <h2>{titles[section]}</h2>
                        <p>
                          Add, edit or publish content on your public portfolio.
                        </p>
                      </div>

                      <button
                        className="admin-primary"
                        onClick={() => setAdding(true)}
                      >
                        <Plus size={16} /> Add new
                      </button>
                    </div>

                    <div className="list-toolbar">
                      <div className="admin-search">
                        <Search size={16} />
                        <input
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Search entries..."
                        />
                      </div>
                      <span>{currentItems.length} entries</span>
                    </div>

                    {loading ? (
                      <div className="admin-loading">
                        <LoaderCircle className="spin" />
                        Loading your content...
                      </div>
                    ) : currentItems.length === 0 ? (
                      <div className="admin-empty">
                        <FolderKanban />
                        <h3>No entries yet</h3>
                        <p>
                          Add your first{' '}
                          {section === 'apps'
                            ? 'application'
                            : section === 'websites'
                            ? 'website'
                            : section === 'projects'
                            ? 'project'
                            : 'social link'}{' '}
                          to get started.
                        </p>
                        <button
                          className="admin-ghost"
                          onClick={() => setAdding(true)}
                        >
                          <Plus size={15} /> Create first entry
                        </button>
                      </div>
                    ) : (
                      <div className="admin-table">
                        {currentItems.map(item => (
                          <div className="admin-row" key={item.id}>
                            <div className="row-symbol">
                              {section === 'apps' ? (
                                <Smartphone />
                              ) : section === 'websites' ? (
                                <Globe2 />
                              ) : section === 'projects' ? (
                                <FolderKanban />
                              ) : (
                                <Users />
                              )}
                            </div>

                            <div className="row-main">
                              <b>{item.name}</b>
                              <small>
                                {item.description ||
                                  item.handle ||
                                  item.url ||
                                  'No description added'}
                              </small>
                            </div>

                            <span
                              className={`publish-status ${
                                item.published ? 'is-live' : ''
                              }`}
                            >
                              {item.published ? 'Published' : 'Draft'}
                            </span>

                            <div className="row-actions">
                              <button
                                title="Edit"
                                onClick={() => setEditing(item)}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                title="Delete"
                                onClick={() => removeItem(item)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      if (!session?.user) {
        setApproved(false);
        return;
      }

      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (alive) setApproved(!error && !!data);
    };

    check();

    return () => {
      alive = false;
    };
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-root">
        <ConfigNotice />
      </div>
    );
  }

  if (checking) {
    return (
      <div className="admin-root admin-loading">
        <LoaderCircle className="spin" />
        Checking secure session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-root">
        <Login onLogin={u => setSession({ user: u })} />
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="admin-root">
        <div className="admin-config">
          <ShieldCheck size={28} />
          <h2>Access not approved yet</h2>
          <p>
            Your account is signed in, but it has not been granted
            administrator access. In Supabase SQL Editor, add your Auth
            user ID to the <code>public.admins</code> table.
          </p>
          <button className="admin-primary" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <Dashboard user={session.user} onSignOut={signOut} />
    </div>
  );
}
