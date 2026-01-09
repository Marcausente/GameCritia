import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users'); // users, content
    const [users, setUsers] = useState([]);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserLoading, setNewUserLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'users') {
            await fetchUsers();
        } else {
            await fetchContent();
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        // Fetch all profiles. Note: In reality, we use the RPC function to get all users
        try {
            const { data, error } = await supabase.rpc('get_all_users_admin');
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchContent = async () => {
        try {
            // Fetch About Us
            const { data: aboutData, error: aboutError } = await supabase.from('about_us_content').select('*').single();
            if (aboutError && aboutError.code !== 'PGRST116') throw aboutError;

            // Fetch Contact Info
            const { data: contactData, error: contactError } = await supabase.from('contact_info').select('*').single();
            if (contactError && contactError.code !== 'PGRST116') throw contactError;

            // Merge into content state
            const newContent = {};
            if (aboutData) {
                newContent['about_bio_p1'] = aboutData.bio_p1;
                newContent['about_bio_p2'] = aboutData.bio_p2;
                newContent['about_bio_p3'] = aboutData.bio_p3;
                newContent['about_bio_p4'] = aboutData.bio_p4;
            }
            if (contactData) {
                newContent['contact_name'] = contactData.name;
                newContent['contact_email'] = contactData.email;
                newContent['contact_twitter_url'] = contactData.twitter_url;
                newContent['contact_twitter_handle'] = contactData.twitter_handle;
            }
            setContent(newContent);

        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    // ... User Actions (handleUpdateRole, handleDeleteUser, handleCreateUser) unchanged

    // ... Content Actions

    const handleContentChange = (section, key, value) => {
        setContent(prev => ({ ...prev, [`${section}_${key}`]: value }));
    };

    const handleSaveContent = async () => {
        try {
            // Update About Us
            const aboutUpdates = {
                id: 1, // Assumes single row with ID 1
                bio_p1: content['about_bio_p1'],
                bio_p2: content['about_bio_p2'],
                bio_p3: content['about_bio_p3'],
                bio_p4: content['about_bio_p4']
            };

            // Update Contact Info
            const contactUpdates = {
                id: 1, // Assumes single row with ID 1
                name: content['contact_name'],
                email: content['contact_email'],
                twitter_url: content['contact_twitter_url'],
                twitter_handle: content['contact_twitter_handle']
            };

            const { error: aboutError } = await supabase.from('about_us_content').upsert(aboutUpdates);
            if (aboutError) throw aboutError;

            const { error: contactError } = await supabase.from('contact_info').upsert(contactUpdates);
            if (contactError) throw contactError;

            alert('Contenido guardado correctamente');
        } catch (error) {
            alert('Error saving content: ' + error.message);
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h2>Panel de Administración</h2>
                <div className="admin-tabs">
                    <button 
                        className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                    <button 
                        className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        Contenido
                    </button>
                </div>
            </div>

            <div className="admin-content-card">
                {activeTab === 'users' ? (
                    <div className="users-section">
                        {/* Create User Form */}
                         <div className="create-user-form" style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Crear Nuevo Usuario</h3>
                            <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={newUserEmail} 
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    required
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                                />
                                <input 
                                    type="password" 
                                    placeholder="Contraseña" 
                                    value={newUserPassword} 
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    required
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                                />
                                <button type="submit" className="save-btn" disabled={newUserLoading}>
                                    {newUserLoading ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </form>
                            <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>
                                Nota: Al crear un usuario, es posible que se cierre tu sesión actual.
                            </p>
                        </div>

                        {/* Users Table */}
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge ${u.role}`}>{u.role}</span>
                                            </td>
                                            <td>
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                    style={{ marginRight: '1rem', padding: '0.2rem', borderRadius: '4px', background: '#333', color: 'white' }}
                                                >
                                                    <option value="usuario">Usuario</option>
                                                    <option value="escritor">Escritor</option>
                                                    <option value="administrador">Admin</option>
                                                </select>
                                                <button 
                                                    className="action-btn btn-delete"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="content-section">
                        <div className="edit-form-container">
                            <h3>Sobre Nosotros</h3>
                            <div className="form-field">
                                <label>Párrafo 1 (Intro)</label>
                                <textarea 
                                    value={content['about_bio_p1'] || ''}
                                    onChange={(e) => handleContentChange('about', 'bio_p1', e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label>Párrafo 2</label>
                                <textarea 
                                    value={content['about_bio_p2'] || ''}
                                    onChange={(e) => handleContentChange('about', 'bio_p2', e.target.value)}
                                />
                            </div>
                             <div className="form-field">
                                <label>Párrafo 3</label>
                                <textarea 
                                    value={content['about_bio_p3'] || ''}
                                    onChange={(e) => handleContentChange('about', 'bio_p3', e.target.value)}
                                />
                            </div>

                            <h3>Contacto</h3>
                            <div className="form-field">
                                <label>Email de Contacto</label>
                                <input 
                                    type="text"
                                    value={content['contact_email'] || ''}
                                    onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>

                            <button className="save-btn" onClick={handleSaveContent}>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
