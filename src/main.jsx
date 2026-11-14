
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Github,
  ExternalLink,
  LogIn,
  LogOut,
  Plus,
  UploadCloud,
  X,
  FolderGit2,
  Code2,
  Mail,
  ArrowUpRight,
  Home,
  Menu,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Globe
} from 'lucide-react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';

import { auth, db, ADMIN_EMAIL } from './firebase';
import './style.css';

// KONFIGURASI CLOUDINARY
const CLOUDINARY_CLOUD_NAME = 'ew3vk9zg';
const CLOUDINARY_UPLOAD_PRESET = 'aplannymw_unsigned';

const GITHUB_URL = 'https://github.com/meskowan';

// ALAMAT FOTO PROFIL
const PROFILE_IMAGE = '/portfolio-aplannymw/profile.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    tech: '',
    url: ''
  });

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isAdmin =
    !!user &&
    user.email?.toLowerCase() === ADMIN_EMAIL;

  // MEMERIKSA STATUS LOGIN ADMIN
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // MENGAMBIL PROJECT DARI FIRESTORE
  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      snapshot => {
        setProjects(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      err => setError(err.message)
    );
  }, []);

  // LOGIN ADMIN
  async function login(e) {
    e.preventDefault();
    setError('');

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (
        result.user.email?.toLowerCase() !== ADMIN_EMAIL
      ) {
        await signOut(auth);
        throw new Error('Akun ini bukan admin.');
      }

      setShowLogin(false);
      setPassword('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  }

  // LOGOUT ADMIN
  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  }

  // UPLOAD PROJECT DAN GAMBAR
  async function saveProject(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      let imageUrl = '';

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Ukuran gambar maksimal 5 MB.');
        }

        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            'Format gambar harus JPG, PNG, atau WebP.'
          );
        }

        const data = new FormData();

        data.append('file', file);
        data.append(
          'upload_preset',
          CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: data
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message ||
            'Gagal mengunggah gambar.'
          );
        }

        imageUrl = result.secure_url;
      }

      await addDoc(collection(db, 'projects'), {
        ...form,
        tech: form.tech
          .split(',')
          .map(x => x.trim())
          .filter(Boolean),
        imageUrl,
        createdAt: serverTimestamp()
      });

      setForm({
        title: '',
        description: '',
        tech: '',
        url: ''
      });

      setFile(null);
      setShowForm(false);
      setError('');

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // MENGHAPUS PROJECT
  async function removeProject(p) {
    if (!confirm(`Hapus project "${p.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', p.id));
    } catch (err) {
      setError(err.message);
    }
  }

  // MENUTUP MENU MOBILE
  function closeMenu() {
    setShowMenu(false);
  }

  return (
    <div className="page">

      {/* NAVIGASI */}
      <nav className="nav wrap" id="top">

        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
        >
          <span className="brand-mark">P</span>
          APLANNYMW<span className="dot">.</span>
        </a>

        <button
          className="mobile-menu-btn"
          type="button"
          aria-label="Buka menu navigasi"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-actions ${showMenu ? 'menu-open' : ''}`}>

          <a href="#home" onClick={closeMenu}>
            <Home size={15} />
            Beranda
          </a>

          <a href="#about" onClick={closeMenu}>
            Tentang
          </a>

          <a href="#projects" onClick={closeMenu}>
            Project
          </a>

          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>

          {isAdmin ? (
            <button
              className="admin-btn"
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              <LogOut size={16} />
              Keluar
            </button>
          ) : (
            <button
              className="admin-btn"
              onClick={() => {
                closeMenu();
                setError('');
                setShowLogin(true);
              }}
            >
              <LogIn size={16} />
              Admin
            </button>
          )}

        </div>
      </nav>

      <main>

        {/* BERANDA */}
        <section className="hero wrap" id="home">

          <div className="hero-copy">

            <div className="eyebrow">
              <span />
              PORTFOLIO & PROJECT SHOWCASE
            </div>

            <h1>
              Halo, saya <em>Aplannymw.</em>
              <br />
              Saya membangun sesuatu
              <br />
              yang <span className="gradient">bermanfaat.</span>
            </h1>

            <p className="lead">
              Saya seorang Web Developer yang tertarik
              pada dunia IT dan pengembangan solusi digital.
              Di sini Anda bisa melihat project dan karya
              yang saya kembangkan.
            </p>

            <div className="hero-links">

              <a className="primary" href="#projects">
                Lihat Project
                <ExternalLink size={16} />
              </a>

              <a
                className="secondary"
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />
                GitHub
              </a>

            </div>

          </div>

          <div className="hero-art">

            <div className="orb orb1" />
            <div className="orb orb2" />

            <div className="profile-photo-frame">
              <img
                src={PROFILE_IMAGE}
                alt="Foto profil Aplannymw"
              />
            </div>

            <div className="float-icon">
              <Code2 size={24} />
            </div>

          </div>

        </section>

        {/* STATISTIK */}
        <section className="stats wrap">

          <div>
            <strong>
              {projects.length.toString().padStart(2, '0')}
            </strong>
            <span>Project dipublikasikan</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>Ide untuk dikembangkan</span>
          </div>

          <div>
            <strong>01</strong>
            <span>Perjalanan kreatif</span>
          </div>

        </section>

        {/* TENTANG */}
        <section className="about wrap" id="about">

          <div className="about-icon">
            <img
              className="about-photo"
              src={PROFILE_IMAGE}
              alt="Foto Aplannymw"
            />
          </div>

          <div>
            <div className="eyebrow">
              SEDIKIT TENTANG SAYA
            </div>

            <h2>Terus belajar, terus berkarya.</h2>

            <p>
              Saya adalah Aplannymw, seorang Web Developer
              dengan minat di bidang IT. Saya senang
              mengeksplorasi teknologi, membangun website,
              dan mengembangkan ide menjadi solusi digital.
            </p>

            <p>
              Saya terus belajar dan mencoba teknologi baru
              untuk meningkatkan kemampuan serta menciptakan
              karya digital yang bermanfaat.
            </p>
          </div>

          <a className="secondary" href="#contact">
            Hubungi saya
            <ArrowUpRight size={16} />
          </a>

        </section>

        {/* PROJECT */}
        <section
          className="projects-section wrap"
          id="projects"
        >

          <div className="section-head">

            <div>
              <div className="eyebrow">
                KARYA SAYA
              </div>

              <h2>
                Project pilihan<span className="dot">.</span>
              </h2>

              <p>
                Kumpulan project yang pernah dan sedang
                saya kerjakan.
              </p>
            </div>

            {isAdmin && (
              <button
                className="primary"
                onClick={() => {
                  setError('');
                  setShowForm(true);
                }}
              >
                <Plus size={17} />
                Tambah Project
              </button>
            )}

          </div>

          {error && !showLogin && !showForm && (
            <div className="error">{error}</div>
          )}

          {projects.length ? (

            <div className="project-grid">

              {projects.map(p => (

                <article
                  className="project-card"
                  key={p.id}
                >

                  <div className="project-image">

                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <FolderGit2 size={38} />
                        <span>PROJECT PREVIEW</span>
                      </div>
                    )}

                    {isAdmin && (
                      <button
                        className="delete"
                        title="Hapus project"
                        onClick={() => removeProject(p)}
                      >
                        <X size={16} />
                      </button>
                    )}

                  </div>

                  <div className="project-body">

                    <div className="tags">
                      {(p.tech || []).map((t, i) => (
                        <span key={i}>{t}</span>
                      ))}
                    </div>

                    <h3>{p.title}</h3>

                    <p>{p.description}</p>

                    {p.url && (
                      <a
                        className="project-link"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat project
                        <ExternalLink size={15} />
                      </a>
                    )}

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="empty">

              <div className="empty-icon">
                <FolderGit2 size={28} />
              </div>

              <h3>Belum ada project</h3>

              <p>
                Project yang Anda publikasikan akan tampil
                di sini.
              </p>

              {isAdmin && (
                <button
                  className="primary"
                  onClick={() => {
                    setError('');
                    setShowForm(true);
                  }}
                >
                  <Plus size={16} />
                  Upload project pertama
                </button>
              )}

            </div>

          )}

        </section>

        {/* CONTACT */}
        <section
          className="contact-section wrap"
          id="contact"
        >

          <div className="eyebrow">
            HUBUNGI SAYA
          </div>

          <h2>
            Punya ide menarik?
            <br />
            <span className="gradient">
              Mari kita wujudkan bersama.
            </span>
          </h2>

          <p>
            Saya terbuka untuk bertukar ide, berdiskusi
            tentang teknologi, dan berkolaborasi dalam
            pengembangan project digital.
          </p>

          <div className="contact-links">

            <a
              href="https://wa.me/6282238594968"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <a
              href="https://www.facebook.com/search/top?q=dikwan%20q%20mw"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook size={18} />
              Facebook
            </a>

            <a
              href="https://www.tiktok.com/@Aplannymw"
              target="_blank"
              rel="noreferrer"
            >
              <Music2 size={18} />
              TikTok
            </a>

            <a
              href="https://www.instagram.com/Aplannymw/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={18} />
              Instagram
            </a>

            <a
              href="https://meskowan.github.io/portfolio-aplannymw/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={18} />
              Website
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              GitHub
            </a>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer wrap">

        <span>
          © {new Date().getFullYear()} Aplannymw.
          Dibuat dengan semangat berkarya.
        </span>

        <a href="#home">
          Kembali ke atas ↑
        </a>

      </footer>

      {/* MODAL LOGIN */}
      {showLogin && (

        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
              setError('');
            }
          }}
        >

          <form className="modal" onSubmit={login}>

            <button
              type="button"
              className="close"
              onClick={() => {
                setShowLogin(false);
                setError('');
              }}
            >
              <X />
            </button>

            <div className="modal-icon">
              <LogIn />
            </div>

            <h2>Admin Login</h2>

            <p>
              Masuk untuk mengelola project portofolio.
            </p>

            <label>Email admin</label>

            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
            />

            <label>Password</label>

            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password Firebase"
            />

            {error && (
              <div className="error">{error}</div>
            )}

            <button
              className="primary full"
              type="submit"
            >
              Masuk ke Dashboard
              <LogIn size={16} />
            </button>

            <small>
              Akun admin dibuat melalui Firebase Authentication.
            </small>

          </form>

        </div>

      )}

      {/* MODAL TAMBAH PROJECT */}
      {showForm && (

        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !busy) {
              setShowForm(false);
              setError('');
            }
          }}
        >

          <form
            className="modal"
            onSubmit={saveProject}
          >

            <button
              type="button"
              className="close"
              disabled={busy}
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
            >
              <X />
            </button>

            <div className="modal-icon">
              <UploadCloud />
            </div>

            <h2>Publikasikan project</h2>

            <p>
              Project akan langsung terlihat oleh pengunjung.
            </p>

            <label>Nama project</label>

            <input
              required
              value={form.title}
              onChange={e =>
                setForm({
                  ...form,
                  title: e.target.value
                })
              }
              placeholder="Contoh: Website Toko Online"
            />

            <label>Deskripsi</label>

            <textarea
              required
              rows="3"
              value={form.description}
              onChange={e =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
              placeholder="Ceritakan project ini..."
            />

            <label>
              Teknologi (pisahkan dengan koma)
            </label>

            <input
              value={form.tech}
              onChange={e =>
                setForm({
                  ...form,
                  tech: e.target.value
                })
              }
              placeholder="React, Firebase, CSS"
            />

            <label>Link project / demo (opsional)</label>

            <input
              type="url"
              value={form.url}
              onChange={e =>
                setForm({
                  ...form,
                  url: e.target.value
                })
              }
              placeholder="https://..."
            />

            <label>Gambar cover (opsional)</label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e =>
                setFile(e.target.files?.[0] || null)
              }
            />

            {error && (
              <div className="error">{error}</div>
            )}

            <button
              className="primary full"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Mengunggah...' : 'Publikasikan Project'}
              <UploadCloud size={16} />
            </button>

          </form>

        </div>

      )}

    </div>
  );
}

createRoot(
  document.getElementById('root')
).render(<App />);
