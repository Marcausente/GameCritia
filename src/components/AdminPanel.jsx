import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

import ReviewEditor from './ReviewEditor';

const AdminPanel = () => {
    const { role, user } = useAuth();
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

    // Profile State
    const [profilePassword, setProfilePassword] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // New Profile State
    const [myProfile, setMyProfile] = useState({
        full_name: '',
        avatar_url: null,
        email: ''
    });
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMyProfile();
            setMyProfile(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const fetchMyProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setMyProfile(prev => ({
                    ...prev,
                    full_name: data.full_name || '',
                    avatar_url: data.avatar_url,
                    username: data.username
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleUpdateProfileInfo = async () => {
        setProfileLoading(true);
        try {
            // Update Profile Data
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: myProfile.full_name })
                .eq('id', user.id);

            if (error) throw error;

            // Update Password if provided
            if (profilePassword) {
                const { error: passError } = await supabase.auth.updateUser({ password: profilePassword });
                if (passError) throw passError;
                setProfilePassword('');
            }

            alert('Perfil actualizado correctamente');
        } catch (error) {
            alert('Error actualizando perfil: ' + error.message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdateAvatarNew = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfileLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('review-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('review-images')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setMyProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            alert('Avatar actualizado');
        } catch (error) {
            console.error(error);
            alert('Error al subir avatar');
        } finally {
            setProfileLoading(false);
        }
    };

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
            // Use RPC to create user without email confirmation
            const { data, error } = await supabase.rpc('create_user_admin', {
                new_email: newUserEmail,
                new_password: newUserPassword,
                new_role: 'usuario' // Default role
            });

            if (error) throw error;

            alert('Usuario creado con éxito (Verificado automáticamente).');
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();

        } catch (error) {
            console.error('Error creating user:', error);
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

    const handleUpdateAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm("¿Cambiar imagen de perfil?")) return;

        setProfileLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;

            // Upload to storage
            // Note: Assuming 'avatars' bucket exists, otherwise falling back to 'review-images' might be safer if we knew it exists
            // Using 'review-images' as it is confirmed to exist in ReviewEditor.
            const { error: uploadError } = await supabase.storage
                .from('review-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('review-images')
                .getPublicUrl(fileName);

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id); // Assuming profiles table matches auth.users logic

            if (updateError) throw updateError;

            alert('Imagen de perfil actualizada.');

            // Optionally refresh user/session if avatar is stored in session, but it's likely in profile
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Error al actualizar imagen: ' + error.message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSaveReviewSuccess = () => {
        setEditingReview(null); // Exit editor
        fetchReviews(); // Refresh list
    };



    return (
        <div className="admin-panel">
            {/* Modal Overlay */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowProfileModal(false)}>&times;</button>

                        <div className="profile-modal-header">
                            <h3>Mi Perfil</h3>
                            <div className="profile-large-avatar-container">
                                <img
                                    src={myProfile.avatar_url || 'https://via.placeholder.com/100'}
                                    alt="Profile"
                                    className="profile-large-avatar"
                                />
                                <label className="avatar-upload-label">
                                    Cambiar
                                    <input type="file" hidden accept="image/*" onChange={handleUpdateAvatarNew} />
                                </label>
                            </div>
                        </div>

                        <div className="modal-form-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                value={myProfile.full_name}
                                onChange={(e) => setMyProfile({ ...myProfile, full_name: e.target.value })}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Email (No editable)</label>
                            <input type="text" value={myProfile.email} disabled />
                        </div>

                        <div className="modal-form-group">
                            <label>Cambiar Contraseña</label>
                            <input
                                type="password"
                                value={profilePassword}
                                onChange={(e) => setProfilePassword(e.target.value)}
                                placeholder="Nueva contraseña (opcional)"
                            />
                        </div>

                        <button
                            className="save-btn"
                            onClick={handleUpdateProfileInfo}
                            disabled={profileLoading}
                        >
                            {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}

            <div className="admin-header">
                {/* Profile Trigger (Top Left) */}
                <div className="profile-trigger" onClick={() => setShowProfileModal(true)} title="Editar Perfil">
                    <img
                        src={myProfile.avatar_url || 'https://via.placeholder.com/100'}
                        alt="Profile"
                        className="profile-trigger-avatar"
                    />
                    <span className="profile-trigger-name">{myProfile.full_name || 'Mi Perfil'}</span>
                </div>

                <h2>Panel de Administración</h2>
                <div className="admin-tabs">
                    <button
                        className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                    {role === 'administrador' && (
                        <button
                            className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                            onClick={() => setActiveTab('content')}
                        >
                            Contenido
                        </button>
                    )}
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
                        {role === 'administrador' ? (
                            <div className="user-management-area">
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
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                                <h3>Panel de Escritor</h3>
                                <p>Gestiona tus reseñas desde la pestaña 'Reseñas'.</p>
                                <p>Para editar tu perfil, haz clic en tu avatar arriba a la izquierda.</p>
                            </div>
                        )}
                    </div>
                )}
                {/* Content and Reviews sections remain same logic-wise, just need to ensure closing tags are correct */}


                {activeTab === 'content' && (
                    <div className="content-section">
                        {/* ... Content of Content Tab ... */}
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
                                        {reviews.map(r => {
                                            const canEdit = role === 'administrador' || (user && r.user_id === user.id);
                                            const canDelete = role === 'administrador';
                                            return (
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
                                                            style={{
                                                                marginRight: '0.5rem',
                                                                background: canEdit ? '#444' : '#222',
                                                                opacity: canEdit ? 1 : 0.5,
                                                                cursor: canEdit ? 'pointer' : 'not-allowed'
                                                            }}
                                                            disabled={!canEdit}
                                                            title={!canEdit ? "Solo puedes editar tus propias reseñas" : "Editar"}
                                                        >
                                                            Editar
                                                        </button>
                                                        {canDelete && (
                                                            <button
                                                                className="action-btn btn-delete"
                                                                onClick={() => handleDeleteReview(r.id)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
        </div >
    );
};

export default AdminPanel;
