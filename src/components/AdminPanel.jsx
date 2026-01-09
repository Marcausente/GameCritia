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
            const { data, error } = await supabase.from('site_content').select('*');
            if (error) throw error;
            
            // Transform array to object { section_key: content }
            const contentMap = {};
            data.forEach(item => {
                contentMap[`${item.section}_${item.key}`] = item.content;
            });
            setContent(contentMap);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    // --- User Actions ---

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
            // WARNING: supabase.auth.signUp signs in the user immediately in the client.
            // We need to avoid losing the admin session.
            // WORKAROUND: We can use a fetch call to the GoTrue API manually or use a temporary client if keys allow.
            // Simpler approach for this specific request: Alert user about session loss or try standard signUp and re-login (too disruptive).
            
            // For now, let's try the standard signUp. If it logs us out, so be it (it's a known trade-off without a backend proxy).
            // Actually, we can check if it creates the user.
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

    const handleContentChange = (section, key, value) => {
        setContent(prev => ({ ...prev, [`${section}_${key}`]: value }));
    };

    const handleSaveContent = async () => {
        try {
            const updates = Object.keys(content).map(compoundKey => {
                const [section, ...keyParts] = compoundKey.split('_');
                const key = keyParts.join('_');
                return {
                    section: section,
                    key: key,
                    content: content[compoundKey]
                };
            });

            const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'section, key' });
            if (error) throw error;
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
