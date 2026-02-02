import React, { useState } from 'react';
import { useDialog } from '../contexts/DialogContext';
import JSZip from 'jszip';
import { createNpcRole } from '../utils/hytaleFormat';

export default function NPCGenerator() {
  const { showAlert } = useDialog();
  const [files, setFiles] = useState([]);
  const [npcName, setNpcName] = useState('');
  const [mainModelName, setMainModelName] = useState('');
  const [behaviorType, setBehaviorType] = useState('Interactive');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [detectedModels, setDetectedModels] = useState([]); // {id, file, rel, main}
  const [detectedTextures, setDetectedTextures] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [draggedOverIdx, setDraggedOverIdx] = useState(null);

  const handleFolderSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    if (selectedFiles.length > 0) {
      const firstPath = selectedFiles[0].webkitRelativePath;
      const pathParts = firstPath.split('/');
      const detectedName = pathParts[0];
      setNpcName(detectedName);

      const models = selectedFiles
        .filter(f => f.name.endsWith('.blockymodel'))
        .map((f, index) => ({
          id: f.name.replace('.blockymodel', ''),
          file: f.name,
          rel: f.webkitRelativePath,
          main: f.name.toLowerCase().includes('model') || f.name.toLowerCase().includes('main') || index === 0
        }));

      const textures = selectedFiles
        .filter(f => f.name.endsWith('.png'))
        .map(f => ({
          file: f.name,
          rel: f.webkitRelativePath
        }));

      // Ensure only one main model
      let hasMain = false;
      models.forEach(m => {
        if (m.main && !hasMain) hasMain = true;
        else m.main = false;
      });
      if (!hasMain && models.length > 0) models[0].main = true;

      setDetectedModels(models);
      setDetectedTextures(textures);
    }

    setStatus(`${selectedFiles.length} files loaded`);
  };

  const generateAssets = () => {
    if (files.length === 0) {
      showAlert('Please load some files first.', 'No Files');
      return;
    }

    if (!npcName.trim()) {
      showAlert('You must specify a name for the NPC.', 'Missing Name');
      return;
    }

    setStatus('Processing...');

    // Helper to normalize paths to Hytale format: NPC/[npcName]/[InternalPath]
    const normalizePath = (path) => {
      if (!path) return '';
      const parts = path.split('/');
      // Remove the local root folder and prepend NPC/[npcName]
      parts.shift();
      return `NPC/${npcName}/${parts.join('/')}`;
    };

    // Use user-defined configuration from state
    const mainModel = detectedModels.find(m => m.main) || detectedModels[0];
    const otherModels = detectedModels.filter(m => !m.main);

    const mainTexture = detectedTextures.find(t =>
      t.file.toLowerCase().includes(mainModel.id.toLowerCase())
    ) || detectedTextures.find(t =>
      t.file.toLowerCase().includes('greyscale') ||
      t.file.toLowerCase().includes(npcName.toLowerCase())
    ) || detectedTextures[0] || { rel: '' };

    const attachments = otherModels.map(m => {
      const modelNameClean = m.id.toLowerCase();
      const textureMatch = detectedTextures.find(t =>
        modelNameClean.includes(t.file.replace('.png', '').toLowerCase())
      );

      const item = {
        Model: normalizePath(m.rel),
        Texture: textureMatch ? normalizePath(textureMatch.rel) : (mainTexture.rel ? normalizePath(mainTexture.rel) : '')
      };

      const mLower = m.file.toLowerCase();
      if (['hair', 'greaser', 'beard'].some(x => mLower.includes(x))) {
        item.GradientSet = 'Hair';
        item.GradientId = 'Black';
      } else if (['ears', 'mouth', 'face', 'eyes'].some(x => mLower.includes(x))) {
        item.GradientSet = 'Skin';
        item.GradientId = '03';
      } else if (['tshirt', 'shirt', 'top', 'vneck', 'armor'].some(x => mLower.includes(x))) {
        item.GradientSet = 'Fantasy_Cotton';
        item.GradientId = 'Brown';
      } else if (['pants', 'shorts', 'leg', 'shorty'].some(x => mLower.includes(x))) {
        item.GradientSet = 'Jean_Generic';
        item.GradientId = 'Green';
      } else if (['boots', 'shoes', 'gloves'].some(x => mLower.includes(x))) {
        item.GradientSet = 'Fantasy_Cotton';
        item.GradientId = 'Brown';
      }

      return item;
    });

    const appearance = {
      Parent: 'Player',
      Model: normalizePath(mainModel.rel),
      Texture: mainTexture.rel ? normalizePath(mainTexture.rel) : '',
      GradientSet: 'Skin',
      GradientId: '03',
      DefaultAttachments: attachments
    };

    const role = createNpcRole({
      id: npcName,
      displayName: npcName,
      behaviorType,
      isStatic: behaviorType === 'Interactive'
    });

    if (behaviorType === 'Aggressive') {
      role.Modify.DefaultPlayerAttitude = 'Hostile';
      role.Modify.ViewSector = 250;
      role.Modify.HearingRange = 10;
      role.Modify.AttackDistance = 2.5;
      role.Modify.UseCombatActionEvaluator = true;
      role.Modify.MaxSpeed = 12;
      role.Modify.MaxHealth = 200;
    } else if (behaviorType === 'Neutral') {
      role.Modify.DefaultPlayerAttitude = 'Neutral';
      role.Modify.MaxHealth = 150;
      role.Modify.MaxSpeed = 8;
    } else if (behaviorType === 'Passive') {
      role.Modify.DefaultPlayerAttitude = 'Neutral';
      role.Modify.MaxHealth = 100;
      role.Modify.MaxSpeed = 6;
    }

    setResults({
      appearance,
      role,
      mainModelPath: normalizePath(mainModel.rel),
      attachmentsCount: attachments.length
    });

    showAlert('NPC assets generated successfully!', 'Success');
    setStatus('');
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 4)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (!results) return;

    const zip = new JSZip();
    const serverFolder = zip.folder("Server");
    const modelsFolder = serverFolder.folder("Models").folder("Human");
    const npcFolder = serverFolder.folder("NPC");
    const rolesFolder = npcFolder.folder("Roles");

    // Add Appearance JSON
    modelsFolder.file(`${npcName}.json`, JSON.stringify(results.appearance, null, 4));

    // Add Role JSON
    rolesFolder.file(`${npcName}.json`, JSON.stringify(results.role, null, 4));

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AvalonNPC_${npcName}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      showAlert('Your files have been bundled into the complete Server structure ZIP.', 'Download Ready');
    } catch (err) {
      console.error(err);
      showAlert('There was an error generating the ZIP file.', 'Error');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      padding: '40px',
      border: '1px solid var(--border-color)',
      borderTop: '1px solid var(--border-highlight)',
      backdropFilter: 'blur(10px)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 10px 0',
          color: 'var(--text-highlight)',
          fontFamily: "'Lexend', sans-serif"
        }}>
          NPC Generator
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          margin: 0,
          fontSize: '16px'
        }}>
          Generate appearance and role files for Hytale NPCs using Blockbench models
        </p>
      </div>

      {/* Upload Area */}
      <div style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '30px',
        background: 'var(--bg-primary)',
        transition: 'all 0.3s'
      }}>
        <input
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
          id="folderInput"
        />
        <label
          htmlFor="folderInput"
          className="btn btn-primary"
          style={{
            padding: '14px 28px',
            fontSize: '15px'
          }}
        >
          Select NPC Folder
        </label>
        <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {files.length > 0
            ? `✓ ${files.length} files loaded`
            : 'Select the Models folder containing Model.blockymodel and textures'}
        </p>
      </div>

      {/* Form Fields */}
      <div style={{
        display: 'grid',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            NPC Name
          </label>
          <input
            type="text"
            value={npcName}
            onChange={(e) => setNpcName(e.target.value)}
            placeholder="Ex: Guardian, Merchant, etc."
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '15px',
              color: 'white',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102,126,234,0.5)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '14px'
          }}>
            Main model (e.g., Model.blockymodel)
          </label>
          <input
            type="text"
            value={mainModelName}
            onChange={(e) => setMainModelName(e.target.value)}
            placeholder="Name of the base .blockymodel file"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-blue)';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 150, 255, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '5px', display: 'block' }}>
            If empty, it will be detected automatically
          </small>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Behavior Type
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Interactive', 'Passive', 'Neutral', 'Aggressive'].map(type => {
              const isDisabled = type !== 'Interactive';
              return (
                <button
                  key={type}
                  onClick={() => !isDisabled && setBehaviorType(type)}
                  disabled={isDisabled}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: behaviorType === type ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${behaviorType === type ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    color: behaviorType === type ? 'white' : 'var(--text-secondary)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  title={isDisabled ? "Temporarily disabled waiting for templates" : ""}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <small style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px', display: 'block' }}>
            {behaviorType === 'Aggressive' && 'Attacks players on sight. High speed and health.'}
            {behaviorType === 'Neutral' && 'Peaceful unless attacked. Balanced stats.'}
            {behaviorType === 'Passive' && 'Standard friendly NPC. Low health.'}
            {behaviorType === 'Interactive' && 'Merchant/Social NPC. Supports shop and interaction logic.'}
          </small>
        </div>


      </div>

      {/* Model Management & Priorities */}
      {detectedModels.length > 0 && (
        <div style={{
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-highlight)' }}>
            Model Management & Priorities
          </h3>

          {/* Main Model - Fixed Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Base Model (Body)
            </div>
            {detectedModels.filter(m => m.main).map((model) => (
              <div key={model.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '16px',
                background: 'rgba(0, 150, 255, 0.1)',
                border: '1px solid var(--accent-blue)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>{model.id}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{model.rel}</div>
                </div>
                <div style={{ fontSize: '10px', background: 'var(--accent-blue)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  FIXED ROOT
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

          {/* Attachments - Draggable Section */}
          <div onDragOver={(e) => e.preventDefault()}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Attachments (Drag to reorder priority)</span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>Top = Higher Priority</span>
              </div>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                onDragOver={(e) => e.preventDefault()}
              >
                {detectedModels.filter(m => !m.main).map((model, idx) => {
                  const isDragging = draggedIdx === idx;
                  const isOver = draggedOverIdx === idx;

                  return (
                    <div
                      key={model.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIdx(idx);
                        e.dataTransfer.effectAllowed = "move";
                        // Smaller ghost image
                        const ghost = e.currentTarget.cloneNode(true);
                        ghost.style.width = "200px";
                        ghost.style.position = "absolute";
                        ghost.style.top = "-1000px";
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, 0, 0);
                        setTimeout(() => document.body.removeChild(ghost), 0);
                      }}
                      onDragEnd={() => {
                        setDraggedIdx(null);
                        setDraggedOverIdx(null);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDraggedOverIdx(idx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDraggedOverIdx(idx);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIdx === null || draggedIdx === idx) return;

                        const attachments = detectedModels.filter(m => !m.main);
                        const mainModel = detectedModels.find(m => m.main);

                        const newAttachments = [...attachments];
                        const [movedItem] = newAttachments.splice(draggedIdx, 1);
                        newAttachments.splice(idx, 0, movedItem);

                        setDetectedModels([mainModel, ...newAttachments]);
                        setDraggedIdx(null);
                        setDraggedOverIdx(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '12px 16px',
                        background: isDragging ? 'rgba(255,255,255,0.02)' : (isOver ? 'rgba(0, 150, 255, 0.15)' : 'rgba(255,255,255,0.05)'),
                        border: isOver ? '1px solid var(--accent-blue)' : (isDragging ? '1px dashed rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)'),
                        borderRadius: '8px',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isDragging ? 0.5 : 1,
                        transform: isOver ? 'scale(1.02)' : 'scale(1)',
                        position: 'relative',
                        zIndex: isOver ? 10 : 1
                      }}
                    >
                      <div style={{
                        color: isOver ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontSize: '18px',
                        width: '24px',
                        textAlign: 'center'
                      }}>
                        {isDragging ? '✋' : '⣿'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: isOver ? 'var(--accent-blue)' : 'white' }}>
                          {model.id}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {model.rel.split('/').slice(-1)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const all = [...detectedModels];
                            const mIdx = all.findIndex(m => m.id === model.id);
                            all.forEach(m => m.main = false);
                            all[mIdx].main = true;
                            setDetectedModels(all);
                          }}
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px'
                          }}
                        >
                          Set Main
                        </button>
                      </div>
                      {isOver && draggedIdx !== idx && (
                        <div style={{
                          position: 'absolute',
                          top: draggedIdx < idx ? 'auto' : '-4px',
                          bottom: draggedIdx > idx ? 'auto' : '-4px',
                          left: '0',
                          right: '0',
                          height: '4px',
                          background: 'var(--accent-blue)',
                          borderRadius: '2px',
                          boxShadow: '0 0 8px var(--accent-blue)'
                        }} />
                      )}
                    </div>
                  );
                })}

                {detectedModels.filter(m => !m.main).length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    No extra models found to use as attachments.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateAssets}
        disabled={files.length === 0}
        className={`btn ${files.length === 0 ? '' : 'btn-primary'}`}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        Generate Assets
      </button>

      {/* Status Message */}
      {status && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 150, 255, 0.1)',
          border: '1px solid var(--accent-blue)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          color: 'var(--accent-blue)',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{
          background: 'rgba(102,126,234,0.08)',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid rgba(102,126,234,0.2)'
        }}>
          <h3 style={{ marginTop: 0, color: 'white', fontSize: '20px', fontWeight: '600' }}>
            Results
          </h3>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: 'white' }}>Base Model:</strong> {results.mainModelPath}
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: 'white' }}>Parts Found:</strong> {results.attachmentsCount}
            </p>
          </div>

          <button
            onClick={downloadAll}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              background: 'var(--accent-green)',
              fontSize: '15px'
            }}
          >
            Download JSON Files
          </button>

          <details style={{ marginTop: '25px' }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              outline: 'none'
            }}>
              View Appearance JSON
            </summary>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(results.appearance, null, 2)}
            </pre>
          </details>

          <details style={{ marginTop: '15px' }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              outline: 'none'
            }}>
              View Role JSON
            </summary>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(results.role, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
