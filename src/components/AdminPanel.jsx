import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminPanel.css';

import ReviewEditor from './ReviewEditor';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users'); // users, content, reviews
    const [users, setUsers] = useState([]);
    const [content, setContent] = useState({});
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null); // null = list mode, {} = create new, object = edit
    
    // User Management State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserLoading, setNewUserLoading] = useState(false);

    // Saving State
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'users') {
            await fetchUsers();
        } else if (activeTab === 'content') {
            await fetchContent();
        } else if (activeTab === 'reviews') {
            await fetchReviews();
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        // ... (unchanged)
        try {
            const { data, error } = await supabase.rpc('get_all_users_admin');
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchContent = async () => {
        // ... (unchanged)
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
                newContent['about_bio'] = aboutData.bio;
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

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    // --- User Actions ---
    // ... (unchanged)

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const { error } = await supabase.rpc('update_user_role', { 
                target_user_id: userId, 
                new_role: newRole 
            });
            if (error) throw error;
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Error updating role: ' + error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return;
        
        try {
            const { error } = await supabase.rpc('delete_user_by_id', { target_user_id: userId });
            if (error) throw error;
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Error deleting user: ' + error.message);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setNewUserLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPassword,
            });

            if (error) throw error;

            alert('Usuario creado con éxito. Actualiza la lista.');
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();
            
        } catch (error) {
            alert('Error creating user: ' + error.message);
        } finally {
            setNewUserLoading(false);
        }
    };

    // --- Content Actions ---
    // ... (unchanged)

    const handleContentChange = (section, key, value) => {
        setContent(prev => ({ ...prev, [`${section}_${key}`]: value }));
    };

    const handleSaveContent = async () => {
        console.log("Saving content...", content);
        setSaveLoading(true);
        try {
            // Update About Us
            const aboutUpdates = {
                id: 1, 
                bio: content['about_bio']
            };

            // Update Contact Info
            const contactUpdates = {
                id: 1, 
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
            console.error("Save error:", error);
            alert('Error saving content: ' + error.message);
        } finally {
            setSaveLoading(false);
        }
    };

    // --- Review Actions ---

    const handleDeleteReview = async (id) => {
        if (!window.confirm('¿Eliminar reseña permanentemente?')) return;
        try {
            const { error } = await supabase.from('reviews').delete().eq('id', id);
            if (error) throw error;
            fetchReviews();
        } catch (error) {
            console.error(error);
            alert('Error deleting review');
        }
    };

    const handleSaveReviewSuccess = () => {
        setEditingReview(null); // Exit editor
        fetchReviews(); // Refresh list
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
                    <button 
                        className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reseñas
                    </button>
                </div>
            </div>

            <div className="admin-content-card">
                {activeTab === 'users' && (
                    <div className="users-section">
                        {/* Users Table */}
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
                )}

                {activeTab === 'content' && (
                    <div className="content-section">
                        <div className="edit-form-container">
                            <h3>Sobre Nosotros</h3>
                            <div className="form-field">
                                <label>Biografía (Párrafo Único)</label>
                                <textarea 
                                    value={content['about_bio'] || ''}
                                    onChange={(e) => handleContentChange('about', 'bio', e.target.value)}
                                    style={{ minHeight: '300px' }}
                                />
                            </div>

                            <h3>Contacto</h3>
                            <div className="form-field">
                                <label>Nombre de Contacto</label>
                                <input 
                                    type="text"
                                    value={content['contact_name'] || ''}
                                    onChange={(e) => handleContentChange('contact', 'name', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                            <div className="form-field">
                                <label>Email de Contacto</label>
                                <input 
                                    type="text"
                                    value={content['contact_email'] || ''}
                                    onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                            <div className="form-field">
                                <label>URL Twitter</label>
                                <input 
                                    type="text"
                                    value={content['contact_twitter_url'] || ''}
                                    onChange={(e) => handleContentChange('contact', 'twitter_url', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                            <div className="form-field">
                                <label>Usuario Twitter</label>
                                <input 
                                    type="text"
                                    value={content['contact_twitter_handle'] || ''}
                                    onChange={(e) => handleContentChange('contact', 'twitter_handle', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>

                            <button className="save-btn" onClick={handleSaveContent} disabled={saveLoading}>
                                {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="reviews-section">
                        {!editingReview ? (
                            <div className="reviews-list-container">
                                <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>Reseñas Publicadas</h3>
                                    <button className="create-btn" onClick={() => setEditingReview({})} style={{ background: '#20B2AA', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                        + Nueva Reseña
                                    </button>
                                </div>
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Autor</th>
                                            <th>Nota</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.title}</td>
                                                <td>{r.author}</td>
                                                <td>
                                                    <span style={{ fontWeight: 'bold' }}>{r.rating}</span>
                                                </td>
                                                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button 
                                                        className="action-btn" 
                                                        onClick={() => setEditingReview(r)}
                                                        style={{ marginRight: '0.5rem', background: '#444' }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="action-btn btn-delete"
                                                        onClick={() => handleDeleteReview(r.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reviews.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', color: '#aaa' }}>No hay reseñas creadas.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ReviewEditor 
                                review={editingReview} 
                                onSave={handleSaveReviewSuccess} 
                                onCancel={() => setEditingReview(null)} 
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
