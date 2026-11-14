import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Github, ExternalLink, LogIn, LogOut, Plus, UploadCloud, X, FolderGit2, UserRound, Code2 } from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage, ADMIN_EMAIL } from './firebase';
import './style.css';

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ title: '', description: '', tech: '', url: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => setError(e.message));
  }, []);

  async function login(e) {
    e.preventDefault(); setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email?.toLowerCase() !== ADMIN_EMAIL) { await signOut(auth); throw new Error('Akun ini bukan admin.'); }
      setShowLogin(false); setPassword('');
    } catch (err) { setError(err.message); }
  }
  async function saveProject(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      let imageUrl = '';
      if (file) {
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const fileRef = ref(storage, `project-covers/${safeName}`);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'projects'), { ...form, tech: form.tech.split(',').map(x => x.trim()).filter(Boolean), imageUrl, createdAt: serverTimestamp() });
      setForm({ title: '', description: '', tech: '', url: '' }); setFile(null); setShowForm(false);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function removeProject(p) {
    if (!confirm(`Hapus project “${p.title}”?`)) return;
    try { await deleteDoc(doc(db, 'projects', p.id)); } catch (err) { setError(err.message); }
  }

  return <div className="page">
    <nav className="nav wrap"><a className="brand" href="#home"><span className="brand-mark">P</span> APLANNYMW<span className="dot">.</span></a><div className="nav-actions"><a href="#projects">Project</a><a href="#about">Tentang</a>{isAdmin ? <button className="admin-btn" onClick={() => signOut(auth)}><LogOut size={16}/> Keluar</button> : <button className="admin-btn" onClick={() => {setError('');setShowLogin(true)}}><LogIn size={16}/> Admin</button>}</div></nav>
    <main>
      <section className="hero wrap" id="home"><div className="hero-copy"><div className="eyebrow"><span/> PORTFOLIO & PROJECT SHOWCASE</div><h1>Halo, saya <em>Aplannymw.</em><br/>Saya membangun sesuatu<br/>yang <span className="gradient">bermanfaat.</span></h1><p className="lead">Saya seorang Web Developer yang tertarik pada dunia IT dan pengembangan solusi digital. Di sini Anda bisa melihat project dan karya yang saya kembangkan.</p><div className="hero-links"><a className="primary" href="#projects">Lihat Project <ExternalLink size={16}/></a><a className="secondary" href="https://github.com/Aplannymw" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></div></div><div className="hero-art"><div className="orb orb1"/><div className="orb orb2"/><div className="code-card"><div className="code-top"><i/><i/><i/><span>my-portfolio.js</span></div><pre><b>const</b> creator = {'{'}{ '\n' }  name: <strong>'Aplannymw'</strong>,{ '\n' }  passion: <strong>'Web Developer'</strong>,{ '\n' }  status: <strong>'Always learning'</strong>{ '\n' }{'}'};{ '\n\n'}<b>function</b> <strong>createProject</strong>() {'{'}{ '\n'}  return <i> amazingThings;</i>{ '\n'}{'}'}</pre><div className="code-foot"><span/> Available for new ideas</div></div><div className="float-icon"><Code2 size={24}/></div></div></section>
      <section className="stats wrap"><div><strong>{projects.length.toString().padStart(2,'0')}</strong><span>Project dipublikasikan</span></div><div><strong>∞</strong><span>Ide untuk dikembangkan</span></div><div><strong>01</strong><span>Perjalanan kreatif</span></div></section>
      <section className="projects-section wrap" id="projects"><div className="section-head"><div><div className="eyebrow">KARYA SAYA</div><h2>Project pilihan<span className="dot">.</span></h2><p>Kumpulan project yang pernah dan sedang saya kerjakan.</p></div>{isAdmin && <button className="primary" onClick={() => setShowForm(true)}><Plus size={17}/> Tambah Project</button>}</div>
        {error && <div className="error">{error}</div>}
        {projects.length ? <div className="project-grid">{projects.map(p => <article className="project-card" key={p.id}><div className="project-image">{p.imageUrl ? <img src={p.imageUrl} alt={p.title}/> : <div className="image-placeholder"><FolderGit2 size={38}/><span>PROJECT PREVIEW</span></div>}{isAdmin && <button className="delete" title="Hapus project" onClick={() => removeProject(p)}><X size={16}/></button>}</div><div className="project-body"><div className="tags">{(p.tech || []).map(t => <span key={t}>{t}</span>)}</div><h3>{p.title}</h3><p>{p.description}</p>{p.url && <a className="project-link" href={p.url} target="_blank" rel="noreferrer">Lihat project <ExternalLink size={15}/></a>}</div></article>)}</div> : <div className="empty"><div className="empty-icon"><FolderGit2 size={28}/></div><h3>Belum ada project</h3><p>Project yang Anda publikasikan akan tampil di sini.</p>{isAdmin && <button className="primary" onClick={() => setShowForm(true)}><Plus size={16}/> Upload project pertama</button>}</div>}
      </section>
      <section className="about wrap" id="about"><div className="about-icon"><UserRound size={30}/></div><div><div className="eyebrow">SEDIKIT TENTANG SAYA</div><h2>Terus belajar, terus berkarya.</h2><p>Saya adalah Aplannymw, seorang Web Developer dengan minat di bidang IT. Saya senang mengeksplorasi teknologi, membangun website, dan mengembangkan ide menjadi solusi digital.</p></div><a href="https://github.com/Aplannymw" className="secondary">Hubungi saya <ExternalLink size={15}/></a></section>
    </main>
    <footer className="footer wrap"><span>© {new Date().getFullYear()} Aplannymw. Dibuat dengan semangat berkarya.</span><a href="#home">Kembali ke atas ↑</a></footer>
    {showLogin && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setShowLogin(false)}><form className="modal" onSubmit={login}><button type="button" className="close" onClick={() => setShowLogin(false)}><X/></button><div className="modal-icon"><LogIn/></div><h2>Admin Login</h2><p>Masuk untuk mengelola project portofolio.</p><label>Email admin</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com"/><label>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password Firebase"/>{error && <div className="error">{error}</div>}<button className="primary full" type="submit">Masuk ke Dashboard <LogIn size={16}/></button><small>Akun admin dibuat melalui Firebase Authentication.</small></form></div>}
    {showForm && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><form className="modal" onSubmit={saveProject}><button type="button" className="close" onClick={() => setShowForm(false)}><X/></button><div className="modal-icon"><UploadCloud/></div><h2>Publikasikan project</h2><p>Project akan langsung terlihat oleh pengunjung.</p><label>Nama project</label><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Contoh: Website Toko Online"/><label>Deskripsi</label><textarea required rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Ceritakan project ini..."/><label>Teknologi (pisahkan dengan koma)</label><input value={form.tech} onChange={e => setForm({...form,tech:e.target.value})} placeholder="React, Firebase, CSS"/><label>Link project / demo (opsional)</label><input type="url" value={form.url} onChange={e => setForm({...form,url:e.target.value})} placeholder="https://..."/><label>Gambar cover (opsional)</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)}/>{error && <div className="error">{error}</div>}<button className="primary full" disabled={busy}>{busy ? 'Mengunggah...' : 'Publikasikan Project'} <UploadCloud size={16}/></button></form></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
