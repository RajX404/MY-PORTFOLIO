
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Menu, X, Moon, Sun,
  Globe2, Layers3, Code2, Github, Instagram,
  Linkedin, Facebook, Youtube, Send, CheckCircle2,
  ExternalLink, Plus
} from 'lucide-react';

import { profile, apps, websites, projects, skills, socials } from './data';
import { supabase } from './supabase';

const nav = [
  ['About', 'about'],
  ['Apps', 'apps'],
  ['Websites', 'websites'],
  ['Projects', 'projects'],
  ['Skills', 'skills'],
  ['Connect', 'connect']
];

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function AppCard({ item, onOpen }) {
  return (
    <article className={`work-card ${item.accent || ''}`}>
      <div className="card-topline">
        <span className="app-glyph">{item.icon || '✳'}</span>
        <span className="status"><i />{item.status || 'In Development'}</span>
      </div>

      <div className="card-content">
        <span className="card-category">{item.category}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>

      <button className="text-link" onClick={() => onOpen(item)}>
        Explore project <ArrowUpRight size={16} />
      </button>
    </article>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <span className="eyebrow">{item.category || 'PROJECT DETAILS'}</span>
        <h2>{item.name}</h2>
        <p>{item.details || item.description}</p>

        {item.features?.length > 0 && (
          <>
            <h4>Project notes</h4>
            <ul>
              {item.features.map(x => <li key={x}>{x}</li>)}
            </ul>
          </>
        )}

        <div className="modal-actions">
          {item.url ? (
            <a
              className="button primary"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              Open project <ExternalLink size={16} />
            </a>
          ) : (
            <span className="status-pill">
              Link will be added when available
            </span>
          )}

          {item.storeUrl && (
            <a
              className="button secondary"
              href={item.storeUrl}
              target="_blank"
              rel="noreferrer"
            >
              App listing <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ name }) {
  const props = { size: 18, strokeWidth: 1.8 };

  const map = {
    Instagram: <Instagram {...props} />,
    Facebook: <Facebook {...props} />,
    LinkedIn: <Linkedin {...props} />,
    GitHub: <Github {...props} />,
    YouTube: <Youtube {...props} />
  };

  return map[name] || <ExternalLink {...props} />;
}

function splitSkills(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  return value
    .split(/[,;\n]/)
    .map(skill => skill.trim())
    .filter(Boolean);
}

function getSkillInfo(skill, index) {
  const name = typeof skill === 'string'
    ? skill.trim()
    : skill.name || '';

  const match = name.match(
    /\s*\((Basic|Beginner|Learning|Intermediate|Advanced)\)$/i
  );

  const level = match ? match[1] : 'Basic';

  const cleanName = name.replace(
    /\s*\((Basic|Beginner|Learning|Intermediate|Advanced)\)$/i,
    ''
  ).trim();

  return {
    id: index,
    name: cleanName,
    level
  };
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);

  const [dbProfile, setDbProfile] = useState(null);
  const [dbItems, setDbItems] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Load public data from Supabase.
  useEffect(() => {
    let active = true;

    async function loadPublicData() {
      if (!supabase) return;

      try {
        const [profileResult, itemsResult] = await Promise.all([
          supabase
            .from('site_profile')
            .select('*')
            .eq('id', 'main')
            .maybeSingle(),

          supabase
            .from('portfolio_items')
            .select('*')
            .eq('published', true)
        ]);

        if (!active) return;

        if (!profileResult.error && profileResult.data) {
          setDbProfile(profileResult.data);
        }

        if (!itemsResult.error && Array.isArray(itemsResult.data)) {
          setDbItems(itemsResult.data);
        }
      } catch (error) {
        console.error('Could not load public portfolio data:', error);
      }
    }

    loadPublicData();

    return () => {
      active = false;
    };
  }, []);

  // Merge database profile with starter profile.
  const publicProfile = useMemo(() => {
    const saved = Object.fromEntries(
      Object.entries(dbProfile || {}).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ''
      )
    );

    return { ...profile, ...saved };
  }, [dbProfile]);

  // Organize published portfolio items.
  const publicItems = useMemo(() => {
    if (!dbItems) {
      return { apps, websites, projects, socials };
    }

    const grouped = {
      apps: [],
      websites: [],
      projects: [],
      socials: []
    };

    dbItems.forEach(item => {
      const type = String(
        item.type || item.item_type || item.section || ''
      ).toLowerCase();

      const formatted = {
        ...item,
        id: item.id,
        name: item.name || item.title || 'Untitled',
        category: item.category || '',
        description: item.description || '',
        details: item.details || item.description || '',
        url: item.url || '',
        status: item.status || 'In Development'
      };

      if (['app', 'apps', 'application', 'applications'].includes(type)) {
        grouped.apps.push(formatted);
      } else if (['website', 'websites', 'web'].includes(type)) {
        grouped.websites.push(formatted);
      } else if (['project', 'projects'].includes(type)) {
        grouped.projects.push(formatted);
      } else if (['social', 'socials', 'social_media'].includes(type)) {
        grouped.socials.push({
          ...formatted,
          handle: item.handle || item.description || item.name,
          url: item.url || ''
        });
      }
    });

    return {
      apps: grouped.apps.length ? grouped.apps : apps,
      websites: grouped.websites.length ? grouped.websites : websites,
      projects: grouped.projects.length ? grouped.projects : projects,
      socials: grouped.socials.length ? grouped.socials : socials
    };
  }, [dbItems]);

  // Category-wise skills.
  const skillGroups = useMemo(() => {
    const savedSkills = splitSkills(publicProfile.skills);

    const skillList = savedSkills.length
      ? savedSkills
      : skills.map(skill => skill.name || skill);

    const allSkills = skillList.map(getSkillInfo);

    const categories = [
      {
        title: 'Programming Languages',
        match: [
          'HTML',
          'CSS',
          'JavaScript',
          'Python',
          'C Programming',
          'Java'
        ]
      },
      {
        title: 'Development Tools',
        match: [
          'React',
          'GitHub',
          'Git',
          'Visual Studio Code',
          'VS Code'
        ]
      },
      {
        title: 'Computer Fundamentals',
        match: [
          'Computer Fundamentals',
          'Computer Organization',
          'Operating System Fundamentals',
          'File & Folder Management'
        ]
      },
      {
        title: 'Office & Productivity',
        match: [
          'Microsoft Word',
          'Microsoft Excel',
          'Microsoft PowerPoint',
          'MS Word',
          'MS Excel',
          'MS PowerPoint'
        ]
      },
      {
        title: 'Other Technical Skills',
        match: [
          'Basic Programming Logic',
          'Problem Solving',
          'Web Development Fundamentals'
        ]
      }
    ];

    const usedSkills = [];

    const groups = categories.map(category => {
      const items = allSkills.filter(skill => {
        const found = category.match.some(
          name => name.toLowerCase() === skill.name.toLowerCase()
        );

        if (found) usedSkills.push(skill.id);

        return found;
      });

      return {
        title: category.title,
        items
      };
    }).filter(group => group.items.length > 0);

    // Keep any additional skills instead of hiding them.
    const extraSkills = allSkills.filter(
      skill => !usedSkills.includes(skill.id)
    );

    if (extraSkills.length > 0) {
      groups.push({
        title: 'Additional Skills',
        items: extraSkills
      });
    }

    return groups;
  }, [publicProfile.skills]);

  const fullName = publicProfile.fullName || 'Md Jaraej Alam';

  const professionalTitle =
    publicProfile.professional_title ||
    publicProfile.headline ||
    'Diploma CST Student | Aspiring Software Developer';

  const aboutText =
    publicProfile.about_me ||
    publicProfile.bio ||
    'I am passionate about technology, software development and learning new skills.';

  const allWork = [...publicItems.websites, ...publicItems.projects];

  const submitContact = (e) => {
    e.preventDefault();

    if (!publicProfile.email) {
      alert('Please add your public email in your profile settings.');
      return;
    }

    const subject = encodeURIComponent(
      `Portfolio message from ${form.name}`
    );

    const body = encodeURIComponent(
      `${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`
    );

    window.location.href =
      `mailto:${publicProfile.email}?subject=${subject}&body=${body}`;

    setSent(true);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={light ? 'site light' : 'site'}>
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu}>
          <span className="brand-mark">R</span>
          <span>RAJ<span className="brand-dot">.</span></span>
        </a>

        <nav className={menuOpen ? 'nav open' : 'nav'}>
          {nav.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>
              {label}
            </a>
          ))}

          <a className="nav-contact" href="#connect" onClick={closeMenu}>
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            onClick={() => setLight(!light)}
            aria-label="Toggle theme"
          >
            {light ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            className="icon-button menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              PERSONAL DIGITAL PORTFOLIO
            </span>

            <h1>
              Ideas are<br />
              <em>meant to be</em><br />
              made real<span className="accent">.</span>
            </h1>

            <p className="hero-intro">
              I’m <strong>RAJ</strong> — {fullName}. {professionalTitle}
            </p>

            <div className="hero-meta">
              <span>
                {publicProfile.current_year || publicProfile.role || 'Polytechnic Student'}
              </span>
              <span className="meta-separator">/</span>
              <span>
                {publicProfile.college || publicProfile.location || 'India'}
              </span>
            </div>

            <div className="hero-actions">
              <a className="button primary" href="#apps">
                Explore my work <ArrowUpRight size={17} />
              </a>

              <a className="button secondary" href="#about">
                A little about me <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="hero-footnote">
              <span className="scroll-line" />
              Scroll to explore
            </div>
          </div>

          <div className="hero-art" aria-label="RAJ profile artwork">
            {publicProfile.profile_photo_url ? (
              <img
                src={publicProfile.profile_photo_url}
                alt="RAJ profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 'inherit'
                }}
              />
            ) : (
              <>
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="art-grid" />
                <div className="art-monogram">R<span>.</span></div>

                <div className="art-caption">
                  <span>INDEPENDENT MINDSET</span>
                  <b>Curious by nature.<br />Building by practice.</b>
                </div>

                <span className="art-index">01 / 06</span>
              </>
            )}
          </div>
        </section>

        {/* INTRO STRIP */}
        <section className="intro-strip">
          <div className="section-wrap strip-inner">
            <span>DESIGNING</span><i />
            <span>EXPLORING</span><i />
            <span>BUILDING</span><i />
            <span>LEARNING</span>
          </div>
        </section>

        {/* ABOUT */}
        <section
          className="section-wrap section-block about-section"
          id="about"
        >
          <div className="about-label">
            <span className="eyebrow">01 — ABOUT</span>
            <span className="side-note">A work in progress, always.</span>
          </div>

          <div className="about-main">
            <SectionHeading
              eyebrow="A LITTLE INTRODUCTION"
              title={<>Not just a profile.<br /><em>A work in progress.</em></>}
            />

            <div className="about-copy">
              <p>{aboutText}</p>

              <p>
                I believe good work comes from curiosity, consistency and the
                willingness to keep learning. This portfolio will grow
                alongside the things I make.
              </p>

              <div className="identity-line">
                <span>KNOWN AS</span>
                <strong>RAJ</strong>
                <span className="identity-divider" />
                <span>FULL NAME</span>
                <strong>{fullName}</strong>
              </div>

              <div style={{ marginTop: 30, display: 'grid', gap: 18 }}>
                {publicProfile.education && (
                  <div>
                    <span className="eyebrow">EDUCATION</span>
                    <p>{publicProfile.education}</p>
                  </div>
                )}

                {publicProfile.college && (
                  <div>
                    <span className="eyebrow">INSTITUTE</span>
                    <p>{publicProfile.college}</p>
                  </div>
                )}

                {publicProfile.current_year && (
                  <div>
                    <span className="eyebrow">CURRENT YEAR / SEMESTER</span>
                    <p>{publicProfile.current_year}</p>
                  </div>
                )}

                {publicProfile.what_im_doing && (
                  <div>
                    <span className="eyebrow">WHAT I'M DOING</span>
                    <p>{publicProfile.what_im_doing}</p>
                  </div>
                )}

                {publicProfile.future_goals && (
                  <div>
                    <span className="eyebrow">FUTURE GOALS</span>
                    <p>{publicProfile.future_goals}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* APPS */}
        <section className="section-wrap section-block" id="apps">
          <div className="section-top">
            <SectionHeading
              eyebrow="02 — APPLICATIONS"
              title={<>Things I’m <em>building.</em></>}
              copy="A growing collection of applications and product ideas."
            />

            <span className="section-count">
              {String(publicItems.apps.length).padStart(2, '0')} / APPS
            </span>
          </div>

          <div className="card-grid">
            {publicItems.apps.map(item => (
              <AppCard
                key={item.id}
                item={item}
                onOpen={setSelected}
              />
            ))}

            <article className="add-card">
              <div className="add-icon"><Plus size={22} /></div>
              <h3>More ideas ahead.</h3>
              <p>
                New applications will find their place here as they take shape.
              </p>
              <span className="coming-label">UPDATING OVER TIME</span>
            </article>
          </div>
        </section>

        {/* WEBSITES */}
        <section className="section-wrap section-block" id="websites">
          <div className="section-top">
            <SectionHeading
              eyebrow="03 — WEB PRESENCE"
              title={<>Websites with a <em>purpose.</em></>}
              copy="Standalone websites and digital experiences created over time."
            />
          </div>

          {publicItems.websites.length ? (
            <div className="simple-list">
              {publicItems.websites.map(item => (
                <button
                  className="list-row"
                  key={item.id}
                  onClick={() => setSelected(item)}
                >
                  <span className="list-number">W / {item.id}</span>
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                  <ArrowUpRight />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Globe2 />
              <div>
                <h3>Your next website goes here.</h3>
                <p>Add a website from your Admin Dashboard.</p>
              </div>
              <span className="empty-tag">NO PUBLIC LINKS YET</span>
            </div>
          )}
        </section>

        {/* PROJECTS */}
        <section className="section-wrap section-block" id="projects">
          <div className="section-top">
            <SectionHeading
              eyebrow="04 — SELECTED WORK"
              title={<>Small steps. <em>Real progress.</em></>}
              copy="Experiments, learning projects and work worth documenting."
            />
          </div>

          {allWork.length ? (
            <div className="project-grid">
              {allWork.map(item => (
                <AppCard
                  key={item.id}
                  item={item}
                  onOpen={setSelected}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Layers3 />
              <div>
                <h3>The collection starts here.</h3>
                <p>Add your projects from your Admin Dashboard.</p>
              </div>
              <span className="empty-tag">MORE TO COME</span>
            </div>
          )}
        </section>

        {/* SKILLS */}
        <section className="skills-band" id="skills">
          <div className="section-wrap skills-layout">
            <div>
              <span className="eyebrow">05 — TOOLKIT</span>

              <h2>
                Learning, testing<br />
                and <em>getting better.</em>
              </h2>

              <p className="skills-copy">
                A snapshot of technologies I’m exploring. This list will
                evolve with my skills and experience.
              </p>
            </div>

            <div className="skill-categories">
              {skillGroups.length > 0 ? (
                skillGroups.map(group => (
                  <div className="skill-category" key={group.title}>
                    <h3 className="skill-category-title">
                      {group.title}
                    </h3>

                    <div className="skill-cloud">
                      {group.items.map(skill => (
                        <span className="skill-chip" key={skill.id}>
                          <Code2 size={15} />
                          {skill.name}
                          <small className="skill-level">
                            {skill.level}
                          </small>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* CONNECT */}
        <section
          className="section-wrap section-block connect-section"
          id="connect"
        >
          <div className="connect-heading">
            <span className="eyebrow">06 — CONNECT</span>

            <h2>
              Good things start<br />
              with a <em>conversation.</em>
            </h2>

            <p>
              Find me around the web or send a message about an idea,
              project or collaboration.
            </p>
          </div>

          <div className="connect-content">
            <div className="social-list">
              {publicItems.socials.map((s, index) => (
                <div className="social-row" key={s.id || s.name || index}>
                  <span className="social-icon">
                    <SocialIcon name={s.name} />
                  </span>

                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      {s.url ? s.handle : 'Profile link not added yet'}
                    </small>
                  </div>

                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${s.name}`}
                    >
                      <ArrowUpRight />
                    </a>
                  ) : (
                    <span className="not-added">ADD LINK</span>
                  )}
                </div>
              ))}
            </div>

            <form className="contact-form" onSubmit={submitContact}>
              <span className="form-label">SEND A MESSAGE</span>

              <label>
                Your name
                <input
                  required
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="How should I call you?"
                />
              </label>

              <label>
                Your email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="you@example.com"
                />
              </label>

              <label>
                Your message
                <textarea
                  required
                  rows="4"
                  value={form.message}
                  onChange={e =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Tell me what’s on your mind..."
                />
              </label>

              <button className="button primary submit-button" type="submit">
                Send message <Send size={16} />
              </button>

              {sent && (
                <small className="form-note">
                  <CheckCircle2 size={14} />
                  Your email app should open with the message ready.
                </small>
              )}

              {!publicProfile.email && (
                <small className="form-note muted">
                  Contact email will be activated after it is added to your profile.
                </small>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="section-wrap footer-inner">
          <a className="brand" href="#home">
            <span className="brand-mark">R</span>
            <span>RAJ<span className="brand-dot">.</span></span>
          </a>

          <span>
            © {new Date().getFullYear()} {fullName}. Built to grow.
          </span>

          <a href="#home" className="back-top">
            Back to top ↑
          </a>
        </div>
      </footer>

      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
