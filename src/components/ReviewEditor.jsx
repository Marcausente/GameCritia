import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import './ReviewEditor.css';

// Simple SVG Icons
const Icons = {
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    Type: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    Heading: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg>,
    Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    ArrowUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    ArrowDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

const ReviewEditor = ({ review, onSave, onCancel }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        rating: 5,
        cover_image: '',
        author: '',
        content: [],
        ...review
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!formData.author) {
            supabase.auth.getUser().then(({ data }) => {
                if (data?.user) {
                    supabase.from('contact_info').select('name').single().then(({ data: contact }) => {
                         setFormData(prev => ({ ...prev, author: contact?.name || 'Admin' }));
                    });
                }
            });
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getRatingColor = (rating) => {
        if (rating >= 9.5) return '#FFD700';
        if (rating >= 8) return '#20B2AA';
        if (rating >= 7) return '#90EE90';
        if (rating >= 6) return '#FFFF00';
        if (rating >= 5) return '#808080';
        if (rating >= 3) return '#FF4500';
        return '#8B0000';
    };

    const handleImageUpload = async (file) => {
        if (!file) return null;
        
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        try {
            setUploading(true);
            const compressedFile = await imageCompression(file, options);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('review-images')
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('review-images').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleImageUpload(file);
            if (url) {
                setFormData(prev => ({ ...prev, cover_image: url }));
            }
        }
    };

    // --- Block Actions ---

    const addBlock = (type) => {
        setFormData(prev => ({
            ...prev,
            content: [...prev.content, { type, value: '', caption: '' }]
        }));
    };

    const updateBlock = (index, field, value) => {
        const newContent = [...formData.content];
        newContent[index][field] = value;
        setFormData(prev => ({ ...prev, content: newContent }));
    };

    const removeBlock = (index) => {
        const newContent = formData.content.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, content: newContent }));
    };
    
    const moveBlock = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === formData.content.length - 1) return;

        const newContent = [...formData.content];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newContent[index], newContent[swapIndex]] = [newContent[swapIndex], newContent[index]];
        
        setFormData(prev => ({ ...prev, content: newContent }));
    };

    const handleBlockImageUpload = async (index, file) => {
        const url = await handleImageUpload(file);
        if (url) {
            updateBlock(index, 'value', url);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!formData.title) return alert('El título es obligatorio');

            const reviewData = {
                title: formData.title,
                subtitle: formData.subtitle,
                rating: formData.rating,
                cover_image: formData.cover_image,
                author: formData.author,
                content: formData.content,
                ...(formData.id && { id: formData.id }) 
            };

            const { error } = await supabase.from('reviews').upsert(reviewData);

            if (error) throw error;
            alert('Reseña guardada correctamente');
            onSave();
        } catch (error) {
            console.error(error);
            alert('Error guardando reseña: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-editor">
            <div className="editor-header">
                <h2>{formData.id ? 'Editar Reseña' : 'Nueva Reseña'}</h2>
                <div className="editor-actions">
                    <button onClick={onCancel} className="cancel-btn">Cancelar</button>
                    <button onClick={handleSave} className="save-btn" disabled={loading || uploading}>
                        {loading ? 'Guardando...' : 'Guardar Reseña'}
                    </button>
                </div>
            </div>

            <div className="editor-grid">
                {/* Metadata Column */}
                <div className="metadata-card">
                    <h3>Información General</h3>
                    
                    <div className="form-field">
                        <label>Título</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Elden Ring, God of War..." />
                    </div>

                    <div className="form-field">
                        <label>Subtítulo</label>
                        <input name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Una obra maestra..." />
                    </div>

                    <div className="form-field">
                        <label>Autor</label>
                        <input name="author" value={formData.author} onChange={handleInputChange} />
                    </div>

                    <div className="form-field">
                        <label>Nota (0 - 10)</label>
                        <div className="rating-input-container">
                            <input 
                                className="rating-number-input"
                                type="number" 
                                name="rating" 
                                value={formData.rating} 
                                onChange={handleInputChange} 
                                min="0" max="10" step="0.1"
                            />
                            <div 
                                className="rating-visual"
                                style={{ backgroundColor: getRatingColor(formData.rating) }}
                            >
                                {formData.rating}
                            </div>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Imagen de Portada</label>
                        <div className="file-upload-wrapper" onClick={() => fileInputRef.current?.click()}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                onChange={handleCoverImageChange} 
                            />
                            {formData.cover_image ? (
                                <img src={formData.cover_image} alt="Cover" className="cover-preview" />
                            ) : (
                                <div className="upload-placeholder">
                                    <Icons.Upload />
                                    <span>{uploading ? 'Subiendo...' : 'Click para subir imagen'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="content-editor-card">
                    <h3>Cuerpo de la Reseña</h3>
                    
                    <div className="blocks-container">
                        {formData.content.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem', border: '1px dashed #444', borderRadius: '8px' }}>
                                Empieza añadiendo bloques de contenido abajo
                            </div>
                        )}
                        {formData.content.map((block, index) => (
                            <div key={index} className="content-block">
                                <div className="block-header">
                                    <span className="block-type">{block.type === 'text' ? 'TEXTO' : block.type === 'image' ? 'IMAGEN' : 'ENCABEZADO'}</span>
                                    <div className="block-controls">
                                        <button className="icon-btn" onClick={() => moveBlock(index, 'up')} disabled={index === 0} title="Mover arriba">
                                            <Icons.ArrowUp />
                                        </button>
                                        <button className="icon-btn" onClick={() => moveBlock(index, 'down')} disabled={index === formData.content.length - 1} title="Mover abajo">
                                            <Icons.ArrowDown />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => removeBlock(index)} title="Eliminar bloque">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>

                                <div className="block-body">
                                    {block.type === 'header' && (
                                        <input 
                                            value={block.value} 
                                            onChange={(e) => updateBlock(index, 'value', e.target.value)}
                                            placeholder="Escribe el título de la sección..."
                                            className="block-input header-input"
                                            autoFocus
                                        />
                                    )}

                                    {block.type === 'text' && (
                                        <textarea 
                                            value={block.value} 
                                            onChange={(e) => updateBlock(index, 'value', e.target.value)}
                                            placeholder="Escribe aquí el contenido del párrafo..."
                                            className="block-textarea"
                                            rows={5}
                                            autoFocus
                                        />
                                    )}

                                    {block.type === 'image' && (
                                        <div className="image-block-content">
                                            {!block.value ? (
                                                <label className="block-image-upload">
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleBlockImageUpload(index, e.target.files[0])} />
                                                    <div className="upload-placeholder">
                                                        <Icons.Image />
                                                        <span>{uploading ? 'Subiendo...' : 'Seleccionar imagen'}</span>
                                                    </div>
                                                </label>
                                            ) : (
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                     <img src={block.value} alt="Content" className="block-image-preview" />
                                                     <button 
                                                        onClick={() => updateBlock(index, 'value', '')}
                                                        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px', borderRadius: '4px' }}
                                                     >
                                                        Cambiar Imagen
                                                     </button>
                                                </div>
                                            )}
                                            <input 
                                                value={block.caption} 
                                                onChange={(e) => updateBlock(index, 'caption', e.target.value)}
                                                placeholder="Pie de foto (opcional)"
                                                className="block-input caption-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-block-controls">
                        <button className="add-block-btn" onClick={() => addBlock('text')}>
                            <Icons.Type /> Añadir Texto
                        </button>
                        <button className="add-block-btn" onClick={() => addBlock('image')}>
                            <Icons.Image /> Añadir Imagen
                        </button>
                        <button className="add-block-btn" onClick={() => addBlock('header')}>
                            <Icons.Heading /> Añadir Encabezado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewEditor;
